/**
 * @description WebSocket Signaling Class 
 * 
 */
import {hex_md5 as md5} from 'utils/md5';
import Event from 'utils/event';
import Debouncer from 'utils/debouncer';

// get navigator for unique user finger-print
// 1. userAgent
const UA = navigator.userAgent || window.navigator.userAgent;
// 2. screen size
const SS = (window.screen.width + window.screen.height) || false;
const SD = (window.screen.colorDepth + window.screen.pixelDepth) || false;
// 3. device memory
// const ND = navigator.deviceMemory || window.navigator.deviceMemory || false;
// 4. hardwareConcurrency
const HC = navigator.hardwareConcurrency || window.navigator.hardwareConcurrency || false;

// hash for finger print
const FingerPrint = md5(UA + SS + SD + HC);

const defaultOptions = {
  autoreconnect: true,
  retryIn: 5,
  attempt: 5,
  protocol: null,
  binaryType: 'arraybuffer',                                          // Blob | ArrayBuffer
  arraybuffer: true
}

function Socket (uri, options) {
  this.url = uri || process.env.REACT_APP_WS_PATH;                    // custom url
  this.options = Object.assign({}, defaultOptions, options);          // custom options    
  this.socket = null;                                                 // stores WebSocket connection
  this.eventEmitter = new Event();                                    // stores instance events for client
  if (this.options.autoreconnect) {
    this.reconnection = new Debouncer(this.connect.bind(this), this.options.retryIn, this.options.attempt);
  } else this.reconnection = null;
  this.init();                                                        // initialize & check
}

Socket.prototype = {
  // client unique ID
  get Token() {
    return FingerPrint;
  },
  // WebSocket ready state
  get readyState () {
    return this.socket ? this.socket.readyState : 0;
  },
  get connected () {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  },
  get isAllowReconnect () {
    return this.options.autoreconnect && !this.connected;
  },
  // get socket buffer amount
  get buffer () {
    return this.socket ? this.socket.bufferedAmount : null;
  },
  get SUPPORT () {
    return 'WebSocket' in window;
  }
}

Socket.prototype.init = function () {
  if (!this.SUPPORT) return console.warn('WebSocket not Supported.');
  Object.keys(this.options).forEach(key => {
    if (typeof defaultOptions[key] === 'undefined') console.error(key, 'in options is Not valid.');
  });
  if (this.options.binaryType && 
    this.options.binaryType !== 'blob' && 
    this.options.binaryType !== 'arraybuffer') return console.error("binaryType: worng. should be 'Blob | ArrayBuffer'");
  this.onOpen = this.onOpen.bind(this);
  this.onMessage = this.onMessage.bind(this);
  this.onClose = this.onClose.bind(this);
  this.onError = this.onError.bind(this);
  this.connect()
}

Socket.prototype.connect = function () {
  if (this.socket instanceof WebSocket && this.connected) { 
    return console.warn('connection is restored or already established.');
  }
  
  this.socket = new WebSocket(this.url);
  this.socket.binaryType = this.options.binaryType;
  Event.attach(this.socket, 'open', this.onOpen);
  Event.attach(this.socket, 'message', this.onMessage);
  Event.attach(this.socket, 'close', this.onClose);
  Event.attach(this.socket, 'error', this.onError);
}

Socket.prototype.reset = function () {
  if (!this.socket) return;
  Event.detach(this.socket, 'open', this.onOpen);
  Event.detach(this.socket, 'message', this.onMessage);
  Event.detach(this.socket, 'close', this.onClose);
  Event.detach(this.socket, 'error', this.onError);
  this.socket = null;
}

Socket.prototype.onOpen = function () {
  if (this.reconnection) this.reconnection.stop();
  this.eventEmitter.emit('open', {id: this.Token});
} 

Socket.prototype.onMessage = function (e) {
  let parsedData;
  if (e.data instanceof ArrayBuffer) parsedData = decode(e.data);
  try {parsedData = JSON.parse(e.data)} catch(e) {}
  const {type, data} = parsedData;
  this.eventEmitter.emit(type, data);
}

Socket.prototype.onClose = function (e) {
  this.eventEmitter.emit('close', e.code, e.reason || 'normal closing.');
  this.reset();
  if (this.reconnection && this.isAllowReconnect && e.code < 4000) this.reconnection.start();
}

Socket.prototype.onError = function (e) {
  this.eventEmitter.emit('error', e);
  this.reset();
  if (this.reconnection && this.options.autoreconnect) this.reconnection.start();
}

Socket.prototype.on = function (event, fn, once) {
  return this.eventEmitter.on(event, fn, once);
}

Socket.prototype.emit = function (type, data) {
  if (!this.connected) return console.warn(`WebSocket connection isn't ready. on Event[type]`);
  let packet;
  if (typeof data === 'object' && !(data instanceof ArrayBuffer)) {
    packet = JSON.stringify({type, data});
  }
  this.socket.send(this.options.arraybuffer ? encode(packet): packet);
}

Socket.prototype.close = function () {
  this.socket.close(4001, 'closed by component.');
}





export default Socket;


function encode (str) {
  var len = str.length;
  var bytes = new Uint16Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}
function decode (buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
