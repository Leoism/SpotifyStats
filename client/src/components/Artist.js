import React, { Component } from 'react';
import Entry from './Entry';

/**
 * Artist component that displays an artists rank, image, name, and link to the
 * artist.
 */
class Artist extends Component {
  render() {
    const artist = this.props.artist;
    const artistInfo = {
      image: artist.image,
      name: artist.name,
      rank: artist.rank,
      url: artist.url,
      urlText: 'Spotify Page',
    };
    return (<Entry entry={artistInfo} />);
  }
}

export default Artist;
