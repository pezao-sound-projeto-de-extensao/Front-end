export default function FilterSelect({ value, onChange, options, width = '160px' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ backgroundColor: 'var(--bg-input)', border: '1.5px solid var(--border-subtle)', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', color: 'var(--text-primary)', width, transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}
      onFocus={(e) => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
