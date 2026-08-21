export default function PageLayout({ title, actions, children }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#e8edf3' }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d2137' }}>{title}</h2>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
