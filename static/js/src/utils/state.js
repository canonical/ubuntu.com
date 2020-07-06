class StateArray extends Array {
  constructor(callback, items = null) {
    super(items);
    this.callback = callback;
  }

  push(item) {
    const result = super.push(item);
    this.callback();
    return result;
  }
  pop() {
    const item = super.pop();
    this.callback();
    return item;
  }
  remove(index) {
    const item = this.splice(index, 1);
    this.callback();
    return item;
  }
  reset() {
    while (this.length > 0) {
      this.pop();
    }

    this.callback();
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
      this.state[key] = new StateArray(this.callback);
    });
  }

  set(name, items) {
    this.state[name] = new StateArray(this.callback, ...items);
    this.callback();
  }

  get(name) {
    return this.state[name];
  }
}
