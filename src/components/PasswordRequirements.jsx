import { CheckCircle, AlertCircle } from 'lucide-react';

export default function PasswordRequirements({ password }) {
  const requirements = [
    { text: 'Pelo menos 8 caracteres', met: password.length >= 8 },
    { text: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { text: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { text: 'Um número', met: /[0-9]/.test(password) },
    { text: 'Um caractere especial (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
  ];

  return (
    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '8px' }}>
      <p className="mb-2" style={{ fontSize: '11px', fontWeight: 'bold', color: '#0d2e52' }}>Requisitos da senha:</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2" style={{ fontSize: '11px', color: req.met ? '#1e9e5e' : '#8aabb8', marginBottom: '4px' }}>
            {req.met ? (
              <CheckCircle className="w-4 h-4" style={{ color: '#1e9e5e', flexShrink: 0 }} />
            ) : (
              <AlertCircle className="w-4 h-4" style={{ color: '#8aabb8', flexShrink: 0 }} />
            )}
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
