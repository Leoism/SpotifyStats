import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginComponent from './components/Login';
import UserInfoComponent from './components/UserInfo';
import './App.css';

class App extends Component {
  componentDidMount() {

  }
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={LoginComponent} />
          <Route path="/myinfo" component={UserInfoComponent} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
