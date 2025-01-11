export function saveState(state, stateName) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(stateName, serializedState);
  } catch (err) {
    // ignore write errors
  }
}

export function loadState(stateName, slice, defaultState) {
  try {
    const serializedState = localStorage.getItem(stateName);
    if (serializedState === null) {
      return defaultState;
    }
    const localState = JSON.parse(serializedState)[slice];
    return { ...defaultState, ...localState };
  } catch (err) {
    return defaultState;
  }
}
