# CS171 TweetItOut
Sentiment analysis using tweets during the Covid-19 pandemic

## Licence
This software is published by Zihao Xu, Yiwen Wang, and Gazi Mahmud under  [GPL V3](https://www.gnu.org/licenses/gpl-3.0.html).

## Important URLs
- Website URL: https://zihaoxu.github.io/cs171_tweet_it_out/  
- Video URL: 
- Link to our main datasets: https://drive.google.com/drive/folders/1AJMHKbRtfpiwrEOHTzwt0FAz1R0s19z9?usp=sharing

## Directory Setup
- `docs/`: hosts our main website along with all the `js`, `css` and `html` code.
	- `docs/index.html`: our main webpage
	- `docs/viz/`: It is worth noting that many sub-pages are stored inside this folder and they are loaded as `iframe`s inside the outermost `index.html`. Each visualization has its own `js`, `css` and `html` code, along with the required data inside `docs/viz/XXX_viz/viz_data/` where `XXX_viz` is the name of the visualization
	- `docs/viz_data/` and `docs/viz/XXX_viz/viz_data/`: stores the data used for individual visualizations
- `notebooks/`: contains notebooks for data processing and preliminary data exploration
- `scripts/`: contains python scripts for data processing used in "production". We had to rely on several Python-specific packages for tasks like topic extraction.
- `module/`: stores a customized packaged containing some helper functions we have written for this project
- `data.txt`: contains a link to the two main datasets we have used for this project, including `covid19_tweets_final.csv`, which is the master dataset, and `covid19_tweets_final_denormalized.csv`, or the long form of the master dataset based on the extracted topics. 

## Data Processing
It is worth noting that several processed data files are located in folders called `viz_data/` for each of the visualizations within the `docs/` and `docs/viz/` folder. These additional data files are all derived from these two main datasets, processed using Python scripts under the `scripts/` folder.

## Appendix
### To create a virtual environment
1. Run `python3 -m pip install --user virtualenv` to install virtualenv 
2. Run `python3 -m venv <env_name>` to create a virtual environment using your own `env_name`
3. Install all dependencies by running `pip install -r requirements.txt`