""" A script that takes in the raw covid19_tweets data and 
    calcualtes the sentiment label and score for each tweet
"""
import pandas as pd
from pathlib import Path
from tqdm import tqdm
from transformers import pipeline
from tweet import config


# Helper function
def get_sentiment(text):
    res = classifier(text)[0]
    return res['label'], res['score']


if __name__ == '__main__':
    # Read in the data
    df_path = config.data / 'data' / 'covid19_tweets.csv'
    df = pd.read_csv(df_path)
    tweets = df['text'].values

    # Use hugging face for sentiment scoring
    # nlptown/bert-base-multilingual-uncased-sentiment
    classifier = pipeline('sentiment-analysis')
    sentiment = []
    sentiment_score = []

    for idx in tqdm(range(len(tweets))):
        tweet = tweets[idx]
        label, score = get_sentiment(tweet)
        sentiment.append(label)
        sentiment_score.append(score)

    df['sentiment'] = sentiment
    df['sentiment_score'] = sentiment_score
    df.to_csv(REPO_ROOT / 'data' / 'covid19_tweets_sentiment.csv', index=None)
