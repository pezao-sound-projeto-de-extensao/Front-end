import { useEffect } from 'react';

export default function PageLayout({ title, icon: Icon, actions, children }) {
  useEffect(() => {
    if (title) document.title = `${title} · StockFlow`;
  }, [title]);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#e8edf3' }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1565c0', color: '#ffffff', boxShadow: '0 2px 6px rgba(21,101,192,0.3)' }}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d2137' }}>{title}</h2>
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
