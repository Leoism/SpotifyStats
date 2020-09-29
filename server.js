const express = require('express');
const keys = require('./keys.json');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const request = require('request');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  credentials: true
}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

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
    res.cookie('access_token', body.access_token, {
      maxAge: 3600000,
      sameSite: "strict",
    });
    res.cookie('refresh_token', body.refresh_token, {
      maxAge: 3600000,
      sameSite: "strict",
    });
    res.redirect('/myinfo');
  });
});

app.get('/myinfo', async (req, res) => {
  const json = await fetch('https://api.spotify.com/v1/me',
    {
      headers: {
        Authorization: `Bearer ${req.cookies.access_token}`
      }
    })
    .then((res) => res.json());
  res.json(json);
});

app.listen(8080);