import iceParser from 'utils/iceParser';
import React from 'react';
import adapter from 'webrtc-adapter';
import stunServer from './stun-servers.json';
import Socket from 'utils/signal';
import Event from 'utils/event';
import Webrtc from 'utils/webrtc';

const rtc = new Webrtc();
console.log(rtc);
// // rtc.iceCandidatePoolSize = 10;
// console.log(rtc);

console.log(adapter);

export default class WebRTC extends React.PureComponent{
  constructor (props) {
    super(props);
    // this.ws = new Signal();
    // this.ws.ws.addEventListener('message', this.onMessage.bind(this));
    this.iceTray = [];
    this.eventEmitter = new Event();
    this.signal = new Socket(process.env.REACT_APP_WS_PATH, {attempt: 10, retryIn: 3, arraybuffer: false});
    this.configuration = {
      /** @param iceServers */
      // An array of RTCIceServer objects, each describing one server which may be used by the ICE agent; 
      // these are typically STUN and/or TURN servers. If this isn't specified, the ICE agent may choose to use its own ICE servers; 
      // otherwise, the connection attempt will be made with no STUN or TURN server available, which limits the connection to local peers.
      iceServers: [
        {urls: [...stunServer.servers]}
      ],
    
      /** @param iceTransportPolicy */
      // "all" - All ICE candidates will be considered.
      // "relay" - Only ICE candidates whose IP addresses are being relayed, such as those being passed through a TURN server, will be considered.
      iceTransportPolicy: "all",  
    
      /** @param iceCandidatePoolSize */
      // An unsigned 16-bit integer value which specifies the size of the prefetched ICE candidate pool. 
      // The default value is 0 (meaning no candidate prefetching will occur). 
      // You may find in some cases that connections can be established more quickly by allowing the ICE agent to start 
      // fetching ICE candidates before you start trying to connect, 
      // so that they're already available for inspection when RTCPeerConnection.setLocalDescription() is called.           
      iceCandidatePoolSize: 20,
    
      /** @param bundlePolicy */
      // "balanced" - On BUNDLE-aware connections, the ICE agent should gather candidates for all of the media types in use (audio, video, and data). Otherwise, the ICE agent should only negotiate one audio and video track on separate transports.
      // "max-compat" - The ICE agent should gather candidates for each track, using separate transports to negotiate all media tracks for connections which aren't BUNDLE-compatible.
      // "max-bundle" - The ICE agent should gather candidates for just one track. If the connection isn't BUNDLE-compatible, then the ICE agent should negotiate just one media track.
      bundlePolicy: "balanced",
    
      /** @param certificates */
      // An Array of objects of type RTCCertificate which are used by the connection for authentication. If this property isn't specified, a set of certificates is generated automatically for each RTCPeerConnection instance. Although only one certificate is used by a given connection, providing certificates for multiple algorithms may improve the odds of successfully connecting in some circumstances. See Using certificates below for additional information.
      // certificates: 'test',
    
      /** @param peerIdentity */
      // A DOMString which specifies the target peer identity for the RTCPeerConnection. If this value is set (it defaults to null), the RTCPeerConnection will not connect to a remote peer unless it can successfully authenticate with the given name.
      // peerIdentity: null,
    
      /** @param rtcpMuxPolicy */
      // The RTCP mux policy to use when gathering ICE candidates, in order to support non-multiplexed RTCP.
      // "negotiate" - Instructs the ICE agent to gather both RTP and RTCP candidates. If the remote peer can multiplex RTCP, then RTCP candidates are multiplexed atop the corresponding RTP candidates. Otherwise, both the RTP and RTCP candidates are returned, separately.
      // "require" - Tells the ICE agent to gather ICE candidates for only RTP, and to multiplex RTCP atop them. If the remote peer doesn't support RTCP multiplexing, then session negotiation fails.
      // rtcpMuxPolicy: 'negotiate'
    
      /** @param sdpSemantics */
      // "plan-b"
      // "unified-plan"
      // sdpSemantics: 'plan-b'
    
    };
  }

  componentDidMount () {
    // this.onConnectionStateChange = this.onConnectionStateChange.bind(this);
    // this.onDataChannel = this.onDataChannel.bind(this);
    // this.onIceCandidate = this.onIceCandidate.bind(this);
    // this.onIceConnectionStateChange = this.onIceConnectionStateChange.bind(this);
    // this.onIceGatheringStateChange = this.onIceGatheringStateChange.bind(this);
    // this.onNegotiationNeeded = this.onNegotiationNeeded.bind(this);
    // this.onSignalingStateChange = this.onSignalingStateChange.bind(this);
    // this.onConnectionStateChange = this.onConnectionStateChange.bind(this);
    // this.onTrack = this.onTrack.bind(this);
    this.signal.on('open', (e) => console.log('websocket is open', e));
    this.signal.on('close', (code, reason) => {
      console.log('socket closed.', code, reason);
    });
    this.signal.on('ice', async (data) => {
      const addIce = async (ice) => {
        await this.PeerConnection.addIceCandidate(ice);
      }
      if (this.PeerConnection.remoteDescription) {
        try {
          const iceNumber = this.iceTray.length;
          if (iceNumber > 0) {
            console.log('ice waitting number:', iceNumber);
            this.iceTray.forEach(addIce);
            this.iceTray = [];
          }
          await this.PeerConnection.addIceCandidate(new RTCIceCandidate(data))
        }catch(e) {
          console.warn(e)
        }
      } else {
        this.iceTray.push(new RTCIceCandidate(data));
      }
    })
    this.signal.on('offer', async (data) => {
      try {
        await this.PeerConnection.setRemoteDescription(new RTCSessionDescription(data));
        this.appendStatus('Set remote SDP success.')
        const description = await this.PeerConnection.createAnswer();
        this.appendStatus('Anwser for remote created.');
        this.PeerConnection.setLocalDescription(description)
        this.appendStatus('Set Local Description Success.');
        this.signal.emit('answer', description);
      }catch(e) {
        console.warn(e)
      }
    });
    this.signal.on('answer', async (data) => {
      try {
        await this.PeerConnection.setRemoteDescription(new RTCSessionDescription(data));
      }catch(e) {
        console.warn(e)
      }
    });
    // start
    this.start();
  }

  appendStatus = (info, color = false) => {
    const el = document.createElement('p');
    el.innerText = info;
    if (color) el.style.color = color;
    this.status.appendChild(el);
  }

  onConnectionStateChange = (ev) => {
    console.log('onConnectionStateChange:', ev);
    this.appendStatus("---ConnectionStateChange---", 'blue');
    switch(this.PeerConnection.connectionState) {
      case "new":
        return this.appendStatus("New Peer Connection coming...");
      case "connecting":
        return this.appendStatus("Peer Connecting...");
      case "connected":

        return this.appendStatus("Peer Online");
      case "disconnected":
        this.stop();
        return this.appendStatus("Peer disconnected...");
      case "closed":
        this.stop();
        return this.appendStatus("Peer Offline");
      case "failed":
        return this.appendStatus("Peer Connection is Failed.", 'red');
      default:
        return this.appendStatus(`Peer Connection is Unknown. ${this.PeerConnection.connectionState}`, 'orangered');
    }
  }

  onDataChannel = (ev) => {
    this.appendStatus("---DataChannel---", 'blue');
    // receiveChannel is set to the value of the event's channel property, 
    // which specifies the RTCDataChannel object representing the data channel linking the remote peer to the local one.
    console.log('onDataChannel', ev);
    let receiveChannel;
    receiveChannel = ev.channel;
    receiveChannel.onmessage = (e) => e;
    receiveChannel.onopen = (e) => e;
    receiveChannel.onclose = (e) => e;
  }

  onIceCandidate = (ev) => {
    console.log('onIceCandidate', ev);
    this.appendStatus("---IceCandidate---", 'blue');

    if (ev.candidate) {
      this.signal.emit('ice', ev.candidate);
      this.appendStatus(JSON.stringify(iceParser(ev.candidate.candidate, true)), 'green');
    } else {
      this.appendStatus("Generated SDP");
      this.offertext.value = JSON.stringify(this.PeerConnection.localDescription);
    }
  }

  onIceConnectionStateChange = (ev) => {
    console.log('onIceConnectionStateChange:', ev);
    this.appendStatus("---IceConnectionStateChange---", 'blue');
    switch(this.PeerConnection.iceConnectionState) {
      case "new":
        return this.appendStatus("New IceConnection coming...");
      case "checking":
        return this.appendStatus("ICE Checking...");
      case "connected":
        // this.setupMediaStream();
        return this.appendStatus("ICE connected");
      case "disconnected":
        this.stop();
        return this.appendStatus("ICE disconnected");
      case "closed":
        this.stop();
        return this.appendStatus("ICE Offline");
      case "failed":
        return this.appendStatus("ICE Connection Error(failed).", 'red');
      default:
        return this.appendStatus(`ICE Connection ${this.PeerConnection.iceConnectionState}.`, 'orangered');
    }
  }

  onIceGatheringStateChange = (ev) => {
    console.log('onIceGatheringStateChange:', ev);
    this.appendStatus("---IceGatheringStateChange---", 'blue');
    switch(this.PeerConnection.iceGatheringState) {
      case "new":
        return this.appendStatus("new Start Gathering Ice coming...");
      case "gathering":
        return this.appendStatus("Gathering Ice...");
      case "complete":
        return this.appendStatus("Gathering complete");
      default:
        return this.appendStatus(`Gathering Ice Unknown ${this.PeerConnection.iceGatheringState}`, 'orangered');
    }
  }

  onNegotiationNeeded = (ev) => {
    console.log('onNegotiationNeeded:', ev);
    this.appendStatus("---NegotiationNeeded---", 'blue');
  }

  onSignalingStateChange = (ev) => {
    console.log('onSignalingStateChange:', ev);
    this.appendStatus("---SignalingStateChange---", 'blue');
    switch(this.PeerConnection.signalingState) {
      case "stable":
        return this.appendStatus("ICE negotiation complete(stable)");
      case "have-local-offer":
        return this.appendStatus("ICE negotiation have-local-offer");
      case "have-remote-offer":
        return this.appendStatus("ICE negotiation have-remote-offer");
      case "have-local-pranswer":
        return this.appendStatus("ICE negotiation have-local-pranswer");
      case "have-remote-pranswer":
        return this.appendStatus("ICE negotiation have-remote-pranswer");
      default:
        return this.appendStatus(`ICE negotiation Unknown ${this.PeerConnection.signalingState}`, 'orangered');
    }
  }

  onTrack = (ev) => {
    this.appendStatus('---Track---', 'blue');
    this.appendStatus(JSON.stringify(ev), 'blue');
    console.log(ev);
    try{
      this.remoteVideo.srcObject = ev.streams[0];
      this.remoteVideo.play()
    }catch(e) {
      this.appendStatus(JSON.stringify(e), 'red');
    }
  }

  createOffer = async () => {
    this.status.innerHTML = '';
    
    const offerOption = {
      // To restart ICE on an active connection, set this to true. 
      // This will cause the returned offer to have different credentials than those already in place. 
      // If you then apply the returned offer, ICE will restart. Specify false to keep the same credentials and therefore not restart ICE. 
      // The default is false.
      iceRestart: true,
  
      // offerToReceiveAudio: 1 || 0,
      offerToReceiveVideo: 1 || 0,
  
      // Some codecs and hardware are able to detect when audio begins and ends by watching for "silence" 
      // (or relatively low sound levels) to occur. This reduces network bandwidth used for audio 
      // by only sending audio data when there's actually something to broadcast. 
      // However, in some cases, this is unwanted. For example, in the case of music or other non-voice transmission, 
      // this can cause loss of important low-volume sounds. Also, emergency calls should never cut audio when quiet. 
      // This option defaults to true (voice activity detection enabled).
      voiceActivityDetection: true
    }

    try {
      const offer = await this.PeerConnection.createOffer(offerOption)
      await this.PeerConnection.setLocalDescription(new RTCSessionDescription(offer));
      const offerText = JSON.stringify(this.PeerConnection.localDescription);
      // this.ws.ws.send(offerText);
      this.signal.emit('offer', this.PeerConnection.localDescription);
      this.offertext.value = offerText;
    }catch(e) {
      console.error(e);
    }
    
    
  }

  sendMessage = () => {
    if (!this.input.value) return;
    const msg = document.createElement('p');
    msg.innerText = this.input.value
    this.messageArea.appendChild(msg);
    this.input.value = '';
    this.input.focus();
  }

  copy = (el) => {
    el.select();
    document.execCommand("copy");
  }

  start = () => {
    this.PeerConnection = new RTCPeerConnection(this.configuration);
    
    
    
    // bound events
    Event.attach(this.PeerConnection, 'connectionstatechange', this.onConnectionStateChange);
    Event.attach(this.PeerConnection, 'datachannel', this.onDataChannel);
    Event.attach(this.PeerConnection, 'icecandidate', this.onIceCandidate);
    Event.attach(this.PeerConnection, 'iceconnectionstatechange', this.onIceConnectionStateChange);
    Event.attach(this.PeerConnection, 'icegatheringstatechange', this.onIceGatheringStateChange);
    Event.attach(this.PeerConnection, 'negotiationneeded', this.onNegotiationNeeded);
    Event.attach(this.PeerConnection, 'signalingstatechange', this.onSignalingStateChange);
    Event.attach(this.PeerConnection, 'track', this.onTrack);
    // this.PeerConnection.addEventListener('icecandidateerror', (e) => console.log('icecandidateerror', e));
    // this.PeerConnection.addEventListener('statsended', (ev) => console.log('onStatSended', ev));
    this.setupMediaStream();
  }

  reset = () => {
    if (this.PeerConnection) {
      Event.detach(this.PeerConnection, 'connectionstatechange', this.onConnectionStateChange);
      Event.detach(this.PeerConnection, 'datachannel', this.onDataChannel);
      Event.detach(this.PeerConnection, 'icecandidate', this.onIceCandidate);
      Event.detach(this.PeerConnection, 'iceconnectionstatechange', this.onIceConnectionStateChange);
      Event.detach(this.PeerConnection, 'icegatheringstatechange', this.onIceGatheringStateChange);
      Event.detach(this.PeerConnection, 'negotiationneeded', this.onNegotiationNeeded);
      Event.detach(this.PeerConnection, 'signalingstatechange', this.onSignalingStateChange);
      Event.detach(this.PeerConnection, 'track', this.onTrack);
      this.PeerConnection.close();
      this.PeerConnection = null;
    }
  }

  setupMediaStream = async () => {
    const options = {
      video: true,
      // audio: true
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(options)
      this.localVideo.srcObject = stream;
      stream.getTracks().forEach(track => this.PeerConnection.addTrack(track, stream));
      this.localVideo.play()
    }catch(e) {
      console.log(e);
      this.appendStatus('Unable to create Video/Audio stream', 'red');
    }
  }

  render () {
    return (
      <>
        <div className="webrtc-utils">
          <div className="webrtc-utils-l">
            <button onClick={this.createOffer} className="offer-button">Create Offer</button>
            <button className="offer-button" onClick={() => this.copy(this.offertext)}>Copy Offer</button>
            <button className="offer-button" onClick={() => this.offertext.value = ''}>Clear</button>
            <div>
              <p>Offer:</p>
              <textarea ref={el => this.offertext = el} className="offertext" readOnly={true}></textarea>
            </div>
            <button onClick={this.createAnwser} className="offer-button">Create Anwser</button>
            <button className="offer-button" onClick={() => this.copy(this.anwsertext)}>Copy Anwser</button>
            <button className="offer-button" onClick={() => this.anwsertext.value = ''}>Clear</button>
            <div>
              <p>Anwser:</p>
              <textarea ref={el => this.anwsertext = el} className="offertext"></textarea>
            </div>
          </div>
          <div className="webrtc-utils-r">
            <div>
              <select>
                <option>video</option>
              </select>
              <button className="offer-button" onClick={this.createOffer}>Start</button>
              <button className="offer-button" onClick={this.stop}>Stop</button>
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
        </div>
        <div className="webrtc-stats" ref={el => this.status = el}>
          
        </div>
      </>
    )
  }
}
