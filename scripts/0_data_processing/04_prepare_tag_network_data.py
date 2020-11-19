import re
import json
import pandas as pd
import numpy as np
from tweet import config
from itertools import combinations


def extractHashTags(tweets, preprocess=False):
    '''Extract #hashtag information from tweets'''
    pattern = r"\#\w+"
    hashtag = []
    for t in tweets:
        if preprocess:
            raw_tags = re.findall(pattern, t)
            tags = []
            for t in raw_tags:
                if 'covid' in t.lower() or 'virus' in t.lower():
                    t = t[1:].lower().replace("_", "").replace("ー", "")
                    # Collapse covid and covid19
                    if t == "covid":
                        t = "covid19"
                    if 'corona' in t:
                        t = 'coronavirus'
                    tags.append("#" + t.title())
                else:
                    tags.append(t)
        else:
            tags = re.findall(pattern, t)
        hashtag.append(tags)
    return hashtag


def save_json(node_json, edge_json, node_path, edge_path):
    """ Save the json files to disk
    """
    with open(node_path, 'w') as outfile:
        json.dump(node_json, outfile)
    with open(edge_path, 'w') as outfile:
        json.dump(edge_json, outfile)


def create_json(df, hashtag_list):
    """ Use this function for getting data ready for d3
    """
    # Parse Nodes json
    node_json = {'nodes': []}

    for hashtags, row_id, date, senti in zip(hashtag_list, df['id'], df['date_short'], df['senti']):
        for tag in hashtags:
            node_info = {'row_id': row_id,
                         'date': date,
                         'tag': tag,
                         'senti': senti}
            node_json['nodes'].append(node_info)

    print("Total number of hashtags parsed:", len(node_json['nodes']))

    # Parse Edges json
    edge_json = {'edges': []}
    for hashtags, row_id, date in zip(hashtag_list, df['id'], df['date_short']):
        # Generate tag pairs
        tag_pairs = list(combinations(hashtags, r=2))
        for a, b in tag_pairs:
            edge_info = {'row_id': row_id,
                         'date': date,
                         'source_tag': a,
                         'target_tag': b}
            edge_json['edges'].append(edge_info)
    print("Total number of edges parsed:", len(edge_json['edges']))

    # Add node id to both dicts
    unique_tags = list(set(tag['tag'] for tag in node_json['nodes']))
    node_2_id = {t: i for i, t in enumerate(unique_tags)}

    for node_info in node_json['nodes']:
        node_info.update({"tag_id":node_2_id[node_info['tag']]})

    for edge_info in edge_json['edges']:
        source = node_2_id[edge_info['source_tag']]
        target = node_2_id[edge_info['target_tag']]
        edge_info.update({'source': source, 'target': target})

    return node_json, edge_json


if __name__ == '__main__':

    # Read in data
    df = pd.read_csv(config.data / 'covid19_tweets_final.csv')
    df['senti'] = (np.where(df['sentiment_tag_hf'] == "NEGATIVE", -1, 1)) * df['sentiment_score_hf']

    # Create save path
    tag_net_path = config.data / 'tag_network'
    if not tag_net_path.exists():
        tag_net_path.mkdir()
    node_path = tag_net_path / 'node.json'
    edge_path = tag_net_path / 'edge.json'

    # Create nodes and edges json
    hashtag_list = extractHashTags(df['full_text'], preprocess=True)
    node_json, edge_json = create_json(df, hashtag_list)
    save_json(node_json, edge_json, node_path, edge_path)
