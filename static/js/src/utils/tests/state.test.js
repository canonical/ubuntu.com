import { StateManager } from "../state.js";

describe("StateManager", () => {
  let state;
  let stateKeys;
  let callback;
  let consoleSpy;

  beforeEach(() => {
    stateKeys = ["one", "two", "three"];
    callback = jest.fn();
    state = new StateManager(stateKeys, callback);
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("new", () => {
    it("should create a state manager instance", () => {
      expect(state).toBeInstanceOf(StateManager);
      expect(state).toEqual(
        expect.objectContaining({
          state: {
            one: [],
            two: [],
            three: [],
          },
        })
      );
    });
  });

  describe("set()", () => {
    const items = ["foo", "bar"];
    const key = "four";

    it("should invoke the callback function ", () => {
      state.set(key, items);
      expect(callback).toHaveBeenCalled();
    });

    it("should successfully set given values", () => {
      state.set(key, items);
      expect(state.get(key)).toEqual(items);
    });

    it("should not allow invalid values to be set", () => {
      state.set(key, null);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("get()", () => {
    it("should not invoke the callback function", () => {
      state.get("one");
      expect(callback).not.toHaveBeenCalled();
    });

    it("should return values that have previously been set", () => {
      const expectedValue = "bar";

      state.set("one", [expectedValue]);
      expect(state.get("one")).toContain(expectedValue);
    });

    it("should return undefined when getting keys that have not been set", () => {
      expect(state.get("nonexistent")).toBeUndefined();
    });
  });

  describe("push()", () => {
    const key = "one";
    const item = "bar";

    it("should add a given item to a given key's array of values", () => {
      state.push(key, item);
      expect(state.get("one")).toEqual([item]);
    });

    it("should invoke the callback function ", () => {
      state.push(key, item);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("remove()", () => {
    const items = ["foo", "bar"];
    const key = "four";

    it("should remove a given item from a given key's array of values", () => {
      state.set(key, items);
      state.remove(key, "foo");
      expect(state.get(key)).toEqual(["bar"]);
    });

    it("should return an error if no value is passed", () => {
      state.set(key, items);
      state.remove(key, undefined);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("should invoke the callback function ", () => {
      state.set(key, items);
      state.remove(key, "foo");
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("reset()", () => {
    it("should remove all values from a given key", () => {
      state.push("one", "foo");
      expect(state.get("one")).toEqual(["foo"]);

      state.reset("one");
      expect(state.get("one")).toEqual([]);
    });

    it("should return an error if no value is passed", () => {
      state.reset(undefined);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("should invoke the callback function ", () => {
      state.push("one", "foo");
      state.reset("one");
      expect(callback).toHaveBeenCalled();
    });
  });
});
