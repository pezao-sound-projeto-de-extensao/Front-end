import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Ban, Briefcase, KeyRound, Pencil, Plus, RotateCcw, ShieldCheck, UserX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usuarioService } from '../services/usuarioService';
import { authService } from '../services/authService';
import { cargoService } from '../services/cargoService';
import { permissaoService } from '../services/permissaoService';
import { formatDateTime, initials } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';
import useCrudForm from '../hooks/useCrudForm';
import useApiData from '../hooks/useApiData';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import RowActions from '../components/RowActions';

// Os nomes dos campos do formulário seguem o UsuarioRequest/CargoRequest do back-end,
// assim os erros de validação da API caem direto no campo certo.
const USER_FIELDS = { nome: 'Nome', email: 'E-mail', cargo_id: 'Cargo', senha: 'Senha', ativo: 'Status' };
const CARGO_FIELDS = { nome: 'Nome', descricao: 'Descrição', permissoes: 'Permissões' };

const EMPTY_USER = { nome: '', email: '', cargo_id: '' };
const EMPTY_CARGO = { nome: '', descricao: '', permissoes: [] };

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
  { value: '', label: 'Todos' },
];

async function fetchUsersData() {
  const [usuariosPage, cargos, permissoes] = await Promise.all([
    usuarioService.listar({ size: 1000 }),
    cargoService.listar(),
    permissaoService.listar(),
  ]);
  return { users: usuariosPage.content ?? [], cargos, permissoes };
}

const validateUser = (data) => ({
  nome: !data.nome.trim(),
  email: !data.email.trim(),
  cargo_id: !data.cargo_id,
});

const validateCargo = (data) => ({
  nome: !data.nome.trim(),
  descricao: !data.descricao.trim(),
  permissoes: data.permissoes.length === 0 && 'Selecione pelo menos uma permissão',
});

const toUserPayload = (data) => ({ nome: data.nome.trim(), email: data.email.trim(), cargo_id: parseInt(data.cargo_id, 10) });
const toCargoPayload = (data) => ({ nome: data.nome.trim(), descricao: data.descricao.trim(), permissoes: data.permissoes });

const formatPermissao = (nome) => nome.toLowerCase().replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase());
const includesText = (value, term) => (value ?? '').toLowerCase().includes(term.toLowerCase());

/** Círculo com as iniciais do nome, ou com um ícone. */
function Avatar({ name, Icon }) {
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
      {Icon ? <Icon className="h-4 w-4" /> : initials(name)}
    </div>
  );
}

export default function Users() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [userSearch, setUserSearch] = useState('');
  const [cargoSearch, setCargoSearch] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ativo');
  const [resetTarget, setResetTarget] = useState(null);

  const { data, loading, reload: loadData } = useApiData(fetchUsersData, { users: [], cargos: [], permissoes: [] });
  const { users, cargos, permissoes } = data;

  const userForm = useCrudForm({
    initialData: EMPTY_USER,
    validate: validateUser,
    service: usuarioService,
    loadData,
    fieldLabels: USER_FIELDS,
    entityName: 'Usuário',
    successMessage: (criado, isEdit) => (!isEdit && criado?.conviteEnviado
      ? `Usuário cadastrado! Enviamos um e-mail para ${criado.email} criar a senha.`
      : undefined),
  });

  const cargoForm = useCrudForm({
    initialData: EMPTY_CARGO,
    validate: validateCargo,
    service: cargoService,
    loadData,
    fieldLabels: CARGO_FIELDS,
    entityName: 'Cargo',
  });

  const editUser = (user) => userForm.handleEdit(user, {
    nome: user.nome,
    email: user.email,
    cargo_id: String(user.cargo?.id ?? ''),
  });

  const editCargo = (cargo) => cargoForm.handleEdit(cargo, {
    nome: cargo.nome,
    descricao: cargo.descricao ?? '',
    permissoes: [...(cargo.permissoes ?? [])],
  });

  const toggleAtivo = async (user) => {
    try {
      await usuarioService.alternarAtivo(user.id);
      await loadData();
      showApiSuccess(user.ativo ? 'Usuário desativado!' : 'Usuário ativado!');
    } catch (err) {
      showApiError(err, USER_FIELDS);
    }
  };

  const confirmResetarSenha = async () => {
    try {
      await authService.resetarSenha(resetTarget.id);
      showApiSuccess(`Senha resetada! Enviamos um e-mail para ${resetTarget.email} criar uma nova.`);
    } catch (err) {
      showApiError(err, USER_FIELDS);
    } finally {
      setResetTarget(null);
    }
  };

  const togglePermissao = (nome) => {
    const atual = cargoForm.formData.permissoes;
    cargoForm.setField('permissoes', atual.includes(nome) ? atual.filter((p) => p !== nome) : [...atual, nome]);
  };

  const filteredUsers = users.filter((user) =>
    (includesText(user.nome, userSearch) || includesText(user.email, userSearch))
    && (!cargoFilter || String(user.cargo?.id) === cargoFilter)
    && (!statusFilter || (statusFilter === 'ativo') === Boolean(user.ativo)));

  const filteredCargos = cargos.filter((cargo) => includesText(cargo.nome, cargoSearch));

  const userColumns = [
    {
      header: 'Usuário',
      primary: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.nome} />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.nome}</p>
            <p className="truncate text-xs text-subtle">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Cargo', render: (row) => <StatusBadge status={row.cargo?.nome} tone="info" label={row.cargo?.nome} /> },
    { header: 'Situação', render: (row) => <StatusBadge status={row.ativo ? 'ativo' : 'inativo'} /> },
    { header: 'Último acesso', render: (row) => <span className="numeric text-body">{formatDateTime(row.ultimoAcesso)}</span> },
    {
      header: 'Ações', align: 'right', width: '130px',
      render: (row) => (
        <RowActions
          actions={[
            { label: 'Editar', icon: Pencil, onClick: () => editUser(row) },
            { label: 'Resetar senha', icon: KeyRound, tone: 'warning', onClick: () => setResetTarget(row) },
            row.ativo
              ? { label: 'Desativar', icon: Ban, tone: 'danger', onClick: () => toggleAtivo(row) }
              : { label: 'Ativar', icon: RotateCcw, tone: 'success', onClick: () => toggleAtivo(row) },
          ]}
        />
      ),
    },
  ];

  const cargoColumns = [
    {
      header: 'Cargo',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar Icon={Briefcase} />
          <div>
            <span className="font-medium">{row.nome}</span>
            {row.descricao && <p className="text-xs text-muted">{row.descricao}</p>}
          </div>
        </div>
      ),
    },
    {
      header: 'Permissões',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.permissoes.map((p) => (
            <span key={p} className="rounded bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">{formatPermissao(p)}</span>
          ))}
        </div>
      ),
    },
    {
      header: 'Ações', align: 'right',
      render: (row) => <Button variant="ghost-primary" size="sm" onClick={() => editCargo(row)}>Editar</Button>,
    },
  ];

  const isUsersTab = activeTab === 'usuarios';
  const tabClass = 'px-5 py-3 text-sm font-medium text-muted border-b-2 border-transparent -mb-px data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:border-primary';

  return (
    <PageLayout
      title="Usuários"
      description="Quem acessa o sistema e o que cada cargo pode fazer."
      actions={
        <Button onClick={() => (isUsersTab ? userForm.handleNew() : cargoForm.handleNew())}>
          <Plus className="h-4 w-4" /> {isUsersTab ? 'Novo usuário' : 'Novo cargo'}
        </Button>
      }
    >
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="mb-6 flex gap-1 border-b border-line-strong" aria-label="Seções">
          <Tabs.Trigger value="usuarios" className={tabClass}>Usuários</Tabs.Trigger>
          <Tabs.Trigger value="cargos" className={tabClass}>Cargos</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="usuarios">
          <FormPanel open={userForm.showForm} onClose={userForm.handleCancel} title={userForm.editMode ? 'Editar usuário' : 'Novo usuário'}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nome completo" error={userForm.errors.nome}>
                  <FormInput placeholder="Nome do usuário" value={userForm.formData.nome} onChange={(e) => userForm.setField('nome', e.target.value)} />
                </FormField>
                <FormField label="E-mail" error={userForm.errors.email}>
                  <FormInput type="email" placeholder="usuario@email.com" value={userForm.formData.email} onChange={(e) => userForm.setField('email', e.target.value)} />
                </FormField>
              </div>
              <FormField label="Cargo" error={userForm.errors.cargo_id}>
                <FormSelect value={userForm.formData.cargo_id} onChange={(e) => userForm.setField('cargo_id', e.target.value)}>
                  <option value="">Selecione um cargo</option>
                  {cargos.map((cargo) => <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>)}
                </FormSelect>
              </FormField>
              <CrudFormActions
                editMode={userForm.editMode}
                saving={userForm.saving}
                onCancel={userForm.handleCancel}
                onSave={() => userForm.handleSave(toUserPayload)}
              />
          </FormPanel>

          <div className="toolbar">
            <SearchBar value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." />
            <FilterSelect label="Cargo" value={cargoFilter} onChange={(e) => setCargoFilter(e.target.value)} options={[{ value: '', label: 'Todos os perfis' }, ...cargos.map((c) => ({ value: String(c.id), label: c.nome }))]} />
            <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} width="140px" options={STATUS_OPTIONS} />
          </div>

          <DataTable
            columns={userColumns}
            data={filteredUsers}
            loading={loading}
            empty={{ icon: UserX, title: 'Nenhum usuário encontrado', description: 'Tente outra busca ou ajuste os filtros.' }}
            isRowInactive={(row) => !row.ativo}
          />
        </Tabs.Content>

        <Tabs.Content value="cargos">
          <FormPanel open={cargoForm.showForm} onClose={cargoForm.handleCancel} title={cargoForm.editMode ? 'Editar cargo' : 'Novo cargo'}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nome do cargo" error={cargoForm.errors.nome}>
                  <FormInput placeholder="Ex.: Gerente, Analista..." value={cargoForm.formData.nome} onChange={(e) => cargoForm.setField('nome', e.target.value)} />
                </FormField>
                <FormField label="Descrição" error={cargoForm.errors.descricao}>
                  <FormInput placeholder="Ex.: Acesso a relatórios e movimentações" value={cargoForm.formData.descricao} onChange={(e) => cargoForm.setField('descricao', e.target.value)} />
                </FormField>
              </div>
              <fieldset>
                <legend className="field-label">Permissões</legend>
                <div
                  className={`grid grid-cols-1 gap-2 rounded-lg border bg-surface p-4 sm:grid-cols-2 ${cargoForm.errors.permissoes ? 'border-danger' : 'border-line'}`}
                >
                  {permissoes.map((permissao) => (
                    <label key={permissao.nome} className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                      <input
                        type="checkbox"
                        checked={cargoForm.formData.permissoes.includes(permissao.nome)}
                        onChange={() => togglePermissao(permissao.nome)}
                        className="accent-primary"
                      />
                      <span>
                        {formatPermissao(permissao.nome)}
                        {permissao.descricao && <span className="text-subtle"> — {permissao.descricao}</span>}
                      </span>
                    </label>
                  ))}
                </div>
                {cargoForm.errors.permissoes && <p className="field-error" role="alert">{cargoForm.errors.permissoes}</p>}
              </fieldset>
              <CrudFormActions
                editMode={cargoForm.editMode}
                saving={cargoForm.saving}
                onCancel={cargoForm.handleCancel}
                onSave={() => cargoForm.handleSave(toCargoPayload)}
              />
          </FormPanel>

          <div className="toolbar">
            <SearchBar value={cargoSearch} onChange={(e) => setCargoSearch(e.target.value)} placeholder="Buscar por cargo..." />
          </div>

          <DataTable columns={cargoColumns} data={filteredCargos} loading={loading} empty={{ icon: ShieldCheck, title: 'Nenhum cargo encontrado', description: 'Crie cargos para definir o que cada pessoa pode fazer.' }} />
        </Tabs.Content>
      </Tabs.Root>

      <ConfirmModal
        isOpen={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        onConfirm={confirmResetarSenha}
        title="Resetar senha"
        message={`A senha atual de ${resetTarget?.nome ?? ''} deixará de funcionar e um link para criar uma nova será enviado para ${resetTarget?.email ?? ''}.`}
        confirmLabel="Resetar"
        icon={<KeyRound className="h-5 w-5 text-danger" />}
      />
    </PageLayout>
  );
}
