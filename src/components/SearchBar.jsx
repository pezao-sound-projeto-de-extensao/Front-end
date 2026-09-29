import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasFocus, setHasFocus] = React.useState(false);

  const baseStyle = {
    backgroundColor: 'var(--bg-input)',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'var(--border-subtle)',
    borderRadius: '8px',
    padding: '9px 14px 9px 36px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    width: '100%',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
  };

  const getStyle = () => {
    if (hasFocus) return { ...baseStyle, borderColor: '#1565c0', boxShadow: '0 0 0 3px rgba(21,101,192,0.15)', outline: 'none' };
    if (isHovered) return { ...baseStyle, borderColor: '#1c8bc0' };
    return baseStyle;
  };

  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ width: '16px', height: '16px', color: '#5a82a0' }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={getStyle()}
        onFocus={() => { setHasFocus(true); }}
        onBlur={() => { setHasFocus(false); setIsHovered(false); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  );
}
