import { useEffect } from 'react';

/**
 * Estrutura padrão das páginas logadas: título, descrição, ações e conteúdo.
 * banner: faixa opcional acima do conteúdo (ex.: alerta de estoque).
 */
export default function PageLayout({ title, documentTitle = title, description, actions, banner, children }) {
  useEffect(() => {
    if (documentTitle) document.title = `${documentTitle} · StockFlow`;
  }, [documentTitle]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
          {description && <p className="mt-1 text-sm text-body">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {banner && <div className="mb-6">{banner}</div>}
      {children}
    </div>
  );
}
