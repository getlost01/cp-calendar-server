const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const PORT = process.env.PORT || 3002;
const clistUrl = process.env.APP_CLIST_URL;
var host_sites=['codeforces.com','codechef.com','atcoder.jp','leetcode.com','codingninjas.com/codestudio','hackerearth.com','geeksforgeeks.org','topcoder.com'];

let cache = {
    data: null,
    timestamp: null
};

const fetchContests = async (query) => {
  try {
      const promises = host_sites.map(async (site) => {
          const response = await axios.get(`${clistUrl}&resource=${site}&end__gt=${query.end__gt}&start__gt=${query.start__gt}&limit=150`);
          console.log('Fetched data from:', site, 'Total:', response.data.objects.length);
          return response.data.objects;
      });

      const results = await Promise.all(promises);
      const contestData = [].concat(...results).sort((a, b) => new Date(a.start) - new Date(b.start));
      return { type: 'success', data: contestData };

  } catch (error) {
      console.error('Error fetching data:', error);
      return { type: 'error', message: error.message };
  }
};


const cacheMiddleware = async (req, res, next) => {
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const currentTime = Date.now();

    if (cache.data && (currentTime - cache.timestamp < TWO_HOURS)) {
        console.log('Returning cached data');
        return res.json(cache.data);
    }

    try {
        console.log('Fetching new data from API, and caching it at:', new Date(currentTime).toLocaleString());
        const q = req.query;
        const response = await fetchContests(q);
        if (response.type === 'error') {
            return res.status(500).json(response);
        }

        cache.data = { "objects": response.data };
        cache.timestamp = currentTime;
        res.json(cache.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ type: 'error', message: error.message });
    }
};

app.get('/upcomingContests', cacheMiddleware);

app.get('*', (req, res) => {
    res.status(404).send({ error: 404 });
});

app.listen(PORT, () => {
    console.log("➡️ This app is listening on port %d in %s mode 👍", PORT, app.settings.env);
});