import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ width: '16px', height: '16px', color: '#5a82a0' }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10"
        style={{ backgroundColor: 'var(--bg-input)', border: '1.5px solid var(--border-subtle)', borderRadius: '8px', padding: '9px 14px 9px 36px', fontSize: '13px', color: 'var(--text-primary)', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}
        onFocus={(e) => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
