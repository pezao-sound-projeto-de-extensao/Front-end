export default function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0', fontWeight: '600' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#e84040', marginTop: '4px' }}>{typeof error === 'string' ? error : 'Campo obrigatório'}</p>}
    </div>
  );
}

const inputBaseStyle = {
  backgroundColor: 'var(--bg-input)',
  border: '1.5px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

export function FormInput({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={{
        ...inputBaseStyle,
        borderColor: error ? '#e84040' : 'var(--border-subtle)',
        boxShadow: error ? '0 0 0 3px rgba(232,64,64,0.15)' : 'none',
        ...props.style,
      }}
      onFocus={(e) => {
        if (!error) e.target.style.borderColor = '#1565c0';
        e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? '#e84040' : 'var(--border-subtle)';
        e.target.style.boxShadow = error ? '0 0 0 3px rgba(232,64,64,0.15)' : 'none';
        props.onBlur?.(e);
      }}
    />
  );
}

export function FormSelect({ error, children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={{
        ...inputBaseStyle,
        borderColor: error ? '#e84040' : 'var(--border-subtle)',
        boxShadow: error ? '0 0 0 3px rgba(232,64,64,0.15)' : 'none',
        ...props.style,
      }}
      onFocus={(e) => {
        if (!error) e.target.style.borderColor = '#1565c0';
        e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? '#e84040' : 'var(--border-subtle)';
        e.target.style.boxShadow = error ? '0 0 0 3px rgba(232,64,64,0.15)' : 'none';
        props.onBlur?.(e);
      }}
    >
      {children}
    </select>
  );
}

export function FormTextarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={{
        ...inputBaseStyle,
        borderColor: error ? '#e84040' : 'var(--border-subtle)',
        boxShadow: error ? '0 0 0 3px rgba(232,64,64,0.15)' : 'none',
        resize: 'vertical',
        minHeight: '80px',
        ...props.style,
      }}
      onFocus={(e) => {
        if (!error) e.target.style.borderColor = '#1565c0';
        e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? '#e84040' : 'var(--border-subtle)';
        e.target.style.boxShadow = error ? '0 0 0 3px rgba(232,64,64,0.15)' : 'none';
        props.onBlur?.(e);
      }}
    />
  );
}
