export default function FormPanel({ title, accentColor, children }) {
  return (
    <div className="p-6 mb-6 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: `1px solid ${accentColor || '#d0dde8'}`, borderRadius: '10px', borderTopWidth: accentColor ? '3px' : '1px', borderTopColor: accentColor || '#d0dde8' }}>
      <h3 className="mb-4" style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d2e52' }}>{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
