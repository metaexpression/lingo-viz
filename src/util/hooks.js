import { h, Component, render } from 'preact';
import { useEffect, useState, useRef, useContext, useCallback } from 'preact/hooks';

export const useDocumentTitle = (title) => {
  document.title = title
}

export const useFetch = (path) => {
  const [status, setStatus] = useState([true, null])

  useEffect(() => {
    fetch(path)
      .then(x => x.json())
      .then(x => setStatus([false, x]))
  }, [path])

  return status;
}

export const useEventListener = (eventName, element, handler) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
      const eventListener = event => savedHandler.current(event);
      element.addEventListener(eventName, eventListener);
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element]
  );
};
