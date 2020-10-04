import React, {Component} from 'react';

/**
 * Login page that sends a server request for authentication.
 */
class LoginComponent extends Component {
  render() {
    return (
      <div>
        <a href="http://localhost:8080/login">Login</a>
      </div>
    );
  }
}

export default LoginComponent;
