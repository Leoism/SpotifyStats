async function getSpotifyUserResults(url, user, userId, type, term, access_token) {
  return await getSpotifyUrl(url, access_token).then((results) => {
    if (!user[userId][type]) {
      user[userId][type] = {};
    }
    user[userId][type][term] = [];
    user[userId][type][term].push(...results.items);
  });
}

async function gatherUserData(user, access_token) {
  // fetch the user data first
  let url = 'https://api.spotify.com/v1/me';
  let userId;
  await getSpotifyUrl(url, access_token)
    .then((fetchedInfo) => {
      user[fetchedInfo.id] = fetchedInfo;
      userId = fetchedInfo.id;
      document.cookie = `user=${userId}`;
    });

  const terms = ['short_term', 'medium_term', 'long_term'];
  for (const term of terms) {
    // fetch top artists
    url = `https://api.spotify.com/v1/me/top/artists?time_range=${term}&limit=50`;
    await getSpotifyUserResults(url, user, userId, 'artists', term, access_token);

    // fetch top tracks
    url = `https://api.spotify.com/v1/me/top/tracks?time_range=${term}&limit=50`;
    await getSpotifyUserResults(url, user, userId, 'tracks', term, access_token);
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


async function getUserStatsFromDb() {
  let username = getCookieValue('user');
  if (!username) return undefined;

  let artists = await getUserEntry(username, 'artists', 'short_term');
  let tracks = await getUserEntry(username, 'tracks', 'short_term');

  return { artists, tracks };
}

async function getUserEntry(username, type, term) {
  const params = `username=${username}&type=${type}&term=${term}`;
  return await fetch(`http://localhost:8080/user-stats?${params}`)
    .then((res) => res.json());
}

function getCookieValue(a) {
  var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : undefined;
}

async function getSpotifyUrl(url, access_token) {
  return await fetch(url,
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    .then((res) => res.json());
}

export {
  getUserStatsFromDb,
  gatherUserData,
  getUserEntry,
  getCookieValue
};
