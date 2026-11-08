/** Select de filtro da barra de ferramentas: largura total no celular, `width` a partir do tablet. */
export default function FilterSelect({ value, onChange, options, width = '160px', label = 'Filtro' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className="field w-full cursor-pointer text-sm sm:w-[var(--filter-width)]"
      style={{ '--filter-width': width }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
