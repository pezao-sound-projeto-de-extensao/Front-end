import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from './ui/Button';
import FormField, { FormInput, FormSelect } from './FormField';
import { itemService } from '../services/itemService';

export default function ReceberEncomendaModal({ isOpen, onClose, encomenda, onConfirm, hasPermission = true }) {
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const precisaSelecionarProduto = encomenda && !encomenda.itemId;

  const carregarProdutos = async () => {
    setLoadingProdutos(true);
    try {
      const response = await itemService.listar({ size: 1000, ativo: true });
      const items = response.content || response;
      setProdutos(items);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar lista de produtos');
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    if (isOpen && precisaSelecionarProduto) {
      carregarProdutos();
    }
  }, [isOpen, precisaSelecionarProduto]);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!hasPermission) {
      setError('Sem permissão para receber encomendas');
      return;
    }
    if (precisaSelecionarProduto && !selectedProdutoId) {
      setError('Selecione um produto para vincular a encomenda');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onConfirm(encomenda.id, precisaSelecionarProduto ? parseInt(selectedProdutoId) : null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao receber encomenda');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedProdutoId('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={handleClose}>
      <div className="p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#ffffff', borderRadius: '10px' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {precisaSelecionarProduto ? 'Vincular produto e receber' : 'Confirmar recebimento'}
          </h3>
          <button type="button" onClick={handleClose} className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} aria-label="Fechar">
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8' }}>
            <p style={{ fontSize: '13px', color: '#1a3a55', marginBottom: '4px' }}><strong>Encomenda:</strong> #{encomenda?.id}</p>
            <p style={{ fontSize: '13px', color: '#1a3a55', marginBottom: '4px' }}><strong>Item:</strong> {encomenda?.descricao}</p>
            <p style={{ fontSize: '13px', color: '#1a3a55', marginBottom: '4px' }}><strong>Cliente:</strong> {encomenda?.clienteNome}</p>
            <p style={{ fontSize: '13px', color: '#1a3a55' }}><strong>Quantidade:</strong> {encomenda?.quantidade}</p>
          </div>

          {precisaSelecionarProduto && (
            <div>
              <FormField label="Produto do catálogo" error={error && !selectedProdutoId}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: '18px', height: '18px', color: '#999' }} />
                  <FormInput
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setError(''); }}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                {loadingProdutos ? (
                  <p style={{ fontSize: '12px', color: '#6a92b0', marginTop: '4px' }}>Carregando produtos...</p>
                ) : (
                  <FormSelect
                    value={selectedProdutoId}
                    onChange={(e) => { setSelectedProdutoId(e.target.value); setError(''); }}
                    error={error && !selectedProdutoId}
                    style={{ marginTop: '8px' }}
                  >
                    <option value="">Selecione o produto correspondente</option>
                    {produtosFiltrados.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.unidadeAbreviacao}) - R$ {p.precoCusto?.toFixed(2).replace('.', ',') || '0,00'}</option>
                    ))}
                  </FormSelect>
                )}
                {error && <p style={{ fontSize: '12px', color: '#e84040', marginTop: '4px' }}>{error}</p>}
              </FormField>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Esta encomenda foi criada para um produto que ainda não estava no catálogo.
                Selecione o produto correspondente para registrar a entrada no estoque.
              </p>
            </div>
          )}

          {!precisaSelecionarProduto && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              O produto <strong>{encomenda?.descricao}</strong> já está vinculado ao catálogo (ID: {encomenda?.itemId}).
              Ao confirmar, será registrada a entrada de <strong>{encomenda?.quantidade}</strong> unidade(s) no estoque.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Button type="button" variant="outline" onClick={handleClose} className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', color: '#1a3a55', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: '1.5px solid var(--border-subtle)' }} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirm} className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: '700', borderRadius: '8px' }} disabled={saving || (precisaSelecionarProduto && !selectedProdutoId) || !hasPermission}>
              {saving ? 'Recebendo...' : !hasPermission ? 'Sem permissão' : 'Confirmar recebimento'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}