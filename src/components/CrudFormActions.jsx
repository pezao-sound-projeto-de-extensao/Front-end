import { Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

/** Rodapé do formulário: fica fixo no fim do painel enquanto o conteúdo rola. */
export default function CrudFormActions({ editMode, saving = false, disabled = false, onCancel, onSave }) {
  return (
    <div className="sticky bottom-0 -mx-6 mt-6 flex justify-end gap-3 border-t border-line bg-surface px-6 py-4">
      <Button variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
      <Button onClick={onSave} disabled={saving || disabled}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {editMode ? 'Salvar alterações' : 'Cadastrar'}
      </Button>
    </div>
  );
}
