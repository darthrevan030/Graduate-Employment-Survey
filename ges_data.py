import requests
import pandas as pd
import json
import time

dataset_id = "d_3c55210de27fcccda2ed0c63fdd2b352"
base_url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}"

all_records = []
offset = 0
limit = 100

while True:
    response = requests.get(base_url + f"&limit={limit}&offset={offset}")
    data = response.json()
    
    if 'result' not in data:
        if data.get('name') == 'TOO_MANY_REQUESTS':
            print(f"Rate limited at offset {offset}, waiting 15 seconds...")
            time.sleep(15)
            continue  # Retry same offset
        print(f"Unexpected response: {json.dumps(data, indent=2)}")
        break
    
    records = data['result']['records']
    total = data['result']['total']
    
    if not records:
        break
    
    all_records.extend(records)
    print(f"Fetched {len(all_records)} / {total} records...")
    
    if len(all_records) >= total:
        break
    
    offset += limit
    time.sleep(2)  # 2s delay between requests to avoid rate limiting

df = pd.DataFrame(all_records)
df.to_csv("ges_data.csv", index=False)
print(f"\nDone! Saved {len(df)} records to ges_data.csv")