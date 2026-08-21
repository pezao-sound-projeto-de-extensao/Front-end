import { createContext, useContext, useRef, useState, useCallback } from 'react';

const SessionModalContext = createContext(null);

export function SessionModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const retryRef = useRef(null);

  const openModal = useCallback((retryFn) => {
    retryRef.current = retryFn;
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    retryRef.current = null;
  }, []);

  const retry = useCallback(() => {
    const fn = retryRef.current;
    closeModal();
    fn?.();
  }, [closeModal]);

  return (
    <SessionModalContext.Provider value={{ isOpen, openModal, closeModal, retry }}>
      {children}
    </SessionModalContext.Provider>
  );
}

export const useSessionModal = () => useContext(SessionModalContext);
