import json
import pandas as pd
import numpy as np
from tweet import config


if __name__ == '__main__':

    # Read in data
    df = pd.read_csv(config.data / 'covid19_tweets_final.csv')
    df['senti'] = (np.where(df['sentiment_tag_hf']=="NEGATIVE", -1, 1)) * df['sentiment_score_hf']
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.month
    df['date'] = df['date'].dt.date

    # Extract json data for sentiment analysis
    senti_json = {'month_df': [], 'day_df': []}

    month_df = df.groupby('month').agg({'senti': 'mean', 'full_text': 'count'}).reset_index()
    for idx, row in month_df.iterrows():
        item = {'id': idx,
                'month': row.month,
                'senti': row.senti,
                'count': row.full_text}
        senti_json['month_df'].append(item)

    day_df = df.groupby('date').agg({'senti': 'mean', 'full_text': 'count'}).reset_index()
    day_df['date'] = pd.to_datetime(day_df['date'])
    day_df['weekday'] = day_df['date'].dt.weekday

    for idx, row in day_df.iterrows():
        item = {'id': idx,
                'date': str(row.date.date()),
                'senti': row.senti,
                'count': row.full_text,
                'weekday': row.weekday}
        senti_json['day_df'].append(item)

    # Save json to disk
    save_path = config.data / 'senti_data'
    if not save_path.exists():
        save_path.mkdir()
    with open(save_path / 'senti_data.json', 'w') as outfile:
        json.dump(senti_json, outfile)
