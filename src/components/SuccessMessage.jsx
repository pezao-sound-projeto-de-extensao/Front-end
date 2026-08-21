import { CheckCircle } from 'lucide-react';

export default function SuccessMessage({ title, message }) {
  return (
    <div className="bg-white p-8 rounded-lg text-center" style={{ border: '1px solid #d0dde8', borderRadius: '10px', boxShadow: '0 4px 24px rgba(13,33,55,0.10)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6f7ef' }}>
        <CheckCircle className="w-8 h-8" style={{ color: '#1e9e5e' }} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d2137', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#5a82a0', marginBottom: '24px' }}>{message}</p>
      <div className="w-full h-2 rounded-full bg-[#d0dde8] overflow-hidden">
        <div className="h-full rounded-full" style={{ backgroundColor: '#1565c0', width: '100%', animation: 'progress 2s linear forwards' }} />
      </div>
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
