import { Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

export default function CrudFormActions({ editMode, saving, onCancel, onSave }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button type="button" variant="outline" onClick={onCancel} className="px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', border: '1.5px solid #d0dde8', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>
        Cancelar
      </Button>
      <Button type="button" onClick={onSave} disabled={saving} className="px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>
        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {editMode ? 'Atualizar' : 'Salvar'}
      </Button>
    </div>
  );
}
