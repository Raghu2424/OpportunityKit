import { useCallback, useEffect, useState } from 'react';

function read(key, validate) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return { value: null, error: null };
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) throw new Error('unexpected shape');
    return { value: parsed, error: null };
  } catch {
    return {
      value: null,
      error: 'Your saved profile could not be read, so we started with a blank one. Create it again or load a sample profile.',
    };
  }
}

// Persists a JSON value in localStorage. Never throws: storage failures surface as `error`.
export function useLocalStorage(key, validate) {
  const [state, setState] = useState(() => read(key, validate));
  const [writeError, setWriteError] = useState(null);

  useEffect(() => {
    try {
      if (state.value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(state.value));
      setWriteError(null);
    } catch {
      setWriteError('This browser blocked saving. Your profile works for now but will be lost when you refresh.');
    }
  }, [key, state.value]);

  const setValue = useCallback((next) => {
    setState((prev) => ({ value: typeof next === 'function' ? next(prev.value) : next, error: null }));
  }, []);

  const dismissError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
    setWriteError(null);
  }, []);

  return [state.value, setValue, state.error || writeError, dismissError];
}
