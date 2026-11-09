/** O back-end devolve o tipo em minúsculas ("entrada") ou como enum ("ENTRADA"). */
export const isEntrada = (tipo) => String(tipo).toLowerCase() === 'entrada';
