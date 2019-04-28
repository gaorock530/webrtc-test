/**
 * @description events manager
 */

function Event () {
  this.events = {};       // events store
  this.id = 0;            // events' id
}

/**
 * @argument {String} evt Event name
 * @argument {Function} fn function to add to the Event
 * @argument {Boolean} once 
 */

Event.prototype.on = function (evt, fn, once) {
  if(!this.events[evt]) this.events[evt] = [];
  /**
   * @param {Function} fn
   * @param {Number} id function id
   * @param {Boolean} done check if function has been excuted, when 'once' is true
   * @param {Boolean} once mark if the function only excutes once 
   */
  this.events[evt].push({fn, id: this.id, done: false, once: !!once});
  return this.id++;
}

Event.prototype.del = function (evt, id) {
  if (this.events[evt] && this.events[evt].length !== 0) {
    let removal = 0;
    this.events[evt] = this.events[evt].filter(fn => {
      if (fn.id !== id) return true;
      removal++;
      return false;
    });
    if (removal < 1) {
      console.warn(`no such function[${id}] on event[${evt}].`);
      return false;
    } else {
      console.log('del: ', removal);
      return true;
    }
  } else {
    console.warn(`no such event[${evt}].`);
    return false;
  }
}

Event.prototype.emit = function (evt) {
  if (!this.events[evt]) return;
  const args = Array.from(arguments).slice(1);
  this.events[evt].map(a => {
    a.fn.apply(a.fn, args)
    return a.done = true;
  });
  this.events[evt] = this.events[evt].filter(a => !a.once || !a.done);
}

Event.prototype.destory = function () {
 this.events = {};
 this.id = 0;
}

/**
 * @static
 */
Event.attach = function (obj, evt, fn, ) {
  if (obj.addEventListener) {
    obj.addEventListener(evt, fn, false);
  } else if (obj.attachEvent) {
    obj.attachEvent('on' + evt, fn);
  } else {
    obj['on' + evt] = fn;
  }
}

/**
 * @static 
 * @function detach detach a function from an event
 */
Event.detach = function (obj, evt, fn) {
  if (obj.removeEventListener) {
    obj.removeEventListener(evt, fn, false);
  } else if (obj.detachEvent) {
    obj.attachEvent('on' + evt, fn);
  } else {
    obj['on' + evt] = null;
  }
}
module.exports = Event;