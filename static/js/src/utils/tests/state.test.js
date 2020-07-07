import { StateManager } from "../state.js";
import { it } from "date-fns/locale";

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
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

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
});
