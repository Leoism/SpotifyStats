import React, {Component} from 'react';
import {Col, Row} from 'react-materialize';
import './Entry.css';

/**
 * Entry component that creates a row consisting of a rank column, image
 * column, an entry information column.
 */
class Entry extends Component {
  render() {
    const entry = this.props.entry;
    return (
      <Row>
        <Col m={1} s={2} l={1} className="rank">
          {entry.rank}
        </Col>
        <Col m={2} s={4} l={2}>
          <img className="entryImage"
               src={entry.image}
               alt=""/>
        </Col>
        <Col m={9} s={6} l={4} className="entryInfo">
          <div>{entry.name}</div>
          <div className="entryUrlText"><a href={entry.url}>{entry.urlText}</a></div>
        </Col>
      </Row>);
  }
}

export default Entry;
