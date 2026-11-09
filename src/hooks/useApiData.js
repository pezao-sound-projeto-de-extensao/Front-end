import { useCallback, useEffect, useState } from 'react';
import { showApiError } from '../lib/apiError';

export const EMPTY_PAGE = { content: [], totalPages: 1 };

/**
 * Busca dados da API sempre que `fetcher` muda (memorize-o com useCallback,
 * listando os filtros nas dependências).
 *
 * - loading é derivado: true enquanto o resultado do fetcher atual não chegou;
 *   os dados anteriores continuam disponíveis nesse meio-tempo.
 * - respostas de buscas antigas são descartadas (sem condição de corrida).
 * - reload() busca de novo e pode ser aguardado (ex.: depois de salvar).
 */
export default function useApiData(fetcher, initialData) {
  const [state, setState] = useState({ data: initialData, loadedBy: null });

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => { if (active) setState({ data, loadedBy: fetcher }); })
      .catch((error) => {
        if (!active) return;
        showApiError(error);
        setState((prev) => ({ ...prev, loadedBy: fetcher }));
      });
    return () => { active = false; };
  }, [fetcher]);

  const reload = useCallback(async () => {
    try {
      const data = await fetcher();
      setState({ data, loadedBy: fetcher });
    } catch (error) {
      showApiError(error);
    }
  }, [fetcher]);

  return { data: state.data, loading: state.loadedBy !== fetcher, reload };
}
