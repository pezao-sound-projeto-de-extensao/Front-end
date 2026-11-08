import { Children, cloneElement, isValidElement, useId, useState } from 'react';
import { applyMask, getMaskPlaceholder, unmaskValue } from '../lib/masks';
import { cn } from '../lib/utils';

const NATIVE_FIELDS = new Set(['input', 'select', 'textarea']);

function asFieldElement(children) {
  if (Children.count(children) !== 1 || !isValidElement(children)) return null;
  const { type } = children;
  return typeof type === 'string' ? (NATIVE_FIELDS.has(type) ? children : null) : children;
}

/**
 * Agrupa label, campo, dica e erro. Quando o filho é um único campo,
 * associa o label a ele (htmlFor/id) e repassa o erro para marcar aria-invalid.
 */
export default function FormField({ label, error, hint, children, className }) {
  const generatedId = useId();
  const field = asFieldElement(children);
  const fieldId = field?.props.id ?? generatedId;

  let content = children;
  if (field) {
    const isComponent = typeof field.type !== 'string';
    content = cloneElement(field, {
      id: fieldId,
      ...(isComponent ? { error: field.props.error ?? error } : { 'aria-invalid': Boolean(error) }),
    });
  }

  return (
    <div className={className}>
      {label && <label htmlFor={field ? fieldId : undefined} className="field-label">{label}</label>}
      {content}
      {error && <p className="field-error" role="alert">{typeof error === 'string' ? error : 'Campo obrigatório'}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function FormInput({ error, className, ...props }) {
  return <input {...props} aria-invalid={Boolean(error)} className={cn('field', className)} />;
}

export function FormSelect({ error, className, children, ...props }) {
  return (
    <select {...props} aria-invalid={Boolean(error)} className={cn('field cursor-pointer', className)}>
      {children}
    </select>
  );
}

export function FormTextarea({ error, className, ...props }) {
  return <textarea {...props} aria-invalid={Boolean(error)} className={cn('field min-h-20 resize-y', className)} />;
}

const NUMERIC_MASKS = new Set(['cpf', 'cnpj', 'phone', 'cep', 'number', 'currency']);

function MaskedInput({ mask, value, onChange, onBlur, error, className, ...props }) {
  const [displayValue, setDisplayValue] = useState(value ?? '');

  // Mantém o campo sincronizado quando o valor muda de fora (ex.: abrir edição)
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== undefined) setDisplayValue(value);
  }

  const handleChange = (e) => {
    const formatted = applyMask(e.target.value, mask);
    setDisplayValue(formatted);
    onChange?.({ target: { ...e.target, value: formatted }, rawValue: unmaskValue(formatted, mask) });
  };

  const handleBlur = (e) => {
    onBlur?.({ target: { ...e.target, value: unmaskValue(displayValue, mask) } });
  };

  return (
    <input
      placeholder={getMaskPlaceholder(mask)}
      {...props}
      type="text"
      inputMode={NUMERIC_MASKS.has(mask) ? 'numeric' : 'text'}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      aria-invalid={Boolean(error)}
      className={cn('field', className)}
    />
  );
}

export const FormCPF = (props) => <MaskedInput mask="cpf" {...props} />;
export const FormCNPJ = (props) => <MaskedInput mask="cnpj" {...props} />;
export const FormPhone = (props) => <MaskedInput mask="phone" {...props} />;
export const FormCEP = (props) => <MaskedInput mask="cep" {...props} />;
export const FormCurrency = (props) => <MaskedInput mask="currency" {...props} />;
export const FormNumber = (props) => <MaskedInput mask="number" {...props} />;
