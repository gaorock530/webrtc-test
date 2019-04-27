const WebSocket = require('ws');
const { Origins } = require('../constant');
const cuid = require('cuid');


class RTCSignalingServer {
  constructor (server) {
    const options = {
      // server: server || null,             // {http.Server|https.Server} A pre-created Node.js HTTP/S server.
      verifyClient,                       // {Function} A function which can be used to validate incoming connections.
      noServer: true,                  // {Boolean} Enable no server mode. Shared server.
      // handleProtocols,                 // {Function} A function which can be used to handle the WebSocket subprotocols. 
      perMessageDeflate: true,            // {Boolean|Object} Enable/disable permessage-deflate.
      // clientTracking: true                // {Boolean} Specifies whether or not to track clients.
    }
    this.server = new WebSocket.Server(options);

    this.server.on('connection', this.onConnection.bind(this));
    console.log(this.broadcast);
  }

  /** @returns {Set} */
  // A set that stores all connected clients. Please note that this property is only added when the clientTracking is truthy.
  get clients () {
    return this.server.clients;
  }

  onConnection (ws, req) {
    const self = this;
    ws.id = cuid();
    console.log('new socket open:', ws.id);
    // events handlers on each connection
    ws.on('message', onMessage);
    ws.on('close', onClose);
    ws.on('error', onError);

    function onMessage(e) {
      const parsedData = JSON.parse(e);
      console.log('Message received:', parsedData);
      self.broadcast(parsedData.type, parsedData.data, null, ws.id);
    }
  
    function onClose (code, reason) {
      console.log('Client disconnected.', code, reason);
    }
    function onError (error) {
      console.log('Error', error);
    }
  }

  broadcast (type, data, room, feedbackID) {
    const stringData = JSON.stringify({type, data});
    this.clients.forEach(ws => {
      if (room && ws.room === room && ((feedbackID && feedbackID !== ws.id) || !feedbackID)) ws.send(stringData);
      else if ((feedbackID && feedbackID !== ws.id) || !feedbackID) ws.send(stringData); 
    })
  }
  
}

function verifyClient (info, cb) {
  let result = true, code, name, headers;

  if (Origins.indexOf(info.origin) === -1) {
    result = false;
    code = 401;
    headers = { 'Error-Code': 1011 };
  };

  // const cookie = parseCookie(info.req.headers.cookie);
  // if (!cookie.token) {
  //   result = false;
  //   code = 401;
  //   headers = { 'Error-Code': 104 };
  // }
  // console.log('cookie.token: ' + cookie.token);

  return cb(result, code, name, headers);
}



module.exports = RTCSignalingServer;