import iceParser from './utils/iceParser';

// Intro for WebRTC 'RTCPeerConnection' [configuration]
const configuration = {
  /** @param iceServers */
  // An array of RTCIceServer objects, each describing one server which may be used by the ICE agent; 
  // these are typically STUN and/or TURN servers. If this isn't specified, the ICE agent may choose to use its own ICE servers; 
  // otherwise, the connection attempt will be made with no STUN or TURN server available, which limits the connection to local peers.
  iceServers: [
    {urls: [
      'stun:stun.services.mozilla.com',
      'stun:sip1.lakedestiny.cordiaip.com',
      'stun:stun.callwithus.com',
      'stun:stun.counterpath.net',
      'stun:stun.ideasip.com',
      'stun:stun.internetcalls.com',
      'stun:stun.sipgate.net',
      'stun:stun.stunprotocol.org',
      'stun:stun.voip.aebc.com',
      'stun:stun.voipbuster.com',
      'stun:stun.voxgratia.org',
      'stun:stun.xten.com',
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302',
      'stun:stun4.l.google.com:19302',
      'stun:stun01.sipphone.com',
      'stun:stun.ekiga.net',
      'stun:stun.fwdnet.net',
      'stun:stun.ideasip.com',
      'stun:stun.iptel.org',
      'stun:stun.rixtelecom.se',
      'stun:stun.schlund.de',
      'stun:stunserver.org',
      'stun:stun.softjoys.com',
      'stun:stun.voiparound.com',
      'stun:stun.voipbuster.com',
      'stun:stun.voipstunt.com',
      'stun:stun.voxgratia.org',
      'stun:stun.xten.com'
    ]}
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
  iceCandidatePoolSize: 10,

  /** @param bundlePolicy */
  // "balanced" - On BUNDLE-aware connections, the ICE agent should gather candidates for all of the media types in use (audio, video, and data). Otherwise, the ICE agent should only negotiate one audio and video track on separate transports.
  // "max-compat" - The ICE agent should gather candidates for each track, using separate transports to negotiate all media tracks for connections which aren't BUNDLE-compatible.
  // "max-bundle" - The ICE agent should gather candidates for just one track. If the connection isn't BUNDLE-compatible, then the ICE agent should negotiate just one media track.
  // bundlePolicy: "balanced",

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
  // rtcpMuxPolicy: 'test'

  /** @param sdpSemantics */
  // "plan-b"
  // "unified-plan"
  // sdpSemantics: 'plan-b'

};

// Initial RTCPeerConnection with Options - [configuration]
const PeerConnection = new RTCPeerConnection(configuration);
createOffer();

/** @event connectionstatechange */
// Sent to the RTCPeerConnection object when the overall connectivity status of the RTCPeerConnection changes.
// "new" - The ICE agent is gathering addresses or is waiting to be given remote candidates through calls to RTCPeerConnection.addIceCandidate() (or both).
// "checking" - The ICE agent has been given one or more remote candidates and is checking pairs of local and remote candidates against one another to try to find a compatible match, but has not yet found a pair which will allow the peer connection to be made. It's possible that gathering of candidates is also still underway.
// "connected" - A usable pairing of local and remote candidates has been found for all components of the connection, and the connection has been established. It's possible that gathering is still underway, and it's also possible that the ICE agent is still checking candidates against one another looking for a better connection to use.
// "completed" - The ICE agent has finished gathering candidates, has checked all pairs against one another, and has found a connection for all components.
// "failed" - The ICE candidate has checked all candidates pairs against one another and has failed to find compatible matches for all components of the connection. It is, however, possible that the ICE agent did find compatible connections for some components.
// "disconnected" - Checks to ensure that components are still connected failed for at least one component of the RTCPeerConnection. This is a less stringent test than "failed" and may trigger intermittently and resolve just as spontaneously on less reliable networks, or during temporary disconnections. When the problem resolves, the connection may return to the "connected" state.
// "closed" - The ICE agent for this RTCPeerConnection has shut down and is no longer handling requests.
PeerConnection.addEventListener('connectionstatechange', onConnectionStateChange);

/** @event datachannel */
// Sent to the RTCPeerConnection object when the remote peer adds an RTCDataChannel to the connection.
// A datachannel event is sent to an RTCPeerConnection instance when an RTCDataChannel has been added to the connection, as a result of the remote peer calling RTCPeerConnection.createDataChannel().
PeerConnection.addEventListener('datachannel', onDataChannel);

/** @event icecandidate */
// Sent to the object when a new ICE candidate arrives during negotiation.
// An icecandidate event is sent to an RTCPeerConnection when an RTCIceCandidate has been added to the target 
// as a result of calling RTCPeerConnection.setLocalDescription(). 
// This event handler should transmit the candidate to the remote peer so that the remote peer can add it its set of remote candidates.
PeerConnection.addEventListener('icecandidate', onIceCandidate);

/** @event icecandidateerror */
PeerConnection.addEventListener('icecandidateerror', (e) => console.log('icecandidateerror', e));

/** @event iceconnectionstatechange */
// Sent to the RTCPeerConnection when the state of the ICE connection changes, such as when it disconnects.
// An iceconnectionstatechange event is sent to an RTCPeerConnection object each time the ICE connection state changes 
// during the negotiation process. The new ICE connection state is available in the object's {iceConnectionState} property.
PeerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);

/** @event icegatheringstatechange */
// The RTCIceGatheringState enum defines string constants which reflect the current status of ICE gathering, as returned using the RTCPeerConnection.iceGatheringState property. 
// "new" - The peer connection was just created and hasn't done any networking yet.
// "gathering" - The ICE agent is in the process of gathering candidates for the connection.
// "complete"	- The ICE agent has finished gathering candidates. If something happens that requires collecting new candidates, such as a new interface being added or the addition of a new ICE server, the state will revert to "gathering" to gather those candidates.
PeerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange);

/** @event negotiationneeded */
// Sent to the RTCPeerConnection when it's time to perform ICE negotiation. 
// This can happen both when first opening a connection as well as any time it's necessary to adapt to changing network conditions.
PeerConnection.addEventListener('negotiationneeded', onNegotiationNeeded);

/** @event signalingstatechange */
// The signalingstatechange event is sent to the RTCPeerConnection when the connection's ICE signaling state changes.
// An signalingstatechange event is sent to an RTCPeerConnection to notify it that its signaling state, 
// as indicated by the signalingState property, has changed.
// "stable" -	There is no ongoing exchange of offer and answer underway. This may mean that the RTCPeerConnection object is new, in which case both the localDescription and remoteDescription are null; it may also mean that negotiation is complete and a connection has been established.
// "have-local-offer"	- The local peer has called RTCPeerConnection.setLocalDescription(), passing in SDP representing an offer (usually created by calling RTCPeerConnection.createOffer()), and the offer has been applied successfully.
// "have-remote-offer" - The remote peer has created an offer and used the signaling server to deliver it to the local peer, which has set the offer as the remote description by calling RTCPeerConnection.setRemoteDescription().
// "have-local-pranswer" - The offer sent by the remote peer has been applied and an answer has been created (usually by calling RTCPeerConnection.createAnswer()) and applied by calling RTCPeerConnection.setLocalDescription(). This provisional answer describes the supported media formats and so forth, but may not have a complete set of ICE candidates included. Further candidates will be delivered separately later.
// "have-remote-pranswer" - A provisional answer has been received and successfully applied in response to an offer previously sent and established by calling setLocalDescription().
PeerConnection.addEventListener('signalingstatechange', onSignalingStateChange);

/** @event statsended */
PeerConnection.addEventListener('statsended', (ev) => console.log('onStatSended', ev));

/** @event track */
// The track event is sent after a new track has been added to one of the RTCRtpReceiver instances which comprise the connection.
// The track event is sent to the ontrack event handler on RTCPeerConnections after a new track has been added to an RTCRtpReceiver which is part of the connection.
PeerConnection.addEventListener('track', onTrack);



function onConnectionStateChange (ev) {
  console.log('onConnectionStateChange:', ev);
  switch(PeerConnection.connectionState) {
    case "new":
      console.log("New Connection coming...");
      break;
    case "connecting":
      console.log("Connecting...");
      break;
    case "connected":
      console.log("Online");
      break;
    case "disconnected":
      console.log("Disconnecting...");
      break;
    case "closed":
      console.log("Offline");
      break;
    case "failed":
      console.log("Error");
      break;
    default:
      console.log("Unknown");
      break;
  }
}

function onDataChannel (ev) {
  // receiveChannel is set to the value of the event's channel property, 
  // which specifies the RTCDataChannel object representing the data channel linking the remote peer to the local one.
  console.log('onDataChannel', ev);
  let receiveChannel;
  receiveChannel = ev.channel;
  receiveChannel.onmessage = (e) => e;
  receiveChannel.onopen = (e) => e;
  receiveChannel.onclose = (e) => e;
}

function onIceCandidate (ev) {
  console.log('onIceCandidate', ev);
  if (ev.candidate) {
    console.log({
      type: "new-ice-candidate",
      candidate: iceParser(ev.candidate.candidate, true)
    });
  }
}

function onIceConnectionStateChange (ev) {
  console.log('onIceConnectionStateChange:', ev);
  switch(PeerConnection.iceConnectionState) {
    case "new":
      console.log("New Connection coming...");
      break;
    case "checking":
      console.log("Checking...");
      break;
    case "connected":
      console.log("connected");
      break;
    case "disconnected":
      console.log("disconnected");
      break;
    case "closed":
      console.log("Offline");
      break;
    case "failed":
      console.log("Error");
      break;
    default:
      console.log("Unknown");
      break;
  }
}

function onIceGatheringStateChange (ev) {
  console.log('onIceGatheringStateChange:', ev);
  switch(PeerConnection.iceGatheringState) {
    case "new":
      console.log("New gathering coming...");
      break;
    case "gathering":
      console.log("gathering...");
      break;
    case "complete":
      console.log("complete");
      break;
    default:
      console.log("Unknown");
      break;
  }
}

// After creating the offer, the local end is configured by calling RTCPeerConnection.setLocalDescription(); 
// then a signaling message is created and sent to the remote peer through the signaling server, 
// to share that offer with the other peer. 
// The other peer should recognize this message and follow up by creating its own RTCPeerConnection, 
// setting the remote description with setRemoteDescription(), and then creating an answer to send back to the offering peer.
function onNegotiationNeeded (ev) {
  console.log('onNegotiationNeeded:', ev);
}

function onSignalingStateChange (ev) {
  console.log('onSignalingStateChange:', ev);
  switch(PeerConnection.signalingState) {
    case "stable":
      console.log("ICE negotiation complete(stable)");
      break;
    case "have-local-offer":
      console.log("ICE negotiation have-local-offer");
      break;
    case "have-remote-offer":
      console.log("ICE negotiation have-remote-offer");
      break;
    case "have-local-pranswer":
      console.log("ICE negotiation have-local-pranswer");
      break;
    case "have-remote-pranswer":
      console.log("ICE negotiation have-remote-pranswer");
      break;
    default:
      console.log('Unknown');
  }
}

function onTrack (ev) {
  console.log('onTrack:', ev);
  // videoElement.srcObject = ev.streams[0];
  // hangupButton.disabled = false;
}

function createOffer () {
  const offerOption = {
    // To restart ICE on an active connection, set this to true. 
    // This will cause the returned offer to have different credentials than those already in place. 
    // If you then apply the returned offer, ICE will restart. Specify false to keep the same credentials and therefore not restart ICE. 
    // The default is false.
    iceRestart: true,

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
  PeerConnection.createOffer(offerOption)
    .then(offer => PeerConnection.setLocalDescription(offer))
    .then(() => console.log({
      type: "video-offer",
      sdp: PeerConnection.localDescription
    }))
    .catch(err => 
      /* handle error */
      console.log(err)
    );
}

export default PeerConnection;