import { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usuarioService } from '../services/usuarioService';
import { cargoService } from '../services/cargoService';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import useCrudForm from '../hooks/useCrudForm';
import { formatDateTime } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const { showForm, editMode, formData, setFormData, errors, saving, handleNew, handleEdit, handleCancel, handleSave, handleClearField } = useCrudForm({
    initialData: { name: '', email: '', cargoId: '' },
    validate: (data) => ({
      name: !data.name.trim(),
      email: !data.email.trim(),
      cargoId: !data.cargoId,
    }),
    service: usuarioService,
    loadData: loadData,
  });

  async function loadData() {
    try {
      setLoading(true);
      const [usuariosPage, cargosData] = await Promise.all([
        usuarioService.listar({ size: 1000 }),
        cargoService.listar(),
      ]);
      const raw = usuariosPage.content || usuariosPage;
      setUsers(raw.map(u => ({
        id: u.id,
        name: u.nome,
        email: u.email,
        role: u.cargo?.nome || '',
        cargoId: u.cargo?.id || '',
        status: u.ativo ? 'ativo' : 'inativo',
        lastAccess: u.ultimoAcesso,
      })));
      setCargos(cargosData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleEditUser = (user) => {
    handleEdit(user);
    setFormData({ name: user.name, email: user.email, cargoId: user.cargoId });
  };

  const handleToggleAtivo = async (id) => {
    try {
      await usuarioService.ativar(id);
      await loadData();
      showApiSuccess('Status do usuário atualizado!');
    } catch (err) {
      showApiError(err);
    }
  };

  const handleSaveUser = () => {
    handleSave((data) => ({
      nome: data.name,
      email: data.email,
      cargo_id: parseInt(data.cargoId),
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      header: 'Nome', accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1565c0', color: '#ffffff' }}>
            <User className="w-4 h-4" />
          </div>
          <span style={{ fontWeight: '500' }}>{row.name}</span>
        </div>
      ),
    },
    { header: 'E-mail', accessor: 'email' },
    { header: 'Perfil', accessor: 'role', render: (row) => <StatusBadge status={row.role} /> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Último acesso', accessor: 'lastAccess', render: (row) => formatDateTime(row.lastAccess) },
    {
      header: 'Ações', align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleEditUser(row)} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1565c0' }}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleAtivo(row.id)} style={{ fontSize: '12px', fontWeight: 'bold', color: row.status === 'ativo' ? '#e84040' : '#1e9e5e' }}>
            {row.status === 'ativo' ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="Usuários" actions={<Button onClick={handleNew} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Novo usuário</Button>}>
      {showForm && (
        <FormPanel title={editMode ? 'Editar usuário' : 'Novo usuário'}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nome completo" error={errors.name}>
              <FormInput placeholder="Nome do usuário" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); handleClearField('name'); }} error={errors.name} />
            </FormField>
            <FormField label="E-mail" error={errors.email}>
              <FormInput type="email" placeholder="usuario@email.com" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); handleClearField('email'); }} error={errors.email} />
            </FormField>
          </div>
          <FormField label="Cargo" error={errors.cargoId}>
            <FormSelect value={formData.cargoId} onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })} error={errors.cargoId}>
              <option value="">Selecione um cargo</option>
              {cargos.map(cargo => <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>)}
            </FormSelect>
          </FormField>
          <CrudFormActions editMode={editMode} saving={saving} onCancel={handleCancel} onSave={handleSaveUser} />
        </FormPanel>
      )}

      <div className="flex gap-3 mb-4">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nome ou e-mail..." />
        <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} width="160px" options={[{ value: 'Todos', label: 'Todos os perfis' }, ...cargos.map(c => ({ value: c.nome, label: c.nome }))]} />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} width="140px" options={[{ value: 'Todos', label: 'Todos' }, { value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]} />
      </div>

      <DataTable columns={columns} data={filteredUsers} loading={loading} emptyMessage="Nenhum usuário encontrado" />
    </PageLayout>
  );
}
