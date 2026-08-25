import { useState, useEffect } from 'react';
import { Plus, User, Briefcase, Users as UsersIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usuarioService } from '../services/usuarioService';
import { cargoService } from '../services/cargoService';
import { permissaoService } from '../services/permissaoService';
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
  const [activeTab, setActiveTab] = useState('usuarios');

  const [users, setUsers] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const userForm = useCrudForm({
    initialData: { name: '', email: '', cargoId: '' },
    validate: (data) => ({
      name: !data.name.trim(),
      email: !data.email.trim(),
      cargoId: !data.cargoId,
    }),
    service: usuarioService,
    loadData: loadData,
  });

  const cargoForm = useCrudForm({
    initialData: { nome: '', descricao: '', permissoes: [] },
    validate: (data) => ({
      nome: !data.nome.trim(),
      descricao: !data.descricao.trim(),
      permissoes: data.permissoes.length === 0,
    }),
    service: cargoService,
    loadData: loadData,
  });

  const { showForm, editMode, formData, setFormData, errors, saving, handleNew, handleEdit, handleCancel, handleSave, handleClearField } = userForm;
  const { showForm: showCargoForm, editMode: editCargoMode, formData: cargoFormData, setFormData: setCargoFormData, errors: cargoErrors, saving: savingCargo, handleNew: handleNewCargo, handleEdit: handleEditCargo, handleCancel: handleCancelCargo, handleSave: handleSaveCargo, handleClearField: handleClearCargoField } = cargoForm;

  async function loadData() {
    try {
      setLoading(true);
      const [usuariosPage, cargosData, permissoesData] = await Promise.all([
        usuarioService.listar({ size: 1000 }),
        cargoService.listar(),
        permissaoService.listar(),
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
      setPermissoes(permissoesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleEditUser = (user) => {
    handleEdit(user);
    setFormData({ name: user.name, email: user.email, cargoId: String(user.cargoId) });
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

  const handleSaveNewCargo = () => {
    handleSaveCargo((data) => ({
      nome: data.nome,
      descricao: data.descricao,
      permissoes: data.permissoes,
    }));
  };

  const handleTogglePermissao = (nome) => {
    const current = cargoFormData.permissoes;
    setCargoFormData({
      ...cargoFormData,
      permissoes: current.includes(nome) ? current.filter(p => p !== nome) : [...current, nome],
    });
    handleClearCargoField('permissoes');
  };

  const formatPermissao = (nome) => nome.toLowerCase().replaceAll('_', ' ').replace(/^\w/, c => c.toUpperCase());

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredCargos = cargos.filter(cargo =>
    cargo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userColumns = [
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

  const cargoColumns = [
    {
      header: 'Cargo', accessor: 'nome',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1565c0', color: '#ffffff' }}>
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span style={{ fontWeight: '500' }}>{row.nome}</span>
            {row.descricao && <p style={{ fontSize: '12px', color: '#5a82a0' }}>{row.descricao}</p>}
          </div>
        </div>
      ),
    },
    {
      header: 'Permissões', accessor: 'permissoes',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.permissoes.map(p => (
            <span key={p} className="px-2 py-0.5 rounded" style={{ backgroundColor: '#e3edf7', color: '#1565c0', fontSize: '11px', fontWeight: '500' }}>
              {formatPermissao(p)}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Ações', align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => { handleEditCargo(row); setCargoFormData({ nome: row.nome, descricao: row.descricao || '', permissoes: Array.from(row.permissoes || []) }); }} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1565c0' }}>Editar</Button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'usuarios', label: 'Usuários' },
    { id: 'cargos', label: 'Cargos' },
  ];

  return (
    <PageLayout
      title="Usuários"
      icon={UsersIcon}
      actions={
        activeTab === 'usuarios' ? (
          <Button onClick={handleNew} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Novo usuário</Button>
        ) : (
          <Button onClick={handleNewCargo} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Novo cargo</Button>
        )
      }
    >
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: '#d0dde8' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
            className="px-5 py-3 text-sm transition-colors"
            style={{
              fontWeight: activeTab === tab.id ? 'bold' : '500',
              color: activeTab === tab.id ? '#1565c0' : '#5a82a0',
              borderBottom: activeTab === tab.id ? '2px solid #1565c0' : '2px solid transparent',
              marginBottom: '-1px',
              backgroundColor: 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'usuarios' && (
        <>
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
                <FormSelect value={formData.cargoId} onChange={(e) => { setFormData({ ...formData, cargoId: e.target.value }); handleClearField('cargoId'); }} error={errors.cargoId}>
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

          <DataTable columns={userColumns} data={filteredUsers} loading={loading} emptyMessage="Nenhum usuário encontrado" />
        </>
      )}

      {activeTab === 'cargos' && (
        <>
          {showCargoForm && (
            <FormPanel title={editCargoMode ? 'Editar cargo' : 'Novo cargo'}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Nome do cargo" error={cargoErrors.nome}>
                  <FormInput placeholder="Ex.: Gerente, Analista..." value={cargoFormData.nome} onChange={(e) => { setCargoFormData({ ...cargoFormData, nome: e.target.value }); handleClearCargoField('nome'); }} error={cargoErrors.nome} />
                </FormField>
                <FormField label="Descrição" error={cargoErrors.descricao}>
                  <FormInput placeholder="Ex.: Acesso a relatórios e movimentações" value={cargoFormData.descricao} onChange={(e) => { setCargoFormData({ ...cargoFormData, descricao: e.target.value }); handleClearCargoField('descricao'); }} error={cargoErrors.descricao} />
                </FormField>
              </div>
              <FormField label="Permissões" error={cargoErrors.permissoes}>
                <div className="grid grid-cols-2 gap-2 p-4 rounded-lg" style={{ backgroundColor: '#ffffff', border: cargoErrors.permissoes ? '1px solid #e84040' : '1px solid #d0dde8' }}>
                  {permissoes.map(permissao => (
                    <label key={permissao.nome} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '13px', color: '#0d2137' }}>
                      <input
                        type="checkbox"
                        checked={cargoFormData.permissoes.includes(permissao.nome)}
                        onChange={() => handleTogglePermissao(permissao.nome)}
                        style={{ accentColor: '#1565c0' }}
                      />
                      <span>
                        {formatPermissao(permissao.nome)}
                        {permissao.descricao && <span style={{ color: '#8aabb8' }}> — {permissao.descricao}</span>}
                      </span>
                    </label>
                  ))}
                </div>
                {cargoErrors.permissoes && <p className="mt-1" style={{ fontSize: '12px', color: '#e84040' }}>Selecione pelo menos uma permissão</p>}
              </FormField>
              <CrudFormActions editMode={editCargoMode} saving={savingCargo} onCancel={handleCancelCargo} onSave={handleSaveNewCargo} />
            </FormPanel>
          )}

          <div className="flex gap-3 mb-4">
            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por cargo..." />
          </div>

          <DataTable columns={cargoColumns} data={filteredCargos} loading={loading} emptyMessage="Nenhum cargo encontrado" />
        </>
      )}
    </PageLayout>
  );
}
