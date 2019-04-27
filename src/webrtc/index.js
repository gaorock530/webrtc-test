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
      if (this.remoteVideo.srcObject !== e.streams[0]) {
        console.log('remotePeerConnection got stream');
        try{
          this.remoteVideo.srcObject = e.streams[0];
          this.remoteVideo.play();
        }catch(e) {
          console.warn(e);
        }
        
      }
    });
    // this.webtrc.on('', (e) => console.log(e));
  }

  startVideo = async () => {
    this.localVideo.srcObject = await this.webtrc.setupLocalMediaStream();
    this.webtrc.addStream();
  }

  connect = async () => {
    const err = await this.webtrc.createOffer();
    if (err) console.log(err);
  }

  disconnect = () => {

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
              <select>
                <option>video</option>
              </select>
              <button className="offer-button" onClick={this.startVideo}>Setup</button>
              <button className="offer-button" onClick={this.connect}>Start</button>
              <button className="offer-button" onClick={this.disconnect}>Stop</button>
            </div>
            <div className="video-wrapper">
              <div>
                <p>Local</p>
                <video className="video" playsInline autoPlay={true} ref={el => this.localVideo = el}></video>
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
