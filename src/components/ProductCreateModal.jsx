import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import FormField, { FormInput, FormSelect } from './FormField';

export default function ProductCreateModal({ isOpen, onClose, onSave, itemIndex, categorias, unidades, loading }) {
  const [formData, setFormData] = useState({
    nome: '',
    categoriaId: '',
    unidadeId: '',
    quantidadeAtual: '0',
    quantidadeMinima: '0',
    precoCusto: '',
    precoVenda: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) {
      setFormData({
        nome: '',
        categoriaId: '',
        unidadeId: '',
        quantidadeAtual: '0',
        quantidadeMinima: '0',
        precoCusto: '',
        precoVenda: '',
      });
      setErrors({});
      setSaving(false);
    }
  }, [isOpen]);

  const validate = (data) => ({
    nome: !data.nome.trim(),
    quantidadeAtual: !data.quantidadeAtual.trim() || isNaN(parseInt(data.quantidadeAtual)),
    categoriaId: !data.categoriaId,
    unidadeId: !data.unidadeId,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const formatCurrencyInput = (value) => {
    let v = value.replace(/\D/g, '');
    if (v === '') return '';
    v = (parseInt(v) / 100).toFixed(2).replace('.', ',');
    return v;
  };

  const parseCurrencyInput = (value) => {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.')) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.values(errs).some(v => v)) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nome: formData.nome.trim(),
        categoriaId: parseInt(formData.categoriaId),
        unidadeId: parseInt(formData.unidadeId),
        quantidadeAtual: parseInt(formData.quantidadeAtual) || 0,
        quantidadeMinima: parseInt(formData.quantidadeMinima) || 0,
        precoCusto: parseCurrencyInput(formData.precoCusto),
        precoVenda: parseCurrencyInput(formData.precoVenda),
      };
      await onSave(payload, itemIndex);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
      <div className="p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#ffffff', borderRadius: '10px' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Cadastrar novo produto</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            aria-label="Fechar"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome do produto" error={errors.nome}>
            <FormInput
              placeholder="Ex: Módulo amplificador 400W"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              error={errors.nome}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Categoria" error={errors.categoriaId}>
              <FormSelect
                value={formData.categoriaId}
                onChange={(e) => handleChange('categoriaId', e.target.value)}
                error={errors.categoriaId}
              >
                <option value="">Selecione</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Unidade" error={errors.unidadeId}>
              <FormSelect
                value={formData.unidadeId}
                onChange={(e) => handleChange('unidadeId', e.target.value)}
                error={errors.unidadeId}
              >
                <option value="">Selecione</option>
                {unidades.map(un => <option key={un.id} value={un.id}>{un.nome} ({un.abreviacao})</option>)}
              </FormSelect>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantidade atual" error={errors.quantidadeAtual}>
              <FormInput
                type="number"
                min="0"
                value={formData.quantidadeAtual}
                onChange={(e) => handleChange('quantidadeAtual', e.target.value)}
                error={errors.quantidadeAtual}
              />
            </FormField>
            <FormField label="Quantidade mínima">
              <FormInput
                type="number"
                min="0"
                value={formData.quantidadeMinima}
                onChange={(e) => handleChange('quantidadeMinima', e.target.value)}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Abaixo disso, o sistema vai alertar</p>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Preço de custo">
              <FormInput
                placeholder="0,00"
                value={formData.precoCusto}
                onChange={(e) => handleChange('precoCusto', formatCurrencyInput(e.target.value))}
              />
            </FormField>
            <FormField label="Preço de venda">
              <FormInput
                placeholder="0,00"
                value={formData.precoVenda}
                onChange={(e) => handleChange('precoVenda', formatCurrencyInput(e.target.value))}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-card)', color: '#1a3a55', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: '1.5px solid var(--border-subtle)' }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: '700', borderRadius: '8px' }}
              disabled={saving || loading}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}