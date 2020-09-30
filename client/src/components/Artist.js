import React, { Component } from 'react';
import { Col, Row } from 'react-materialize';
import './Artist.css';

class ArtistComponent extends Component {
  render() {
    const artist = this.props.artist;
    const artistImage = artist.images[artist.images.length - 1].url;
    const artistName = artist.name;
    const artistUrl = artist.external_urls.spotify;
    return (
      <Row>
        <Col m={1} s={1} l={1} className="rank">
          {this.props.rank}
        </Col>
        <Col m={2} s={4} l={2}><img className="artistImage" src={artistImage} /></Col>
        <Col m={9} s={3} l={5} className="artistInfo">
          <div>{artistName}</div>
          <div><a href={artistUrl}>Spotify Page</a></div>
        </Col>
      </Row>);
  }
}

export default ArtistComponent;
