import { useState, useEffect } from "react";

export function useLocalStorageState(initialValue, key) {
  const [value, setvalue] = useState(function () {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setvalue];
}
