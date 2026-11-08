import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onSessionExpired } from '../lib/sessionEvents';

const SessionModalContext = createContext(null);

export function SessionModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => onSessionExpired(() => setIsOpen(true)), []);

  const closeModal = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, closeModal }), [isOpen, closeModal]);

  return <SessionModalContext.Provider value={value}>{children}</SessionModalContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessionModal() {
  const context = useContext(SessionModalContext);
  if (!context) throw new Error('useSessionModal precisa estar dentro de <SessionModalProvider>');
  return context;
}
