import { Camera, ZoomIn } from 'lucide-react';

/** Miniatura do produto; com onZoom, vira botão que abre a foto grande. */
export default function ProductThumb({ src, alt, onZoom, size = 44 }) {
  const style = { width: size, height: size };

  if (!src) {
    return (
      <div className="flex items-center justify-center rounded-lg border-[1.5px] border-dashed border-line-strong bg-surface-muted" style={style}>
        <Camera className="h-[18px] w-[18px] text-subtle" aria-hidden="true" />
      </div>
    );
  }

  const image = <img src={src} alt={alt} className="rounded-lg border-[1.5px] border-line-strong object-cover" style={style} />;
  if (!onZoom) return image;

  return (
    <button type="button" onClick={onZoom} className="group relative block" aria-label={`Ampliar foto de ${alt}`}>
      {image}
      <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/55 opacity-0 transition-opacity group-hover:opacity-100">
        <ZoomIn className="h-4 w-4 text-white" />
      </span>
    </button>
  );
}
