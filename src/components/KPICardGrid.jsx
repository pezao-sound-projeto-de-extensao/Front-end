export default function KPICardGrid({ cards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
          <p className="uppercase mb-1" style={{ fontSize: '12px', color: '#5a82a0' }}>{card.label}</p>
          <p className="mb-1" style={{ fontSize: '30px', fontWeight: 'bold', color: card.color || '#0d2137' }}>{card.value}</p>
          <p style={{ fontSize: '11px', color: '#6a92b0' }}>{card.description}</p>
        </div>
      ))}
    </div>
  );
}
