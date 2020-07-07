class StateArray extends Array {
  push(item) {
    const result = super.push(item);
    return result;
  }

  pop() {
    const item = super.pop();
    return item;
  }

  remove(index) {
    const item = this.splice(index, 1);
    return item;
  }

  reset() {
    while (this.length > 0) {
      this.pop();
    }
  }
}

/**
 *
 * @param {Array} stateKeys
 * @param {function} callback
 *
 * Create a state object from an array of string keys,
 * with a callback that is invoked after certain actions
 */
export class StateManager {
  constructor(stateKeys, callback) {
    this.state = {};
    this.callback = callback;

    stateKeys.forEach((key) => {
      this.state[key] = new StateArray();
    });
  }

  get(name) {
    return this.state[name];
  }

  push(name, item) {
    this.state[name].push(item);
    this.callback();
  }

  remove(name, item) {
    if (!this.state[name]) {
      return console.error(`State object has no '${name}' property`);
    }

    this.state[name].remove(item);
    this.callback();
  }

  reset(name) {
    if (!this.state[name]) {
      return console.error(`State object has no '${name}' property`);
    }

    this.state[name].reset();
    this.callback();
  }

  set(name, items) {
    if (!Array.isArray(items)) {
      return console.error(`Value for '${name}' property must be an Array`);
    }

    this.state[name] = new StateArray(...items);
    this.callback();
  }
}
