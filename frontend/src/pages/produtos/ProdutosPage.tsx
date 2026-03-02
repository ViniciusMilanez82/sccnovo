import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, X, Loader2, AlertCircle, Package } from 'lucide-react';
import { productsService, Product, CreateProductData } from '../../services/products.service';

const productSchema = z.object({
  code: z.string().min(1, 'O código é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  unitPrice: z.coerce.number().min(0.01, 'O preço deve ser maior que zero.'),
});

type ProductFormData = z.infer<typeof productSchema>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
}

function ProductModal({ product, onClose }: ProductModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? { code: product.code, description: product.description, unitPrice: product.unitPrice }
      : {},
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProductData) =>
      isEditing ? productsService.update(product.id, data) : productsService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {mutation.isError && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            <AlertCircle size={16} />
            <span>{(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao salvar produto.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              {...register('code')}
              disabled={isEditing}
              placeholder="Ex: CONT-20-STD"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] disabled:bg-gray-50 ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              {...register('description')}
              placeholder="Contêiner 20 pés Standard"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário (R$/mês)</label>
            <input
              {...register('unitPrice')}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.unitPrice ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-[#00529B] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProdutosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout((window as unknown as { st?: ReturnType<typeof setTimeout> }).st);
    (window as unknown as { st?: ReturnType<typeof setTimeout> }).st = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 400);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', debouncedSearch, page],
    queryFn: () => productsService.list({ search: debouncedSearch || undefined, page }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
        <button onClick={() => { setEditingProduct(undefined); setModalOpen(true); }} className="flex items-center gap-2 bg-[#00529B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Buscar por código ou descrição..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500"><AlertCircle size={32} className="mx-auto mb-2" /><p>Erro ao carregar produtos.</p></div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Preço/mês</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((p: Product) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(p.unitPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} className="text-gray-400 hover:text-[#00529B]"><Pencil size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>{data.meta.total} produtos</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="px-3 py-1">Página {page} de {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="px-3 py-1 border rounded disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && <ProductModal product={editingProduct} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
