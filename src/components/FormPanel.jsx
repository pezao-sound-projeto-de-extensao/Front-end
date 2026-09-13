export default function FormPanel({ title, accentColor, children }) {
  return (
    <div className="p-6 mb-6 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${accentColor || 'var(--border-subtle)'}`, borderRadius: '10px', borderTopWidth: accentColor ? '3px' : '1px', borderTopColor: accentColor || 'var(--border-subtle)', boxShadow: 'var(--shadow-panel)' }}>
      <h3 className="mb-4" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
