const {URL} = require('url');

const rtcSignalingServer = require('./rtc');


/**
 * ------------------------------------------------------------------------
 * @description Setup WebSocket Server For WebRTC signaling and MORE(?)
 * ------------------------------------------------------------------------
 */

module.exports = (server) => {
  const rtc = new rtcSignalingServer(server);

  server.on('upgrade', (request, socket, head) => {
    const wsPathname = new URL(request.headers.origin + request.url).pathname;
    console.log(wsPathname);
    // rtc.server.handleUpgrade(request, socket, head, (ws) => {
    //   rtc.server.emit('connection', ws, request);
    // })
    if (wsPathname === '/rtcsignaling') {
      rtc.server.handleUpgrade(request, socket, head, (ws) => {
        rtc.server.emit('connection', ws, request);
      })
    } else {
      socket.destory();
    }
  })
}
