def get_tweet_data(tweet_id, api):
    """ A function that extracts the info from a given tweet_id
        Params:
            tweet_id (str): tweet_id
            api (tweepy.API): API to ping for data
        Output:
            row_info: dict that contains that tweet info
    """
    # Ping API for tweet
    tweet = api.get_status(tweet_id, tweet_mode='extended')

    # Check if is retweet
    if hasattr(tweet, "retweeted_status"):
        tweet = tweet.retweeted_status

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
                'full_text': tweet.full_text, 
                'hashtags': hashtags if hashtags else None,
                'source': tweet.source,
                'lang': tweet.lang}
    return row_info
