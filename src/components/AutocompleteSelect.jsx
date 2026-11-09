import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Campo de busca com lista de opções (combobox), com navegação por teclado.
 *
 * options: [{ value, label }] · value: valor selecionado
 * onChange(value) ao escolher · onInputChange(texto) a cada digitação (ex.: busca no servidor)
 * newOptionLabel + onNewOption: opção extra no fim da lista ("+ Cadastrar novo...")
 */
export default function AutocompleteSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  onInputChange,
  newOptionLabel,
  onNewOption,
  disabled,
  error,
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const selected = options.find((opt) => opt.value === value);
  // Enquanto digita mostra o texto; senão, o rótulo da opção escolhida
  const inputValue = isTyping ? query : (selected?.label ?? query);

  const filtered = isTyping
    ? options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const optionCount = filtered.length + (newOptionLabel ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsTyping(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => {
    setIsOpen(false);
    setIsTyping(false);
    setHighlighted(-1);
  };

  const choose = (index) => {
    if (index < filtered.length) {
      onChange(filtered[index].value);
      setQuery('');
    } else if (newOptionLabel) {
      onNewOption?.(query);
    }
    close();
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    setIsTyping(true);
    setIsOpen(true);
    setHighlighted(-1);
    onInputChange?.(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlighted((i) => Math.min(i + 1, optionCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && isOpen && highlighted >= 0) {
      e.preventDefault();
      choose(highlighted);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const optionClass = (index) => cn(
    'cursor-pointer px-4 py-2 text-sm',
    highlighted === index ? 'bg-primary-soft text-primary' : 'hover:bg-surface-muted',
  );

  return (
    <div className="relative" ref={containerRef}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={Boolean(error)}
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="field px-10"
      />
      <ChevronDown className={cn('pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />

      {isOpen && (
        <ul id={listId} role="listbox" className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-line bg-surface shadow-lg">
          {filtered.length === 0 && !newOptionLabel && (
            <li className="px-4 py-3 text-sm text-gray-500">Nenhum resultado encontrado</li>
          )}
          {filtered.map((opt, index) => (
            <li
              key={opt.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(index)}
              onMouseEnter={() => setHighlighted(index)}
              className={optionClass(index)}
            >
              {opt.label}
            </li>
          ))}
          {newOptionLabel && (
            <li
              id={`${listId}-${filtered.length}`}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(filtered.length)}
              onMouseEnter={() => setHighlighted(filtered.length)}
              className={cn(optionClass(filtered.length), 'border-t border-line italic text-primary')}
            >
              {newOptionLabel}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
