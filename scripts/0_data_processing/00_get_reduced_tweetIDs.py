""" Get a reduced set of tweets per day, keeping
        max(np.floor(len(date_ids)//REDUCE_FACTOR), 100)
    Source: https://github.com/echen102/COVID-19-TweetIDs
"""
from tweet import config
from pathlib import Path
import numpy as np
import pandas as pd


np.random.seed(47)
REDUCE_FACTOR = 5000

if __name__ == '__main__':

    # Define dirs
    data_dirs = ['2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06', '2020-07', '2020-08', '2020-09', '2020-10']
    data_root = config.data / 'COVID-19-TweetIDs'
    save_dir = config.data / 'covid19_id_reduced_11_07'
    
    if not save_dir.exists():
        save_dir.mkdir()

    for i in range(len(data_dirs)-1):
        curr_folder = data_dirs[i]
        data_dir = data_root / curr_folder

        for date in pd.date_range(curr_folder+'-01', data_dirs[i+1]+'-01').date:
            date_ids = []
            has_date = False
            for path in Path(data_dir).iterdir():
                if path.name.endswith('.txt') and str(date) in path.name:
                    has_date = True
                    with open(path) as f:
                        content = f.readlines()
                    content = [x.strip() for x in content]
                    date_ids.extend(content)
            if has_date:
                # Keep at least 100, or a frac of 1/reduce_factor
                keep = max(np.floor(len(date_ids)//REDUCE_FACTOR), 100)
                date_ids = np.random.choice(date_ids, int(keep), replace=False)
                filename = save_dir / (str(date) + '.csv')
                pd.DataFrame(date_ids, columns=[str(date)]).to_csv(filename, index=None)
                print("Processed date:", str(date), "Sampled IDs:", keep)
