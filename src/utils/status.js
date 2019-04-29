/**
 * @description Gether WebRTC connection info
 */

function Status () {
  this.videoBytesPrev = 0;
  this.audioBytesPrev = 0;
  this.videoTimestampPrev = 0;
  this.audioTimestampPrev = 0;
  this.videoFrames = 0;
}

Status.prototype.reset = function() {
  this.videoBytesPrev = 0;
  this.audioBytesPrev = 0;
  this.videoTimestampPrev = 0;
  this.audioTimestampPrev = 0;
  this.videoFrames = 0;
}


Status.prototype.show = function (results) {
  const output = {};

  // figure out the peer's ip
  let activeCandidatePair = null;
  let localCandidate = null;
  let remoteCandidate = null;

  results.forEach(report => {
    const now = report.timestamp;

    // Video
    let videoBitrate;
    let videoTrack;
    let videoCodec;

    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      videoTrack = results.get(report.trackId);
      videoCodec = results.get(report.codecId);

      if (videoTrack && videoCodec) {
        output['videoCodec'] = videoCodec.mimeType;
        output['videoClockRate'] = videoCodec.clockRate;
        output['videoFrameWidth'] = videoTrack.frameWidth + 'px';
        output['videoFrameHeight'] = videoTrack.frameHeight + 'px';

        output['videoFrameRate'] = (videoTrack.framesReceived - this.videoFrames) + ' fps';
        this.videoFrames = videoTrack.framesReceived;
        output['videoFrameDrop'] = videoTrack.framesDropped;

        const bytes = report.bytesReceived;
        if (this.videoTimestampPrev) {
          videoBitrate = 8 * (bytes - this.videoBytesPrev) / (now - this.videoTimestampPrev);
          videoBitrate = Math.floor(videoBitrate);
        }
        this.videoBytesPrev = bytes;
        this.videoTimestampPrev = now;
      }
      if (videoBitrate) {
        videoBitrate += ' kbits/sec';
        output['videoBitrate'] = videoBitrate;
      }
    }
    

    // Audio
    let audioBitrate;
    let audioTrack;
    let audioCodec;
    if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
      audioTrack = results.get(report.trackId);
      audioCodec = results.get(report.codecId);

      if (audioTrack && audioCodec) {
        output['audioCodec'] = audioCodec.mimeType;
        output['audioClockRate'] = audioCodec.clockRate;
        output['audioSampleRate'] = Math.floor(audioTrack.totalSamplesReceived / audioTrack.totalSamplesDuration);
        output['audioLevel'] = audioTrack.audioLevel.toFixed(6);
        output['audioEnergy'] = audioTrack.totalAudioEnergy.toFixed(6);
      }

      const bytes = report.bytesReceived;
      if (this.audioTimestampPrev) {
        audioBitrate = 8 * (bytes - this.audioBytesPrev) / (now - this.audioTimestampPrev);
        audioBitrate = Math.floor(audioBitrate);
      }
      this.audioBytesPrev = bytes;
      this.audioTimestampPrev = now;
    }


    if (audioBitrate) {
      audioBitrate += ' kbits/sec';
      output['audioBitrate'] = audioBitrate;
    }

    // figure out the peer's ip
    // Search for the candidate pair, spec-way first.
    if (report.type === 'transport') {
      activeCandidatePair = results.get(report.selectedCandidatePairId);
      output['bytesSent'] = report.bytesSent;
      output['bytesReceived'] = report.bytesReceived;
    }

  });

  // figure out the peer's ip
  // Fallback for Firefox.
  if (!activeCandidatePair) {
    results.forEach(report => {
      if (report.type === 'candidate-pair' && report.selected) {
        activeCandidatePair = report;
      }
    });
  }
  if (activeCandidatePair && activeCandidatePair.remoteCandidateId) {
    remoteCandidate = results.get(activeCandidatePair.remoteCandidateId);
  }
  if (activeCandidatePair && activeCandidatePair.localCandidateId) {
    localCandidate = results.get(activeCandidatePair.localCandidateId);
  }

  if (activeCandidatePair && activeCandidatePair.availableOutgoingBitrate) {
    output['availableOutgoingBandwidth'] = Math.floor(activeCandidatePair.availableOutgoingBitrate / 1000 ) + 'kbits/s';
  }

  if (localCandidate) {
    output['protocol'] = remoteCandidate.protocol;
    output['candidateType'] = remoteCandidate.candidateType;
    output['priority'] = remoteCandidate.priority;
    if (localCandidate.ip && localCandidate.port) {
      output['localAddress'] = `${localCandidate.ip}:${localCandidate.port}`;
    } else if (localCandidate.ipAddress && localCandidate.portNumber) {
      // Fall back to old names.
      output['localAddress'] = `${localCandidate.ipAddress}:${localCandidate.portNumber}`;
    }
  }

  if (remoteCandidate) {
    output['protocol'] = remoteCandidate.protocol;
    output['candidateType'] = remoteCandidate.candidateType;
    output['priority'] = remoteCandidate.priority;
    if (remoteCandidate.ip && remoteCandidate.port) {
      output['remoteAddress'] = `${remoteCandidate.ip}:${remoteCandidate.port}`;
    } else if (remoteCandidate.ipAddress && remoteCandidate.portNumber) {
      // Fall back to old names.
      output['remoteAddress'] = `${remoteCandidate.ipAddress}:${remoteCandidate.portNumber}`;
    }
  }


  return output;
}

export default Status;

/*
{
  bytesSent: 
  bytesReceived:  
  tansportProtocol:
  candidateType: 
  availableOutgoingBitrate:
  priority: 

  localAddress:                 
  remoteAddress: 

  videoCodec:
  videoClockRate:
  audioCodec:
  audioClockRate:
  audioSampleRate:

  audioBitrate:
  audioLevel:
  audioEnergy:

  videoFrameWidth:
  videoFrameHeight:
  videoFrameRate:
  videoFrameDrop:
  videoBitrate: 
}
 */