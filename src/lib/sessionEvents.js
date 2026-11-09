/**
 * Canal entre a camada HTTP (fora do React) e a UI: o interceptor do axios avisa
 * que a sessão expirou e o SessionModalProvider, inscrito aqui, abre o modal.
 */
const listeners = new Set();

export function onSessionExpired(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Retorna false quando ninguém está ouvindo (ex.: antes do app montar). */
export function emitSessionExpired() {
  listeners.forEach((listener) => listener());
  return listeners.size > 0;
}
