import pandas as pd
import numpy as np
from tweet import config
import datetime
import os


if __name__ == '__main__':
    # Read in all subset data
    dfs = []
    for f in os.listdir(config.data):
        if 'subset' in f:
            dfs.append(pd.read_csv(config.data / f, header = None))

    columns = ['user_name','user_location', 'user_description', 'user_created', 'user_followers', 'user_friends',
               'user_favourites', 'user_verified', 'date', 'full_text', 'hashtags', 'source', 'lang']
    df = pd.concat(dfs, axis=0)
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
    
    # 5. add id column
    df['id'] = list(range(len(df)))

    # Save to disk
    df.to_csv(config.data / 'covid19_tweets_clean.csv', index = None)