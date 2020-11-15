const express = require('express');
const keys = require('./keys.json');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const request = require('request');
const app = express();
const queryString = require('query-string');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017/spotify_stats';
const cron = require('node-cron');
const fetch = require('node-fetch');
const databaseService = require('../client/src/database/databaseRetrieval');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: true }));

app.get('/login', (req, res) => {
  const scopes = 'user-read-email user-top-read';
  const redirectUri = 'http://localhost:8080/authenticate';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + keys.spotify_client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirectUri));
});

app.get('/authenticate', (req, res) => {
  const form = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: 'http://localhost:8080/authenticate',
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
      refresh_token: body.refresh_token,
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
      if (err && err.code === 11000) {
        dbo.collection('users').replaceOne({ _id: user.user.info.username }, user, (err, res) => {
          db.close();
        });
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
    const type = req.query.type;
    const term = req.query.term;
    dbo.collection('users').findOne({ '_id': req.query.username })
      .then((response) => {
        const stats = response.user[type][term];
        res.json(stats);
        db.close();
      });
  });
});

/** Run everyday at 2am. */
cron.schedule('0 2 * * *', () => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    const spotifyDb = db.db('spotify_stats');

    spotifyDb.collection('users').find({}).toArray((err, res) => {
      for (const user of res) {
        const authOpts = {
          body: `grant_type=refresh_token&refresh_token=${user.user.refresh_token}`,
          headers: {
            Authorization: `Basic ${keys.base64_auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          url: 'https://accounts.spotify.com/api/token',
          json: true,
        };

        request.post(authOpts, (err, resp, body) => {
          const newAccessToken = body.access_token;
          updateUserData({}, newAccessToken, user.user.refresh_token);
        });
      }
      db.close();
    });
  });

});

async function getSpotifyUrl(url, access_token) {
  return await fetch(url,
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    .then((res) => res.json());
}

async function getSpotifyUserResults(url, user, type, term, access_token) {
  return await getSpotifyUrl(url, access_token).then((results) => {
    if (!user.user[type]) {
      user.user[type] = {};
    }
    const typeArr = user.user[type]
    typeArr[term] = [];
    let rank = 1;
    if (type == 'artists') {
      for (const artist of results.items) {
        typeArr[term].push(databaseService.convertToArtistObject(artist, rank++))
      }
    } else {
      for (const song of results.items) {
        typeArr[term].push(databaseService.convertToSongObject(song, rank++));
      }
    }
  });
}

async function updateUserData(user, access_token, refresh_token) {
  // fetch the user data first
  let url = 'https://api.spotify.com/v1/me';
  let userId;
  await getSpotifyUrl(url, access_token)
    .then((fetchedInfo) => {
      user.user = {
        info: {
          username: fetchedInfo.display_name,
          url: fetchedInfo.href,
          image: fetchedInfo.images[fetchedInfo.images.length - 1].url,
        },
        refresh_token,
      };
      userId = fetchedInfo.id;
    });

  const terms = ['short_term', 'medium_term', 'long_term'];
  for (const term of terms) {
    // fetch top artists
    url = `https://api.spotify.com/v1/me/top/artists?time_range=${term}&limit=50`;
    await getSpotifyUserResults(url, user, 'artists', term, access_token);

    // fetch top tracks
    url = `https://api.spotify.com/v1/me/top/tracks?time_range=${term}&limit=50`;
    await getSpotifyUserResults(url, user, 'tracks', term, access_token);
  }
  user._id = userId;

  await fetch('http://localhost:8080/user-stats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user),
  });
}


app.listen(8080);
