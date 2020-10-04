import React, {Component} from 'react';
import Entry from './Entry';

/**
 * Track component consisting of the tracks image, name,
 * rank, a link to the track.
 */
class Track extends Component {
  render() {
    const track = this.props.track;
    const trackInfo = {
      'image': track.album.images[track.album.images.length - 1].url,
      'name': track.name,
      'rank': this.props.rank,
      'url': track.external_urls.spotify,
      'urlText': 'Play Song',
    };

    return (<Entry entry={trackInfo} />);
  }
}

export default Track;
