# cs171_tweet_it_out
Gazi Mahmud, Yiwen Wang, Zihao Xu

## Licence
This software is published by Zihao Xu, Yiwen Wang and Gazi Mahmud under  [GPL V3](https://www.gnu.org/licenses/gpl-3.0.html).

## Important URLs
- Website URL: https://zihaoxu.github.io/cs171_tweet_it_out/  
- Narration URL: 

## Directory Setup
`docs/`: hosts our main website along with all the `js`, `css` and `html` code. It is worth noting that many sub-pages are stored under `docs/viz/` and they are loaded as `iframe`s inside the outer most `index.html`
`notebooks/`: contains notebooks for data processing and preliminary data exploration
`scripts/`: contains python scripts for data processing used in "production"
`module/`: contains some helper functions we have written for this project
`data.txt`: contains a link to the two main datasets we have used for this project, including `covid19_tweets_final.csv`, which is the master dataset, and `covid19_tweets_final_denormalized.csv`, or the long form of the master dataset based on the extracted topics. It is worth noting that, there are a number of processed data files that are located in folders called `viz_data/` for each of the visualizations within the `docs/` folder. And these additional data files are all derived from these two main datasets


## To create a virtual environment
1. Run `python3 -m pip install --user virtualenv` to install virtualenv 
2. Run `python3 -m venv <env_name>` to create a virtual environment using your own `env_name`
3. Install all dependencies by running `pip install -r requirements.txt`



   



