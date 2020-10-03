import React, { Component } from 'react';
import Entry from './Entry';

class Artist extends Component {
  render() {
    const artist = this.props.artist;
    const artistInfo = {
      "image": artist.images[artist.images.length - 1].url,
      "name": artist.name,
      "rank": this.props.rank,
      "url": artist.external_urls.spotify,
      "urlText": "Spotify Page"
    }
    return (<Entry entry={artistInfo} />);
  }
}

export default Artist;
