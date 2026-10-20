import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

const SessionModalContext = createContext(null);

let globalOpenModal = null;

export function setGlobalOpenModal(fn) {
  globalOpenModal = fn;
}

export function getGlobalOpenModal() {
  return globalOpenModal;
}

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

  useEffect(() => {
    setGlobalOpenModal(openModal);
    return () => setGlobalOpenModal(null);
  }, [openModal]);

  return (
    <SessionModalContext.Provider value={{ isOpen, openModal, closeModal, retry }}>
      {children}
    </SessionModalContext.Provider>
  );
}

export const useSessionModal = () => useContext(SessionModalContext);
