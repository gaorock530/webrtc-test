import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import WebRTC from './webrtc';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p className="App-title">WebRTC ICE Test</p>
        </header>
        <WebRTC/>
      </div>
    );
  }
}

export default App;
