import { useEffect, useId, useMemo, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from './ui/Button';

/**
 * Escolha da foto do produto.
 * file: arquivo novo escolhido (ou null) · existingUrl: foto atual salva (ou null)
 * onFileChange(file|null) · onRemoveExisting(): marca a foto salva para remoção
 */
export default function ProductPhotoField({ file, existingUrl, onFileChange, onRemoveExisting }) {
  const inputRef = useRef(null);
  const inputId = useId();

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  // Libera a URL temporária quando o arquivo muda ou o campo sai da tela
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const shownUrl = previewUrl ?? existingUrl;
  const openPicker = () => inputRef.current?.click();

  const handleRemove = () => {
    if (file) {
      onFileChange(null);
      if (inputRef.current) inputRef.current.value = '';
    } else {
      onRemoveExisting?.();
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="field-label">Foto do produto</label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      {shownUrl ? (
        <div className="flex items-start gap-4">
          <img src={shownUrl} alt="Pré-visualização da foto" className="h-[120px] w-[120px] rounded-lg border-[1.5px] border-line-strong object-cover" />
          <div className="mt-1 flex flex-col gap-2">
            <Button variant="outline-primary" size="sm" onClick={openPicker}>Trocar foto</Button>
            <Button variant="outline-danger" size="sm" onClick={handleRemove}>Remover foto</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-line-strong bg-surface px-3.5 py-7 hover:bg-surface-muted"
        >
          <Camera className="h-7 w-7 text-muted" />
          <span className="text-sm text-muted">Clique para adicionar uma foto</span>
          <span className="text-xs text-subtle">JPG, PNG ou WEBP</span>
        </button>
      )}
    </div>
  );
}
