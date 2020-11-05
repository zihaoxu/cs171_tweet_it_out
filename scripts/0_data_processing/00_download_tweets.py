import os
import tweepy
import csv
from tweet import config


def get_tweet_data(tweet):
    """ A function that extracts the info from a given tweet
    """
    # Gather any hashtags
    hashtags = []
    for hashtag in tweet.entities["hashtags"]:
        hashtags.append(hashtag["text"])

    # Extract the info
    row_info = {'user_name': tweet.user.name,
                'user_location': tweet.user.location,
                'user_description': tweet.user.description,
                'user_created': tweet.user.created_at,
                'user_followers': tweet.user.followers_count,
                'user_friends': tweet.user.friends_count,
                'user_favourites': tweet.user.favourites_count,
                'user_verified': tweet.user.verified,
                'date': tweet.created_at,
                'full_text': tweet.full_text.encode('utf-8'),
                'hashtags': hashtags if hashtags else None,
                'source': tweet.source}
    return row_info


if __name__ == '__main__':
    # Get API keys
    consumer_key = os.environ["CONSUMER_KEY"]
    consumer_secret = os.environ["CONSUMER_SECRET"]

    auth = tweepy.AppAuthHandler(consumer_key, consumer_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)

    # Define Consts
    search_words = "#covid19 -filter:retweets"
    date_since = "2020-03-01"
    # Could add until="2015-10-11"
    save_path = config.data / 'covid19_tweets_new.csv'
    columns = ['user_name', 'user_location', 'user_description', 'user_created', 'user_followers', 'user_friends',
               'user_favourites', 'user_verified', 'date', 'full_text', 'hashtags', 'source']

    with open(save_path, 'a', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=columns)
        for tweet in tweepy.Cursor(api.search,
                                   q=search_words,
                                   lang="en",
                                   since=date_since,
                                   tweet_mode='extended').items(10000):
            try:
                row_info = get_tweet_data(tweet)
                writer.writerow(row_info)
            except Exception:
                continue
