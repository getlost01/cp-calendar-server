const express = require('express');
const request = require('request');
const dotenv = require('dotenv'); 
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.listen(process.env.PORT || 3002, function(){
    console.log("➡️ This app is listening on port %d in %s mode 👍", this.address().port, app.settings.env);
});

var clistUrl=process.env.APP_CLIST_URL;

app.get('/upcomingContests', (req, res, next) => {      
    var q = req.query;
    console.log("q",q);
    request(
      { url: `${clistUrl}&resource=${q.resource}&end__gt=${q.end__gt}&start__gt=${q.start__gt}&limit=150` },
      (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return res.status(500).json({ type: 'error', message: error, query: `resource=${q.resource}&end__gt=${q.end__gt}&start__gt=${q.start__gt}&limit=150`});
        }
        res.json(JSON.parse(body));
      }
    )
});

app.get('*',(req,res,next)=>{
     res.send({"error": 404});
});