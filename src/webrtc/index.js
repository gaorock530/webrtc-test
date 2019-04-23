import iceParser from 'utils/iceParser';
import React from 'react';
import 'webrtc-adapter';
import stunServer from './stun-servers.json';

export default class WebRTC extends React.PureComponent{
  constructor (props) {
    super(props);
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
      rtcpMuxPolicy: 'negotiate'
    
      /** @param sdpSemantics */
      // "plan-b"
      // "unified-plan"
      // sdpSemantics: 'plan-b'
    
    };
  }

  componentDidMount () {
    this.PeerConnection = new RTCPeerConnection(this.configuration);
    // bound events
    this.PeerConnection.addEventListener('connectionstatechange', this.onConnectionStateChange);
    this.PeerConnection.addEventListener('datachannel', this.onDataChannel);
    this.PeerConnection.addEventListener('icecandidate', this.onIceCandidate);
    this.PeerConnection.addEventListener('icecandidateerror', (e) => console.log('icecandidateerror', e));
    this.PeerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange);
    this.PeerConnection.addEventListener('icegatheringstatechange', this.onIceGatheringStateChange);
    this.PeerConnection.addEventListener('negotiationneeded', this.onNegotiationNeeded);
    this.PeerConnection.addEventListener('signalingstatechange', this.onSignalingStateChange);
    this.PeerConnection.addEventListener('statsended', (ev) => console.log('onStatSended', ev));
    this.PeerConnection.addEventListener('track', this.onTrack);
    this.setupMediaStream();
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
        return this.appendStatus("Peer Disconnecting...");
      case "closed":
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
        return this.appendStatus("ICE disconnected");
      case "closed":
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
    this.remoteVideo.srcObject = ev.streams[0];
    this.remoteVideo.play();
  }

  createOffer = () => {
    this.status.innerHTML = '';
    
    const offerOption = {
      // To restart ICE on an active connection, set this to true. 
      // This will cause the returned offer to have different credentials than those already in place. 
      // If you then apply the returned offer, ICE will restart. Specify false to keep the same credentials and therefore not restart ICE. 
      // The default is false.
      iceRestart: false,
  
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
    this.PeerConnection.createOffer(offerOption)
      .then(offer => this.PeerConnection.setLocalDescription(new RTCSessionDescription(offer)))
      .then(() => {
        this.offer = this.PeerConnection.localDescription
        this.offertext.value = JSON.stringify(this.offer);
      })
      .catch(err => 
        /* handle error */
        console.log(err)
      );
  }

  createAnwser = async () => {
    if (this.anwsertext.value === '') return console.log('Remote Offer not Provided!');
    const remoteOffer = new RTCSessionDescription(JSON.parse(this.anwsertext.value));
    console.log('remoteOffer:\n',remoteOffer);
    this.appendStatus('Get remote offer...');
    this.appendStatus('Set remote offer...');

    try{
      await this.PeerConnection.setRemoteDescription(remoteOffer);
      this.appendStatus('setRemoteDescription ok.');
      this.appendStatus(`Remote Description Type: ${remoteOffer.type}`);
      if(remoteOffer.type === "offer"){
        const description = await this.PeerConnection.createAnswer();
        console.log('createAnswer:\n',description);
        this.appendStatus('Anwser for remote created.');
        this.PeerConnection.setLocalDescription(description)
        this.appendStatus('Set Local Description Success.');
      }
    }catch(e) {
      this.appendStatus('Unable to create an offer. see Console.', 'red');
      console.log("Unable to create an offer: " + e.toString());
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

  retry = () => {
    if (this.PeerConnection) {
      this.PeerConnection.removeEventListener('connectionstatechange', this.onConnectionStateChange);
      this.PeerConnection.removeEventListener('datachannel', this.onDataChannel);
      this.PeerConnection.removeEventListener('icecandidate', this.onIceCandidate);
      this.PeerConnection.removeEventListener('icecandidateerror', (e) => console.log('icecandidateerror', e));
      this.PeerConnection.removeEventListener('iceconnectionstatechange', this.onIceConnectionStateChange);
      this.PeerConnection.removeEventListener('icegatheringstatechange', this.onIceGatheringStateChange);
      this.PeerConnection.removeEventListener('negotiationneeded', this.onNegotiationNeeded);
      this.PeerConnection.removeEventListener('signalingstatechange', this.onSignalingStateChange);
      this.PeerConnection.removeEventListener('statsended', (ev) => console.log('onStatSended', ev));
      this.PeerConnection.removeEventListener('track', this.onTrack);
    }
  }

  setupMediaStream = async () => {
    const options = {
      video: true,
      audio: true
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
              <button className="offer-button">Start</button>
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
