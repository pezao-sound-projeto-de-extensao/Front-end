import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Quando `active` vira true, navega para `to` depois de `delay` ms (cancelado se a tela sair). */
export default function useRedirectAfter(active, to, delay = 2000) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!active) return undefined;
    const timer = setTimeout(() => navigate(to, { replace: true }), delay);
    return () => clearTimeout(timer);
  }, [active, to, delay, navigate]);
}
