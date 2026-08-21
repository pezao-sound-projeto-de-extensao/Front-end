export default function FilterSelect({ value, onChange, options, width = '160px' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ backgroundColor: '#ffffff', border: '1.5px solid #d0dde8', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', color: '#1a3a55', width }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
