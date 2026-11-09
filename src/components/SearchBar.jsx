import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...', label = 'Buscar' }) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="field py-[9px] pl-9 text-sm"
      />
    </div>
  );
}
