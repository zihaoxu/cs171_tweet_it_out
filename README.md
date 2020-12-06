# CS171 TweetItOut
Sentiment visualization and analysis using tweets during the Covid-19 pandemic. Note: for best viewing experience, the suggested resolution is 1680 by 1050 px.

## Licence
This software is published by Zihao Xu, Yiwen Wang, and Gazi Mahmud under [GPL V3](https://www.gnu.org/licenses/gpl-3.0.html).

## Important URLs
- Website URL: https://zihaoxu.github.io/cs171_tweet_it_out/  
- Video URL: https://bit.ly/37EJFJX
- Link to our main datasets: https://bit.ly/3mQ4xnO
- Link to our process book: https://bit.ly/3giNFE2  

## Directory Setup
- `docs/`: hosts our main website along with all the `js`, `css` and `html` code
	- `docs/index.html`: our main webpage, reflects the content of `https://zihaoxu.github.io/cs171_tweet_it_out/ `
	- `docs/viz/`: It is worth noting that many sub-pages are stored inside this folder and they are loaded as `iframe`s inside the main `index.html`. Each visualization has its own `js`, `css` and `html` code, along with the required data inside `docs/viz/XXX_viz/viz_data/` where `XXX_viz` is the name of the visualization
	- `*/viz_data/`: stores the data used for individual visualizations
- `notebooks/`: contains notebooks for data processing and preliminary data exploration
- `scripts/`: contains Python scripts for data processing. We had to rely on several Python-specific packages for tasks like topic extraction and sentiment analysis
- `module/`: stores a customized packaged containing some helper functions we have written for this project
- `requirements.txt`: stores all the dependencies of this project

## Data Processing
The main datasets we used for this project are `covid19_tweets_final.csv`, which is the master dataset, and `covid19_tweets_final_denormalized.csv`, which is the long form of the master dataset based on the extracted topics. Here is a link to these two datasets: https://bit.ly/3mQ4xnO.

It is worth noting that there are several processed data files located in folders `viz_data/` for each of the visualizations within the `docs/` and `docs/viz/` folder. These additional data files are derived from the two main datasets, processed using Python scripts under the `scripts/` folder or the `notebooks/` folder.

## Appendix
### To create a virtual environment
1. Run `python3 -m pip install --user virtualenv` to install virtualenv 
2. Run `python3 -m venv <env_name>` to create a virtual environment using your own `env_name`
3. Install all dependencies by running `pip install -r requirements.txt`

### Contact Us
- Zihao Xu, zxu@g.harvard.edu
- Yiwen Wang, yiwenwang@g.harvard.edu
- Gazi Mahmud, gmahmud@g.harvard.edu