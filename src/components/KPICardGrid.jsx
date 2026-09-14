export default function KPICardGrid({ cards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="p-4 rounded-lg transition-all duration-150 ease-out"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-card)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <p className="uppercase mb-1" style={{ fontSize: '12px', color: '#5a82a0', fontWeight: '600' }}>{card.label}</p>
          <p className="mb-1" style={{ fontSize: '30px', fontWeight: '800', color: card.color || 'var(--text-primary)' }}>{card.value}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{card.description}</p>
        </div>
      ))}
    </div>
  );
}
