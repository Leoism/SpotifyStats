const express = require('express');
const keys = require('./keys.json');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const request = require('request');
const app = express();
const queryString = require('query-string');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017/spotify_stats';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: true }));

app.get('/login', (req, res) => {
  const scopes = 'user-read-email user-top-read';
  const redirect_uri = 'http://localhost:8080/authenticate';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + keys.spotify_client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

app.get('/authenticate', (req, res) => {
  const form = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: 'http://localhost:8080/authenticate'
  };

  const authOpts = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${keys.base64_auth}`,
    },
    json: true,
    form,
  };

  request.post(authOpts, (error, response, body) => {
    const params = queryString.stringify({
      access_token: body.access_token,
      refresh_token: body.refresh_token
    });

    res.redirect('http://localhost:3000/myinfo?' + params);
  });
});

app.post('/user-stats', (req, res) => {
  const user = req.body;
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    const dbo = db.db('spotify_stats');
    dbo.collection('users').insertOne(user, (err, res) => {
      if (err.code === 11000) {
        return;
      } else if (err) throw err;
      db.close();
    });
  });
});

app.get('/user-stats', async (req, res) => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    const dbo = db.db('spotify_stats');
    let username = req.query.username;
    let type = req.query.type;
    let term = req.query.term;
    dbo.collection('users').findOne({ "_id": req.query.username })
      .then((response) => {
        let stats = response[username][type][term];
        res.json(stats);
        db.close();
      });
  });
});

app.listen(8080);
