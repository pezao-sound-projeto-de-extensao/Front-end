import React from 'react';
import { applyMask, MASKS, getMaskPlaceholder } from '../lib/masks';

export default function FormField({ label, error, children, hint }) {
  return (
    <div>
      <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0', fontWeight: '600' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#e84040', marginTop: '4px' }}>{typeof error === 'string' ? error : 'Campo obrigatório'}</p>}
      {hint && !error && <p style={{ fontSize: '11px', color: '#6a92b0', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
}

const inputBaseStyle = {
  backgroundColor: 'var(--bg-input)',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: 'var(--border-subtle)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
  width: '100%',
  boxSizing: 'border-box',
};

const focusStyle = {
  borderColor: '#1565c0',
  boxShadow: '0 0 0 3px rgba(21,101,192,0.15)',
  outline: 'none',
};

const errorStyle = {
  borderColor: '#e84040',
  boxShadow: '0 0 0 3px rgba(232,64,64,0.15)',
};

const disabledStyle = {
  backgroundColor: 'var(--bg-input)',
  opacity: 0.6,
  cursor: 'not-allowed',
};

const hoverStyle = {
  borderColor: '#1c8bc0',
};

function getInputStyle({ error, disabled, hasFocus, isHovered }) {
  if (disabled) return { ...inputBaseStyle, ...disabledStyle };
  if (error) return { ...inputBaseStyle, ...errorStyle };
  if (hasFocus) return { ...inputBaseStyle, ...focusStyle };
  if (isHovered) return { ...inputBaseStyle, ...hoverStyle };
  return inputBaseStyle;
}

export function FormInput({ error, disabled, onFocus, onBlur, onMouseEnter, onMouseLeave, ...props }) {
  const [hasFocus, setHasFocus] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFocus = (e) => {
    setHasFocus(true);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setHasFocus(false);
    setIsHovered(false);
    onBlur?.(e);
  };
  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };
  const handleMouseLeave = (e) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  return (
    <input
      {...props}
      disabled={disabled}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={getInputStyle({ error, disabled, hasFocus, isHovered })}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

export function FormSelect({ error, disabled, children, onFocus, onBlur, onMouseEnter, onMouseLeave, ...props }) {
  const [hasFocus, setHasFocus] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFocus = (e) => {
    setHasFocus(true);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setHasFocus(false);
    setIsHovered(false);
    onBlur?.(e);
  };
  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };
  const handleMouseLeave = (e) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  return (
    <select
      {...props}
      disabled={disabled}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={getInputStyle({ error, disabled, hasFocus, isHovered })}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </select>
  );
}

export function FormTextarea({ error, disabled, onFocus, onBlur, onMouseEnter, onMouseLeave, ...props }) {
  const [hasFocus, setHasFocus] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFocus = (e) => {
    setHasFocus(true);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setHasFocus(false);
    setIsHovered(false);
    onBlur?.(e);
  };
  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };
  const handleMouseLeave = (e) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  return (
    <textarea
      {...props}
      disabled={disabled}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={{
        ...getInputStyle({ error, disabled, hasFocus, isHovered }),
        resize: 'vertical',
        minHeight: '80px',
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

function createMaskedInput(maskType) {
  const mask = MASKS[maskType];
  const placeholder = getMaskPlaceholder(maskType);

  return function MaskedInput({ value, onChange, error, disabled, onBlur, ...props }) {
    const [hasFocus, setHasFocus] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [displayValue, setDisplayValue] = React.useState(value || '');

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value);
      }
    }, [value]);

    const handleChange = (e) => {
      const rawValue = e.target.value;
      const formatted = applyMask(rawValue, maskType);
      setDisplayValue(formatted);
      onChange?.({ target: { ...e.target, value: formatted }, rawValue });
    };

    const handleBlur = (e) => {
      setHasFocus(false);
      setIsHovered(false);
      const rawValue = unmaskValue(displayValue, maskType);
      onBlur?.({ target: { ...e.target, value: rawValue } });
    };

    const handleFocus = () => {
      setHasFocus(true);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
      <input
        {...props}
        type="text"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        placeholder={placeholder}
        className={`w-full rounded-lg ${props.className || ''}`}
        style={getInputStyle({ error, disabled, hasFocus, isHovered })}
        inputMode={mask.pattern.source.includes('d') ? 'numeric' : 'text'}
      />
    );
  };
}

function unmaskValue(value, maskType) {
  switch (maskType) {
    case 'currency':
      return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
    case 'cpf':
    case 'cnpj':
    case 'phone':
    case 'cep':
      return value.replace(/\D/g, '');
    default:
      return value.replace(/\D/g, '');
  }
}

export const FormCPF = createMaskedInput('cpf');
export const FormCNPJ = createMaskedInput('cnpj');
export const FormPhone = createMaskedInput('phone');
export const FormCEP = createMaskedInput('cep');
export const FormCurrency = createMaskedInput('currency');
export const FormDate = createMaskedInput('date');
export const FormNumber = createMaskedInput('number');
