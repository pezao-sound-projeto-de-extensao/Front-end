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
        style={{ backgroundColor: '#ffffff', border: '1.5px solid #d0dde8', borderRadius: '8px', padding: '9px 14px 9px 36px', fontSize: '13px', color: '#1a3a55' }}
      />
    </div>
  );
}
