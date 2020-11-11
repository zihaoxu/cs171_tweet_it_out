import os
import tweepy
import csv
import pandas as pd
from tweet import config, utils


if __name__ == '__main__':

    # Define keys
    consumer_key = os.environ["CONSUMER_KEY"]
    consumer_secret = os.environ["CONSUMER_SECRET"]
    auth = tweepy.AppAuthHandler(consumer_key, consumer_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)

    # Define dirs
    ID_dir = config.data / 'covid19_id_reduced_11_07'
    f_list = sorted(ID_dir.iterdir())
    save_path = config.data / 'covid19_tweets_id_subset5.csv'

    columns = ['user_name','user_location', 'user_description', 'user_created', 'user_followers', 'user_friends',
               'user_favourites', 'user_verified', 'date', 'full_text', 'hashtags', 'source', 'lang']

    with open(save_path, 'a', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=columns)
        for date_df in f_list:
            date = pd.read_csv(date_df).columns[0]
            IDs = pd.read_csv(date_df).values.flatten()
            n_processed = len(IDs)
            for tweet_id in IDs:
                try:
                    row_info = utils.get_tweet_data_by_id(tweet_id, api)
                    writer.writerow(row_info)
                except Exception:
                    n_processed -= 1
                    continue
            print("Processed:", date, "n_processed:", n_processed,\
                  "n_not_found:", len(IDs)-n_processed)
