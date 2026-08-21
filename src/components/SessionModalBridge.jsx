import { useEffect } from 'react';
import { setSessionModalOpener } from '../services/api';
import { useSessionModal } from '../context/SessionModalContext';

export default function SessionModalBridge() {
  const { openModal } = useSessionModal();

  useEffect(() => {
    setSessionModalOpener(openModal);
    return () => setSessionModalOpener(null);
  }, [openModal]);

  return null;
}
