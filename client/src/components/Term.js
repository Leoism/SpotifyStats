import React, { Component } from 'react';
import { Select } from 'react-materialize';
import { getUserEntry, getCookieValue } from '../database/databaseRetrieval';
/**
 * Term that provides a selection for short term, medium term,
 * and long term. Updates the pages with the selected field. 
 */
class Term extends Component {
  async handleChange(event) {
    const term = event.target.value;
    const type = this.props.type;
    const username = getCookieValue('user');
    const updatedTop = await getUserEntry(username, type, term);
    this.props.updater(type, updatedTop);
  }

  render() {
    return (
    <Select onChange={this.handleChange.bind(this)}>
      <option value="short_term">30 days</option>
      <option value="medium_term">6 months</option>
      <option value="long_term">All Time</option>
    </Select>
    );
  }
}

export default Term;
