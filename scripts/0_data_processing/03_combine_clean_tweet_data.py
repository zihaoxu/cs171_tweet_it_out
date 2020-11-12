import pandas as pd
import numpy as np
from tweet import config
import datetime


if __name__ == '__main__':
    # Read in all subset data
    df1 = pd.read_csv(config.data / 'covid19_tweets_id_subset.csv', header = None)
    df2 = pd.read_csv(config.data / 'covid19_tweets_id_subset2.csv', header = None)
    df3 = pd.read_csv(config.data / 'covid19_tweets_id_subset3.csv', header = None)
    df4 = pd.read_csv(config.data / 'covid19_tweets_id_subset4.csv', header = None)
    df5 = pd.read_csv(config.data / 'covid19_tweets_id_subset5.csv', header = None)
    df6 = pd.read_csv(config.data / 'covid19_tweets_id_subset6.csv', header = None)

    columns = ['user_name','user_location', 'user_description', 'user_created', 'user_followers', 'user_friends',
               'user_favourites', 'user_verified', 'date', 'full_text', 'hashtags', 'source', 'lang']
    df = pd.concat([df1, df2, df3, df4, df5, df6], axis=0)
    df.columns = columns
    df = df.sort_values('date')

    # Generate new features
    # 1. top10 sources
    top_sources = df['source'].value_counts().reset_index().head(10)['index']
    df['source_top10'] = np.where(df['source'].isin(top_sources), df['source'], 'other')

    # 2. date related columns
    df['date'] = pd.to_datetime(df['date'])
    df['date_short'] = df['date'].dt.date
    df['weekday'] = df['date'].dt.weekday
    df['hour'] = df['date'].dt.hour

    # 3. tweet related
    df['tweet_length'] = df['full_text'].apply(lambda x: len(x))
    
    # 4. Fix bug with \r in user_description
    df['user_description'] = df['user_description'].apply(lambda x: x.replace("\r", "") if type(x)==str else x)

    # Data Cleaning
    print("Shape of df before cleaning:", df.shape)

    # 1. remove nan rows
    df = df.dropna(subset=['full_text'])

    # 2. Remove non-english tweets
    df = df[df['lang'] == 'en']

    # 3. Remove old-tweets
    df = df[df['date_short'] >= datetime.date(2020, 1, 27)]

    # 4. drop duplicated rows
    df = df.drop_duplicates(subset=['full_text','date','user_name'])
    print("Shape of df after cleaning:", df.shape)

    # Save to disk
    df.to_csv(config.data / 'covid19_tweets_clean.csv', index = None)