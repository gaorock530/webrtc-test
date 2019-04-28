/**
 * @description WebRTC interface
 */

import adapter from 'webrtc-adapter';
import stunServer from 'webrtc/stun-servers.json';
import Event from 'utils/event';
// import iceParser from 'utils/iceParser';
import Socket from 'utils/signal';
import { Promise } from 'q';

const defalutConfiguration = {
  /** @param iceServers */
  // An array of RTCIceServer objects, each describing one server which may be used by the ICE agent; 
  // these are typically STUN and/or TURN servers. If this isn't specified, the ICE agent may choose to use its own ICE servers; 
  // otherwise, the connection attempt will be made with no STUN or TURN server available, which limits the connection to local peers.
  iceServers: [
    {urls: stunServer.servers}
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
  iceCandidatePoolSize: 5,

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
  rtcpMuxPolicy: 'negotiate',

  /** @param sdpSemantics */
  // "plan-b"
  // "unified-plan"
  sdpSemantics: 'unified-plan'

};

/**
 * @constructor 
 * @property {Adapter} this.adapter adapter.js is a shim to insulate apps from spec changes and prefix differences. 
 * In fact, the standards and protocols used for WebRTC implementations are highly stable, and there are only a few prefixed names. 
 */

/** @constructor  */
function WebRTC (configuration) {
  this.adapter = adapter;
  this.configuration = Object.assign({}, defalutConfiguration, configuration);          // custom options    
  this.PeerConnection = null;                                                     // main WebRTC connection
  this.iceTray = [];                                                              // temp ICE canadites
  this.eventEmitter = new Event();
  this.signaling = new Socket(process.env.REACT_APP_WS_PATH, {attempt: 10, retryIn: 3, arraybuffer: false})

  this.localStream = null;
  this.onConnectionStateChange = this.onConnectionStateChange.bind(this);
  this.onDataChannel = this.onDataChannel.bind(this);
  this.onIceCandidate = this.onIceCandidate.bind(this);
  this.onIceConnectionStateChange = this.onIceConnectionStateChange.bind(this);
  this.onIceGatheringStateChange = this.onIceGatheringStateChange.bind(this);
  this.onNegotiationNeeded = this.onNegotiationNeeded.bind(this);
  this.onSignalingStateChange = this.onSignalingStateChange.bind(this);
  this.onConnectionStateChange = this.onConnectionStateChange.bind(this);
  this.onTrack = this.onTrack.bind(this);
  this.init();
}


WebRTC.prototype = {
  get SUPPORT () {
    return 'RTCPeerConnection' in window;
  },
  get AllCorrect () {
    return checkSDPSemanticsPlan(this.configuration['sdpSemantics']) &&
          chackRtcpMuxPolicy(this.configuration['rtcpMuxPolicy']) &&
          checkBundlePolicy(this.configuration['bundlePolicy']) &&
          checkIceTransportPolicy(this.configuration['iceTransportPolicy']);
  },
  set iceCandidatePoolSize (size) {
    this.configuration['iceCandidatePoolSize'] = size;
    // need a trigger
  },
  set sdpSemantics (plan) {
    if (!checkSDPSemanticsPlan(plan)) return console.error('set:[sdpSemantics] error.');
    this.configuration['sdpSemantics'] = plan;
    // need a trigger
  }
}


WebRTC.prototype.init = function () {
  if (!this.SUPPORT) return console.error('WebRTC is not supported.');
  Object.keys(this.configuration).forEach(key => {
    if (typeof defalutConfiguration[key] === 'undefined') return console.error(key, 'in options is Not valid.');
  });
  if (!this.AllCorrect) return console.error('Policy error.');
  this.establishConnection();
}

WebRTC.prototype.establishConnection = function () {
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
  this.boundSingling();
}

WebRTC.prototype.closeConnection = async function () {
  if (!this.PeerConnection) return;
  this.PeerConnection.close();
  await this.PeerConnection.getStats(null);

  Event.detach(this.PeerConnection, 'connectionstatechange', this.onConnectionStateChange);
  Event.detach(this.PeerConnection, 'datachannel', this.onDataChannel);
  Event.detach(this.PeerConnection, 'icecandidate', this.onIceCandidate);
  Event.detach(this.PeerConnection, 'iceconnectionstatechange', this.onIceConnectionStateChange);
  Event.detach(this.PeerConnection, 'icegatheringstatechange', this.onIceGatheringStateChange);
  Event.detach(this.PeerConnection, 'negotiationneeded', this.onNegotiationNeeded);
  Event.detach(this.PeerConnection, 'signalingstatechange', this.onSignalingStateChange);
  Event.detach(this.PeerConnection, 'track', this.onTrack);

  this.PeerConnection = null;
}

WebRTC.prototype.boundSingling = function () {
  this.signaling.on('open', (e) => console.log('websocket is open', e));
  this.signaling.on('close', (code, reason) => {
    console.log('socket closed.', code, reason);
  });

  this.signaling.on('ice', async (data) => {
    const addIce = async (ice) => {
      await this.PeerConnection.addIceCandidate(new RTCIceCandidate(ice));
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
  this.signaling.on('offer', async (data) => {
    console.log(data);
    
    try {
      // ('Set remote SDP .')
      await this.PeerConnection.setRemoteDescription(new RTCSessionDescription(data));
      // ('Anwser for remote .')
      const description = await this.PeerConnection.createAnswer();
      // ('Set local SDP .')
      this.PeerConnection.setLocalDescription(description);
      this.signaling.emit('answer', description);
    }catch(e) {
      console.warn(e)
    }
  });

  this.signaling.on('answer', async (data) => {
    try {
      console.log(data);
      await this.PeerConnection.setRemoteDescription(new RTCSessionDescription(data));
      console.log(this.PeerConnection);
    }catch(e) {
      console.warn(e)
    }
  });
}

WebRTC.prototype.addStream = function () {
  this.localStream.getTracks().forEach(track => console.log(this.PeerConnection.addTrack(track, this.localStream)));
}

WebRTC.prototype.endStream = function () {
  // this.PeerConnection.removeTrack(this.sender);
  this.localStream.getTracks().forEach(track => track.stop());
  this.localStream = null;
}

WebRTC.prototype.onConnectionStateChange = function (ev) {
  let state = 0;
  if (ev.target.connectionState=== 'new' || ev.target.connectionState === 'connecting') state = 1;
  else if (ev.target.connectionState === 'connected') state = 2;
  this.eventEmitter.emit('connectionStateChange', {state, detail: ev.target.connectionState});
}

WebRTC.prototype.onDataChannel = function (ev) {
  // receiveChannel is set to the value of the event's channel property, 
  // which specifies the RTCDataChannel object representing the data channel linking the remote peer to the local one.
  this.eventEmitter.emit('dataChannel', ev.channel);
  // let receiveChannel;
  // receiveChannel = ev.channel;
  // receiveChannel.onmessage = (e) => e;
  // receiveChannel.onopen = (e) => e;
  // receiveChannel.onclose = (e) => e;
}

WebRTC.prototype.onIceCandidate = function (ev) {
  if (ev.candidate) this.signaling.emit('ice', ev.candidate);
  this.eventEmitter.emit('iceCandidate', ev.candidate || false);
}

WebRTC.prototype.onIceConnectionStateChange = function (ev) {
  let state = 0;
  if (ev.target.iceConnectionState === 'new' || ev.target.iceConnectionState === 'checking') state = 1;
  else if (ev.target.iceConnectionState === 'connected' || ev.target.iceConnectionState === 'completed') state = 2;
  this.eventEmitter.emit('iceConnectionStateChange', {state, detail: ev.target.iceConnectionState});
}

WebRTC.prototype.onIceGatheringStateChange = function (ev) {
  let state = 0;
  if (ev.target.iceGatheringState === 'new' || ev.target.iceGatheringState === 'gathering') state = 1;
  else if (ev.target.iceGatheringState === 'complete') state = 2;
  this.eventEmitter.emit('iceGatheringStateChange', {state, detail: ev.target.iceGatheringState});
}

WebRTC.prototype.onNegotiationNeeded = function (ev) {
  this.eventEmitter.emit('negotiationNeeded', ev);
}

/**
 * @description 'stable', 'have-local-offer', 'have-remote-offer', 'have-local-pranswer', 'have-remote-pranswer'
 */
WebRTC.prototype.onSignalingStateChange = function (ev) {
  this.eventEmitter.emit('signalingStateChange', {
    state: ev.target.signalingState === 'stable' ? 1:0, 
    detail: ev.target.signalingState});
}

WebRTC.prototype.onTrack = function (ev) {
  console.log('onTrack event');
  this.eventEmitter.emit('track', ev);
}


const mediaStreamConstraint = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: {min: 24, ideal: 30, max: 60},
    facingMode: "user",     // "environment"
    // deviceId: myPreferredCameraDeviceId
  },
  audio: {
    // deviceId: myPreferredCameraDeviceId
  }
}

WebRTC.prototype.setupLocalMediaStream = async function (option) {
  if (this.localStream) {
    this.localStream.getTracks().forEach(track => track.stop());
    const videoTracks = this.localStream.getVideoTracks();
    for (let i = 0; i !== videoTracks.length; ++i) {
      videoTracks[i].stop();
    }
  }
  try {
    const setup = getUserMediaConstraints(option || {audio: true});
    console.log(option)
    console.log(setup);
    const stream = await navigator.mediaDevices.getUserMedia(setup);
    this.localStream = stream;
    return this.localStream;
  }catch(e) {
    console.error('Unable to create Video/Audio stream:', e.toString());
    throw Error(e);
  }
}

WebRTC.prototype.createOffer = async function () {
  const offerOption = {
    // To restart ICE on an active connection, set this to true. 
    // This will cause the returned offer to have different credentials than those already in place. 
    // If you then apply the returned offer, ICE will restart. Specify false to keep the same credentials and therefore not restart ICE. 
    // The default is false.
    iceRestart: false,

    offerToReceiveAudio: 1 || 0,
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
    this.signaling.emit('offer', this.PeerConnection.localDescription);
  }catch(e) {
    return e;
  } 
}

WebRTC.prototype.on = function (event, fn, once) {
  console.log('add event:', event);
  return this.eventEmitter.on(event, fn, once);
}



export default WebRTC;


function checkSDPSemanticsPlan(plan) {
  return plan === 'unified-plan' || plan === 'plan-b';
}

function chackRtcpMuxPolicy (policy) {
  return policy === 'negotiate' || policy === 'require';
}

function checkBundlePolicy (policy) {
  return policy === 'balanced' || policy === 'max-compat' || policy === 'max-bundle';
}

function checkIceTransportPolicy (policy) {
  return policy === 'all' || policy === 'relay';
}

function getUserMediaConstraints (constraint) {
  return Object.assign({}, mediaStreamConstraint, constraint);
}
