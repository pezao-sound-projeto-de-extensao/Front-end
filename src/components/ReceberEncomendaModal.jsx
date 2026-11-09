import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/Button';
import Modal from './ui/Modal';
import FormField, { FormInput, FormSelect } from './FormField';
import { itemService } from '../services/itemService';
import { formatCurrency } from '../lib/formatters';
import { showApiError } from '../lib/apiError';

/**
 * Confirma o recebimento de uma encomenda. Se ela foi criada para um produto que
 * ainda não estava no catálogo, pede para escolher o produto correspondente.
 * onConfirm(id, itemId|null) deve lançar erro em caso de falha.
 */
export default function ReceberEncomendaModal({ encomenda, onClose, onConfirm }) {
  const precisaSelecionarProduto = Boolean(encomenda && !encomenda.itemId);
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!precisaSelecionarProduto) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProdutos(true);
    itemService.listar({ size: 1000, ativo: true })
      .then((response) => { if (active) setProdutos(response.content ?? []); })
      .catch(showApiError)
      .finally(() => { if (active) setLoadingProdutos(false); });
    return () => { active = false; };
  }, [precisaSelecionarProduto]);

  const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleClose = () => {
    setSearchTerm('');
    setProdutoId('');
    setError('');
    onClose();
  };

  const handleConfirm = async () => {
    if (precisaSelecionarProduto && !produtoId) {
      setError('Selecione um produto para vincular a encomenda');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onConfirm(encomenda.id, precisaSelecionarProduto ? parseInt(produtoId, 10) : null);
      handleClose();
    } catch {
      // o toast de erro já foi exibido por quem chamou
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(encomenda)}
      onClose={handleClose}
      title={precisaSelecionarProduto ? 'Vincular produto e receber' : 'Confirmar recebimento'}
    >
      {encomenda && (
        <div className="space-y-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-line-strong bg-surface-muted p-4 text-sm text-ink">
            <dt className="font-bold">Encomenda:</dt><dd>#{encomenda.id}</dd>
            <dt className="font-bold">Item:</dt><dd>{encomenda.descricao}</dd>
            <dt className="font-bold">Cliente:</dt><dd>{encomenda.clienteNome}</dd>
            <dt className="font-bold">Quantidade:</dt><dd>{encomenda.quantidade}</dd>
          </dl>

          {precisaSelecionarProduto ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <FormInput
                  aria-label="Buscar produto"
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <FormField
                label="Produto do catálogo"
                error={error}
                hint="Esta encomenda foi criada para um produto que ainda não estava no catálogo. Escolha o produto correspondente para registrar a entrada no estoque."
              >
                <FormSelect value={produtoId} disabled={loadingProdutos} onChange={(e) => { setProdutoId(e.target.value); setError(''); }}>
                  <option value="">{loadingProdutos ? 'Carregando produtos...' : 'Selecione o produto correspondente'}</option>
                  {produtosFiltrados.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.unidadeAbreviacao}) - {formatCurrency(p.precoCusto ?? 0)}</option>
                  ))}
                </FormSelect>
              </FormField>
            </div>
          ) : (
            <p className="text-center text-sm text-body">
              Ao confirmar, será registrada a entrada de <strong>{encomenda.quantidade}</strong> unidade(s)
              de <strong>{encomenda.descricao}</strong> no estoque.
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={saving || (precisaSelecionarProduto && !produtoId)}>
              {saving ? 'Recebendo...' : 'Confirmar recebimento'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
