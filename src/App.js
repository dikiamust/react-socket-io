import React, { Component } from 'react';
import { io } from 'socket.io-client';
import Header from './Components/Header'

const socket = io('localhost:4400');

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
      </React.Fragment>
    )
  }
}

export default App;
