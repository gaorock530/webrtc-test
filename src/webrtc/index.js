import iceParser from 'utils/iceParser';
import React from 'react';
import WebRTC from 'utils/webrtc';

export default class WebRTCContainer extends React.PureComponent{
  constructor (props) {
    super(props);
    this.webtrc = new WebRTC();
    
  }

  componentDidMount () {
    this.webtrc.establishConnection();
    this.webtrc.on('track', (e) => {
      this.appendStatus(`on track: ${e.toString()}`);
      if (e.streams) {
        this.appendStatus('remotePeerConnection got stream');
        try{
          this.remoteVideo.srcObject = e.streams[0];
        }catch(e) {
          this.appendStatus(e.toString(), 'red');
        }
        
      }else if (!e.streams){
        this.remoteVideo.pause();
      }
    });
    this.webtrc.on('negotiationNeeded', (e) => {
      this.appendStatus('negotiationNeeded')
    })
    // this.webtrc.on('', (e) => console.log(e));
  }

  startVideo = async () => {
    try {
      this.webtrc.establishConnection();
      this.localVideo.srcObject = await this.webtrc.setupLocalMediaStream();
      this.webtrc.addStream();
      await this.webtrc.createOffer();
      
    }catch(e) {
      this.appendStatus(e.toString(), 'red')
    }
  }

  endVideo = async () => {
    try {
      this.webtrc.closeConnection();
    }catch(e) {

    }
  }

  changeStream = async (e) => {
    const option = {
      'audio': !!parseInt(this.audioOp.value),
      'video': {facingMode: this.camOp.value}
    }
    if (!parseInt(this.videoOp.value)) {
      option.video = false;
    }
    this.webtrc.endStream();
    try {
      if (option.video || option.audio) {
        this.localVideo.srcObject = await this.webtrc.setupLocalMediaStream(option);        
        this.webtrc.addStream();
      }
      await this.webtrc.createOffer();
    }catch(e) {
      console.warn(e);
    }
  }

  appendStatus = (info, color = false) => {
    const el = document.createElement('p');
    el.innerText = info;
    if (color) el.style.color = color;
    this.status.appendChild(el);
  }

  

  render () {
    return (
      <>
        <div className="webrtc-utils">
          <div className="webrtc-utils-l">
            <div>
              <select onChange={this.changeStream} ref={el => this.videoOp = el}>
                <option value={1}>video on</option>
                <option value={0}>video off</option>
              </select>
              <select onChange={this.changeStream} ref={el => this.audioOp = el}>
                <option value={1}>audio on</option>
                <option value={0}>audio off</option>
              </select>
              <select onChange={this.changeStream} ref={el => this.camOp = el}>
                <option value="user">user</option>
                <option value="environment">environment</option>
              </select>
              <button className="offer-button" onClick={this.startVideo}>Start</button>
              <button className="offer-button" onClick={this.endVideo}>Stop</button>
            </div>
            <div className="video-wrapper">
              <div>
                <p>Local</p>
                <video className="video" playsInline muted autoPlay={true} ref={el => this.localVideo = el}></video>
              </div>
              <div>
                <p>Remote</p>
                <video className="video" playsInline autoPlay={true} ref={el => this.remoteVideo = el}></video>
              </div>
            </div>
            <div className="data-wrapper">
              <div>
                <input type="text" className="input-box" ref={el => this.input = el} />
                <p>
                  <button className="offer-button" onClick={this.sendMessage}>Send</button>
                  <button className="offer-button" onClick={() => {this.messageArea.innerHTML = ''; this.input.value = ''}}>Clear</button>
                </p>
                  
                <p>Messages:</p>
                <div className="messages" ref={el => this.messageArea = el}></div>
              </div>
              <div>
                <input type="file" ref={el => this.file = el} />
                <p></p>
                <button className="offer-button">Send</button>
                <p>Sending Process : <span>0</span> %</p>
                <p>Receiving Process : <span>0</span> %</p>
              </div>
            </div>
          </div>
          <div className="webrtc-utils-r">
            
          </div>
        </div>
        <div className="webrtc-stats" ref={el => this.status = el}>
          
        </div>
      </>
    )
  }
}
