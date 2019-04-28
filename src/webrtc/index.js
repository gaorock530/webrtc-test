import iceParser from 'utils/iceParser';
import React from 'react';
import WebRTC from 'utils/webrtc';

export default class WebRTCContainer extends React.PureComponent{
  constructor (props) {
    super(props);
    this.webtrc = new WebRTC();
    
  }

  componentDidMount () {
    this.webtrc.on('track', (e) => {
      console.log('track:', e);
      if (e.streams && this.remoteVideo.srcObject !== e.streams[0]) {
        console.log('remotePeerConnection got stream');
        try{
          this.remoteVideo.srcObject = e.streams[0];
        }catch(e) {
          console.warn(e);
        }
        
      }else if (!e.streams){
        this.remoteVideo.pause();
      }
    });
    // this.webtrc.on('', (e) => console.log(e));
  }

  startVideo = async () => {
    try {
      this.localVideo.srcObject = await this.webtrc.setupLocalMediaStream();
      this.webtrc.addStream();
      await this.webtrc.createOffer();
    }catch(e) {

    }
  }

  endVideo = async () => {
    try {
      this.webtrc.endStream();
    }catch(e) {

    }
  }

  connect = async () => {
    const err = await this.webtrc.createOffer();
    if (err) console.log(err);
  }

  changeStream = async (e) => {
    const option = {
      'audio': !!parseInt(this.audioOp.value),
      'video': {facingMode: this.camOp.value}
    }
    if (!parseInt(this.videoOp.value)) {
      option.video = false;
    }
    try {
      if (option.video || option.audio) {
        this.localVideo.srcObject = await this.webtrc.setupLocalMediaStream(option);
        this.webtrc.addStream();
      }else {
        this.webtrc.endStream();
      }
      await this.webtrc.createOffer();
    }catch(e) {

    }
  }

  appendStatus = (info, color = false) => {
    const el = document.createElement('p');
    el.innerText = info;
    if (color) el.style.color = color;
    this.status.appendChild(el);
  }

  sendMessage = () => {
    if (!this.input.value) return;
    const msg = document.createElement('p');
    msg.innerText = this.input.value
    this.messageArea.appendChild(msg);
    this.input.value = '';
    this.input.focus();
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
              <button className="offer-button" onClick={this.startVideo}>Setup</button>
              <button className="offer-button" onClick={this.connect}>Start</button>
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
