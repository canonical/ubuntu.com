import { StateManager } from "../state.js";

describe("StateManager", () => {
  let state;
  let stateKeys;
  let callback;

  beforeEach(() => {
    stateKeys = ["one", "two", "three"];
    callback = jest.fn();
    state = new StateManager(stateKeys, callback);
  });

  describe("new", () => {
    it("should create a state manager instance", () => {
      expect(state).toBeInstanceOf(StateManager);
      expect(state).toEqual(
        expect.objectContaining({
          state: {
            one: expect.any(Array),
            two: expect.any(Array),
            three: expect.any(Array),
          },
        })
      );
    });
  });

  describe("set()", () => {
    it("should invoke the callback function ", () => {
      state.set("four", ["foo"]);

      expect(callback).toHaveBeenCalled();
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
  });
});
