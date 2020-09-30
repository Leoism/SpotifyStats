const express = require('express');
const keys = require('./keys.json');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const request = require('request');
const app = express();
const queryString = require('query-string');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

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

app.listen(8080);
