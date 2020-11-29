import re
import json
import pandas as pd
import numpy as np
from tweet import config
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.stem import WordNetLemmatizer


def clean_text(text):
    tokens = re.findall('(?u)\\b\\w\\w+\\b', text)
    tokens = list(map(lemmatizer.lemmatize, tokens))
    return ' '.join(tokens)


if __name__ == '__main__':
    # Read in data
    df = pd.read_csv(config.data / 'covid19_tweets_final_denormalized_topic.csv', index_col=0, encoding='utf-8')
    df = df.dropna(subset=['topic'])
    df['senti'] = (np.where(df['sentiment_tag_hf']=="NEGATIVE", -1, 1)) * df['sentiment_score_hf']
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.month
    df.index = range(len(df))

    # Define constants for vectorizer
    min_df = 3
    max_df = 0.95
    max_features = 20
    ngram_range = (1, 2)

    # Narrow down the range of topics
    issue_list = ['evict', 'mental', 'depress', 'food', 'money', 'unemploy',
                  'shut', 'bankrup', 'friend', 'credit', 'house', 'medici']

    # Gather info for each month
    month_dict = {int(m): 0 for m in df['month'].unique()}

    # Get data for each month
    for m in df['month'].unique():
        # Select relevant data
        df_m = df[df['month'] == m]
        selected_ids = []
        for issue in issue_list:
            tmp = list(df_m[df_m['topic'].str.contains(issue)].index)
            selected_ids.extend(tmp)

        selected_ids = list(set(selected_ids))
        print("Month:", m, ",Selected rows:", len(selected_ids))

        # Filter to selected rows
        df_m = df_m[df_m.index.isin(selected_ids)]

        # Lemmatize the texts
        lemmatizer = WordNetLemmatizer()
        df_m['clean_topic'] = df_m['topic'].apply(clean_text)

        # Apply Tfidf
        vec = TfidfVectorizer(
            stop_words='english',
            token_pattern='(?u)\\b\\w\\w+\\b',
            min_df=min_df,
            max_df=max_df,
            ngram_range=ngram_range,
            max_features=max_features,
            lowercase=False
        )

        # Calcualte importance based on TfidfVectorizer
        ct_matrix = vec.fit_transform(df_m['clean_topic'].tolist());
        vocab = list(pd.Series(vec.vocabulary_).sort_values().index)
        word_importance = ct_matrix.sum(axis=0).A.reshape(-1).tolist()
        import_df = pd.DataFrame({'vocab':vocab, 'importance':word_importance}).sort_values('importance', ascending=False)

        # Gather data for month
        month_data = []
        for i, row in import_df.iterrows():
            vocab = row.vocab
            imp = row.importance
            senti = df_m[df_m['clean_topic'].str.contains(vocab)]['senti'].mean()
            month_data.append({'text': vocab, 'size': imp, 'senti': senti})
        month_dict[m] = month_data

    # Save json to disk
    save_path = config.data / 'word_cloud_data'
    if not save_path.exists():
        save_path.mkdir()
    with open(save_path / 'month_dict.json', 'w') as outfile:
        json.dump(month_dict, outfile)
