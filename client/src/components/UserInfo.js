import React, {Component} from 'react';
import Artist from './Artist';
import Track from './Track';
import Term from './Term';
import {gatherUserData, getUserStatsFromDb} from '../database/databaseRetrieval';
import './UserInfo.css';

/**
 * Displays the Users top artists and tracks, short term by default.
 */
class UserInfoComponent extends Component {
  async componentDidMount() {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const access_token = params.get('access_token');

    let state;
    if (access_token) {
      const refresh_token = params.get('refresh_token');
      document.cookie = `access_token=${access_token};refresh_token=${refresh_token}`;
      state = {loggedIn: true, access_token};
    } else {
      this.setState({loggedIn: false});
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
  
  updateTopEntries(type, entries) {
    if (type === 'artists') {
      this.setState({
        user: {
          artists: [...entries],
          tracks: [...this.state.user.tracks],
        },
      });
    } else if(type === 'tracks') {
      this.setState({
        user: {
          artists: [...this.state.user.artists],
          tracks: [...entries],
        },
      });
    }
  }

  /**
   * Creates Artist components of all the users artists.
   * @param {Array} userTopArtists - an array of the users top artists.
   * @return {Array} an array of Artist components.
   */
  loadArtists(userTopArtists) {
    const artists = [];
    let rank = 1;
    for (const artist of userTopArtists) {
      artists.push(<Artist artist={artist} rank={rank++} />);
    }
    return artists;
  }

  /**
   * Creates Tracks components of all the users tracks.
   * @param {Array} userTopTracks - an array of the users top tracks.
   * @return {Array} an array of Tracks components.
   */
  loadTracks(userTopTracks) {
    const tracks = [];
    let rank = 1;
    for (const track of userTopTracks) {
      tracks.push(<Track track={track} rank={rank++} />);
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
          <div class="titleAlign">
            <h4 class="title">Your Top Artists</h4>
            <Term type={"artists"} updater={this.updateTopEntries.bind(this)}/>
          </div>
          <div>
            {this.loadArtists(state.user.artists)}
          </div>
          <div class="titleAlign">
            <h4 class="title">Your Top Tracks</h4>
            <Term type={"tracks"} updater={this.updateTopEntries.bind(this)}/>
          </div>
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
