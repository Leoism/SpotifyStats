import React, { Component } from 'react';
import Entry from './Entry';

/**
 * Track component consisting of the tracks image, name,
 * rank, a link to the track.
 */
class Track extends Component {
  render() {
    const track = this.props.track;
    const trackInfo = {
      image: track.image,
      name: track.name,
      rank: track.rank,
      url: track.url,
      urlText: 'Play Song',
    };

    return (<Entry entry={trackInfo} />);
  }
}

export default Track;
