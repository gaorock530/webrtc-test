
/**
 * @description Function excutation Debouncer
 * @argument {Function} fn which function to be excuted
 * @argument {Number} duration in Seconds
 * @argument {Boolean|Number} loop number of loops or no loop
 * 
 */
function Debouncer (fn, duration, loop) {
  this.fn = fn;
  this.duration = duration * 1000;
  this.loop = loop || 0;
  this.timer = null;
  this.counter = 0;
  this.init();
}

/** @private */
Debouncer.prototype.init = function () {
  if (!this.fn || !this.duration) return console.error('fn | duration not provided.');
  if (typeof this.fn !== 'function' || typeof this.duration !== 'number') return console.error('fn | duration type error.');
}

/** @private */
Debouncer.prototype.excute = function () {
  if (this.counter >= this.loop) return this.stop();
  this.counter++;
  this.fn();
}

/** @public*/
Debouncer.prototype.start = function () {
  if (this.loop) clearInterval(this.timer);
  else clearTimeout(this.timer);
  if (this.loop) this.timer = setInterval(this.excute.bind(this), this.duration);
  else this.timer = setTimeout(this.fn, this.duration);
}

/** @public*/
Debouncer.prototype.stop = function () {
  if (this.loop) clearInterval(this.timer);
  else clearTimeout(this.timer);
  this.timer = null;
  this.counter = 0;
}


export default Debouncer;