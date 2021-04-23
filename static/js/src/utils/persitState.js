export function saveState(state, stateName) {
  console.log("write");
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
    return JSON.parse(serializedState)[slice];
  } catch (err) {
    return defaultState;
  }
}
