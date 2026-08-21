import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/Button';

export default function PasswordInput({ label, placeholder, value, onChange, error, disabled }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0' }}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full rounded-lg pr-10"
          style={{
            backgroundColor: disabled ? '#e8edf3' : '#fafbfc',
            border: error ? '1.5px solid #e84040' : '1.5px solid #d0dde8',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
            color: '#1a3a55',
            opacity: disabled ? 0.7 : 1,
          }}
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: '#5a82a0' }}>
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </Button>
      </div>
      {error && <p style={{ fontSize: '11px', color: '#e84040', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}
