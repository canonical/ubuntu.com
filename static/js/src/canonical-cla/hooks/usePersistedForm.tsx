import { useState } from "react";

const usePersistedForm = <T extends object>(
  key: string,
  initialValue: T = {} as T,
): [T, (newValue: T) => void, () => void, (fn: (value: T) => T) => void] => {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });
  const [reset, setReset] = useState<boolean>(false);

  const setStoredValue = (newValue: T) => {
    if (reset && Object.keys(value).length > 1) {
      // ignore setting multiple fields on first render if reset is called
      return;
    }
    localStorage.setItem(key, JSON.stringify(newValue));
    setValue(newValue);
    setReset(false);
  };
  const resetStoredValue = () => {
    localStorage.removeItem(key);
    setReset(true);
  };

  const validateValue = (fn: (value: T) => T) => {
    const values = fn(value);
    setStoredValue({ ...values });
  };

  return [value, setStoredValue, resetStoredValue, validateValue];
};

export default usePersistedForm;
