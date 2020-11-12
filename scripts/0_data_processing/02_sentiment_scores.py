""" A script that takes in the raw covid19_tweets data and
    calcualtes the sentiment label and score for each tweet
"""
import pandas as pd
from tqdm import tqdm
from transformers import pipeline
from tweet import config
from textblob import TextBlob
from nltk.sentiment.vader import SentimentIntensityAnalyzer


# Helper function
def get_sentiment_tag_hf(text):
    res = classifier(text)[0]
    return res['label'], res['score']


def get_sentiment_nltk(sid, text):
    return sid.polarity_scores(text)['compound']


if __name__ == '__main__':
    # Read in the data
    df_path = config.data / 'covid19_tweets_clean.csv'
    df = pd.read_csv(df_path)
    tweets = df['full_text'].values

    # Use hugging face for sentiment scoring
    # nlptown/bert-base-multilingual-uncased-sentiment
    classifier = pipeline('sentiment-analysis')
    sid = SentimentIntensityAnalyzer()

    sentiment_tag_hf = []
    sentiment_score_hf = []
    sentiment_score_tb = []
    subjectivity_score_tb = []
    sentiment_score_nltk = []

    for idx in tqdm(range(len(tweets))):
        # Extract sentiment using hugging face
        tweet = tweets[idx]
        label, score = get_sentiment_tag_hf(tweet)
        sentiment_tag_hf.append(label)
        sentiment_score_hf.append(score)

        # Extract sentiment using TextBlob
        blob = TextBlob(tweet)
        sentiment_score_tb.append(blob.sentiment.polarity)
        subjectivity_score_tb.append(blob.sentiment.subjectivity)

        # Extract sentiment using NLTK
        score = get_sentiment_nltk(sid, tweet)
        sentiment_score_nltk.append(score)

    df['sentiment_tag_hf'] = sentiment_tag_hf
    df['sentiment_score_hf'] = sentiment_score_hf
    df['sentiment_score_tb'] = sentiment_score_tb
    df['subjectivity_score_tb'] = subjectivity_score_tb
    df['sentiment_score_nltk'] = sentiment_score_nltk
    df.to_csv(config.data / 'covid19_tweets_sentiment.csv', index=None)
