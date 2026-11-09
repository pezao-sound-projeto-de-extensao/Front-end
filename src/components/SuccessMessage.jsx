import { CheckCircle } from 'lucide-react';

export default function SuccessMessage({ title, message }) {
  return (
    <div className="card p-8 text-center shadow-[0_4px_24px_rgba(13,33,55,0.10)]" role="status">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-navy">{title}</h3>
      <p className="mb-6 text-sm text-muted">{message}</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line-strong">
        <div className="h-full rounded-full bg-primary [animation:shrink-progress_2s_linear_forwards]" />
      </div>
    </div>
  );
}
