import React, { Component } from 'react';
import Artist from './Artist';
import Track from './Track';
import './UserInfo.css';

class UserInfoComponent extends Component {
  componentDidMount() {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const access_token = params.get('access_token');
    if (access_token) {
      const refresh_token = params.get('refresh_token');
      document.cookie = `access_token=${access_token};refresh_token=${refresh_token}`;
      this.setState({ loggedIn: true, access_token });
    } else {
      this.setState({ loggedIn: false });
      return;
    }
  }

  async getSpotifyUrl(url, access_token) {
    return fetch(url,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      .then((res) => res.json());
  }

  loadArtists(userTopArtists) {
    let artists = [];
    let rank = 1;
    for (const artist of userTopArtists) {
      artists.push(<Artist artist={artist} rank={rank++} />);
    }
    return artists;
  }

  loadTracks(userTopTracks) {
    let tracks = [];
    let rank = 1;
    for (const track of userTopTracks) {
      tracks.push(<Track track={track} rank={rank++} />)
    }
    return tracks;
  }

  render() {
    const state = this.state;
    if (!state || !state.loggedIn) {
      return <p>You are not logged in.</p>;
    }

    let userInfo = JSON.parse(window.localStorage.getItem('display_data'));
    if (!userInfo) {
      const url = 'https://api.spotify.com/v1/me';
      this.getSpotifyUrl(url, state.access_token)
        .then((fetchedInfo) => {
          window.localStorage.setItem(
            'display_data',
            JSON.stringify(fetchedInfo)
          );
          userInfo = fetchedInfo;
        });
    }

    let artists = JSON.parse(window.localStorage.getItem('top_artists')) || [];
    if (artists.length === 0) {
      const url = 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50';
      this.getSpotifyUrl(url, state.access_token).then((topArtists) => {
        artists.push(...topArtists.items);
        if (topArtists.next != null) {
          return this.getSpotifyUrl(topArtists.next, state.access_token).then((topArtists) => {
            artists.push(...topArtists.items);
          });
        }
      }).then(() => {
        window.localStorage.setItem('top_artists', JSON.stringify(artists));
      });
    }

    let tracks = JSON.parse(window.localStorage.getItem('top_tracks')) || [];
    if (tracks.length === 0) {
      const url = 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50';
      this.getSpotifyUrl(url, state.access_token).then((topTracks) => {
        tracks.push(...topTracks.items);
        console.log(topTracks);
        if (topTracks.next != null) {
          return this.getSpotifyUrl(topTracks.next, state.access_token).then((topTracks) => {
            tracks.push(...topTracks.items);
          });
        }
      }).then(() => {
        window.localStorage.setItem('top_tracks', JSON.stringify(tracks));
      });
    }

    if (state && userInfo && artists) {
      return (
        <div>
          <p>Hello {userInfo.display_name}</p>
          <img src={userInfo.images[0].url} />
          <h4 id="titleAlign">Your Top Artists</h4>
          <div>
            {this.loadArtists(artists)}
          </div>
          <h4 id="titleAlign">Your Top Tracks</h4>
          <div>
            {this.loadTracks(tracks)}
          </div>
        </div>
      );
    }
    return <p>You are not logged in.</p>;
  }
}

export default UserInfoComponent;
