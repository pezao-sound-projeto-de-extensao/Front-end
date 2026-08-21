export default function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#e84040', marginTop: '4px' }}>{typeof error === 'string' ? error : 'Campo obrigatório'}</p>}
    </div>
  );
}

export function FormInput({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg ${props.className || ''}`}
      style={{
        backgroundColor: '#ffffff',
        border: error ? '1.5px solid #e84040' : '1.5px solid #d0dde8',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#1a3a55',
        ...props.style,
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
        backgroundColor: '#ffffff',
        border: error ? '1.5px solid #e84040' : '1.5px solid #d0dde8',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#1a3a55',
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}
