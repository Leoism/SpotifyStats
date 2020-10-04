import React, { Component } from 'react';
import Artist from './Artist';
import Track from './Track';
import { gatherUserData, getUserStatsFromDb } from '../database/databaseRetrieval';
import './UserInfo.css';

class UserInfoComponent extends Component {
  async componentDidMount() {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const access_token = params.get('access_token');

    let state;
    if (access_token) {
      const refresh_token = params.get('refresh_token');
      document.cookie = `access_token=${access_token};refresh_token=${refresh_token}`;
      state = { loggedIn: true, access_token };
    } else {
      this.setState({ loggedIn: false });
      return;
    }

    let userStats = await getUserStatsFromDb();
    if (userStats === undefined || userStats.artists === undefined || userStats.tracks === undefined) {
      userStats = {};
      await gatherUserData(userStats, access_token);
    }

    state.user = userStats;
    this.setState(state);
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

    if (state && JSON.stringify(state.user) !== '{}') {
      return (
        <div>
          <h4 id="titleAlign">Your Top Artists</h4>
          <div>
            {this.loadArtists(state.user.artists)}
          </div>
          <h4 id="titleAlign">Your Top Tracks</h4>
          <div>
            {this.loadTracks(state.user.tracks)}
          </div>
        </div>
      );
    }
    return <p>You are not logged in.</p>;
  }
}

export default UserInfoComponent;
