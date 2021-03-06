""" A script that downloads all tweets assocaited with a queay
    only available for the past 7 days: "The Twitter Search API searches 
    against a sampling of recent Tweets published in the past 7 days."
"""
import os
import tweepy
import csv
from tweet import config, utils
import pandas as pd


if __name__ == '__main__':
    # Get API keys
    consumer_key = os.environ["CONSUMER_KEY"]
    consumer_secret = os.environ["CONSUMER_SECRET"]

    auth = tweepy.AppAuthHandler(consumer_key, consumer_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)

    # Define Consts
    counter = 0
    search_words = "#covid19 -filter:retweets"
    date_list = pd.date_range('2020-03-01', '2020-11-01').date
    save_path = config.data / 'covid19_tweets_search.csv'
    columns = ['user_name', 'user_location', 'user_description', 'user_created', 'user_followers', 'user_friends',
               'user_favourites', 'user_verified', 'date', 'full_text', 'hashtags', 'source']

    with open(save_path, 'a', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=columns)
        for since, until in zip(date_list, date_list[1:]):
            for tweet in tweepy.Cursor(api.search,
                                       q=search_words,
                                       lang="en",
                                       since=str(since),
                                       until=str(until),
                                       tweet_mode='extended').items(100):
                try:
                    counter += 1
                    row_info = utils.get_tweet_data(tweet)
                    writer.writerow(row_info)
                except Exception:
                    continue
            print("Processing:", str(since), str(until), "Counter:", counter)
    df = pd.read_csv(save_path)
    print(df.shape)
