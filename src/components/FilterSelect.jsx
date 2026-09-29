import React from 'react';

export default function FilterSelect({ value, onChange, options, width = '160px' }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasFocus, setHasFocus] = React.useState(false);

  const baseStyle = {
    backgroundColor: 'var(--bg-input)',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'var(--border-subtle)',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    width,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    cursor: 'pointer',
  };

  const getStyle = () => {
    if (hasFocus) return { ...baseStyle, borderColor: '#1565c0', boxShadow: '0 0 0 3px rgba(21,101,192,0.15)', outline: 'none' };
    if (isHovered) return { ...baseStyle, borderColor: '#1c8bc0' };
    return baseStyle;
  };

  return (
    <select
      value={value}
      onChange={onChange}
      style={getStyle()}
      onFocus={() => { setHasFocus(true); }}
      onBlur={() => { setHasFocus(false); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
