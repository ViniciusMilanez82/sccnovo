import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, X, Loader2, AlertCircle } from 'lucide-react';
import { clientsService, Client, CreateClientData } from '../../services/clients.service';

// ─── Schema de validação ────────────────────────────────────────────────────
const clientSchema = z.object({
  personType: z.enum(['PF', 'PJ'], { required_error: 'Selecione o tipo de pessoa.' }),
  name: z.string().min(1, 'O nome/razão social é obrigatório.'),
  document: z.string().min(1, 'O CPF/CNPJ é obrigatório.'),
  stateId: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

// ─── Badge de status ─────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-800',
  INATIVO: 'bg-gray-100 text-gray-600',
  INADIMPLENTE: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

// ─── Modal de Cadastro/Edição ─────────────────────────────────────────────────
interface ClientModalProps {
  client?: Client;
  onClose: () => void;
}

function ClientModal({ client, onClose }: ClientModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!client;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? { personType: client.personType, name: client.name, document: client.document, stateId: client.stateId, email: client.email, phone: client.phone }
      : { personType: 'PJ' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateClientData) =>
      isEditing ? clientsService.update(client.id, data) : clientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    },
  });

  const onSubmit = (data: ClientFormData) => {
    mutation.mutate(data as CreateClientData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Erro da mutation */}
        {mutation.isError && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            <AlertCircle size={16} />
            <span>{(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao salvar cliente.'}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pessoa</label>
              <select
                {...register('personType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
              >
                <option value="PJ">Pessoa Jurídica</option>
                <option value="PF">Pessoa Física</option>
              </select>
              {errors.personType && <p className="text-red-500 text-xs mt-1">{errors.personType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
              <input
                {...register('document')}
                placeholder="00.000.000/0001-00"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.document ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Razão Social</label>
            <input
              {...register('name')}
              placeholder="Nome completo ou razão social"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
              <input
                {...register('stateId')}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                {...register('phone')}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              {...register('email')}
              type="email"
              placeholder="contato@empresa.com.br"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#00529B] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {(isSubmitting || mutation.isPending) && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export function ClientesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  // Debounce da busca
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout((window as unknown as { searchTimeout?: ReturnType<typeof setTimeout> }).searchTimeout);
    (window as unknown as { searchTimeout?: ReturnType<typeof setTimeout> }).searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clients', debouncedSearch, page],
    queryFn: () => clientsService.list({ search: debouncedSearch || undefined, page }),
  });

  const openNewModal = () => { setEditingClient(undefined); setModalOpen(true); };
  const openEditModal = (client: Client) => { setEditingClient(client); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-[#00529B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nome, CPF/CNPJ..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          // Skeleton loading
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p>Erro ao carregar clientes. Tente novamente.</p>
          </div>
        ) : data?.data.length === 0 ? (
          // Empty state
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-1">Nenhum cliente encontrado.</p>
            <p className="text-sm">
              {debouncedSearch ? 'Tente buscar com outros termos.' : 'Que tal cadastrar o primeiro?'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome / Razão Social</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">CPF / CNPJ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{client.document}</td>
                  <td className="px-4 py-3 text-gray-600">{client.email || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(client)}
                      className="text-gray-400 hover:text-[#00529B] transition-colors"
                      title="Editar cliente"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginação */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>{data.meta.total} clientes encontrados</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1">Página {page} de {data.meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && <ClientModal client={editingClient} onClose={closeModal} />}
    </div>
  );
}
