

export default class wsConection {
  constructor() {
    this.ws = new WebSocket('wss://localhost:5000/rtcsignaling');
    this.ws.addEventListener('open', this.onOpen.bind(this));
    this.ws.addEventListener('message', this.onMessage.bind(this));
    this.ws.addEventListener('close', this.onClose.bind(this));
    this.ws.addEventListener('error', this.onError.bind(this));
  }

  onOpen (e) {
    console.log('websocket open', e.target);
  }
  onMessage (e) {
    // console.log('websocket get message:', e);
  }
  onClose (e) {
    console.log('websocket Closed.', e);
  }
  onError (e) {
    console.log('websocket error', e);
  }
}
