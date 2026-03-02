import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { proposalsService, CreateProposalData } from '../../services/proposals.service';
import { clientsService } from '../../services/clients.service';
import { productsService, Product } from '../../services/products.service';

interface ItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
  periodDays: number;
}

export function NovaPropostaPage() {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<ItemForm[]>([
    { productId: '', quantity: 1, unitPrice: 0, periodDays: 30 },
  ]);
  const [error, setError] = useState('');

  const { data: clientsData } = useQuery({
    queryKey: ['clients-select'],
    queryFn: () => clientsService.list({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-select'],
    queryFn: () => productsService.list({ active: true, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProposalData) => proposalsService.create(data),
    onSuccess: (proposal) => {
      navigate(`/propostas/${proposal.id}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Erro ao criar proposta. Verifique os dados.');
    },
  });

  const handleProductChange = (index: number, productId: string) => {
    const product: Product | undefined = productsData?.data?.find((p: Product) => p.id === productId);
    // unitPrice vem como Decimal do Prisma (string no JSON), converter para number
    const unitPrice = product?.unitPrice ? Number(product.unitPrice) : 0;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, productId, unitPrice }
          : item
      )
    );
  };

  const handleItemChange = (index: number, field: keyof ItemForm, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () =>
    setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0, periodDays: 30 }]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const totalBruto = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * item.periodDays,
    0
  );
  const totalLiquido = totalBruto * (1 - discount / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId) { setError('Selecione um cliente.'); return; }
    if (items.some((i) => !i.productId)) { setError('Selecione o produto em todos os itens.'); return; }
    if (items.some((i) => i.quantity <= 0)) { setError('A quantidade deve ser maior que zero.'); return; }
    if (items.some((i) => Number(i.unitPrice) <= 0)) { setError('O preço unitário deve ser maior que zero em todos os itens.'); return; }

    // Converter validUntil para ISO-8601 completo ou undefined
    const validUntilISO = validUntil
      ? new Date(validUntil + 'T00:00:00.000Z').toISOString()
      : undefined;

    createMutation.mutate({
      clientId,
      discount,
      notes: notes || undefined,
      validUntil: validUntilISO,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        periodDays: Number(i.periodDays),
      })),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/propostas')}
          className="text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Nova Proposta Comercial</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados gerais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Dados Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
                required
              >
                <option value="">Selecione um cliente...</option>
                {clientsData?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.document}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Válida até
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] resize-none"
                placeholder="Condições especiais, prazo de entrega, etc."
              />
            </div>
          </div>
        </div>

        {/* Itens da proposta */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-700">Itens da Proposta</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-[#00529B] hover:text-blue-700 font-medium"
            >
              <Plus size={16} /> Adicionar Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                {/* Produto */}
                <div className="col-span-12 md:col-span-4">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Produto *</label>
                  )}
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
                    required
                  >
                    <option value="">Selecione...</option>
                    {productsData?.data?.map((p: Product) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qtd */}
                <div className="col-span-3 md:col-span-2">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                  )}
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
                  />
                </div>

                {/* Preço unitário */}
                <div className="col-span-4 md:col-span-3">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Preço Unit. (R$)</label>
                  )}
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
                  />
                </div>

                {/* Período */}
                <div className="col-span-4 md:col-span-2">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Período (dias)</label>
                  )}
                  <input
                    type="number"
                    min={1}
                    value={item.periodDays}
                    onChange={(e) => handleItemChange(index, 'periodDays', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
                  />
                </div>

                {/* Remover */}
                <div className="col-span-1">
                  {index === 0 && <div className="h-5 mb-1" />}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="w-full flex justify-center py-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="mt-6 pt-4 border-t flex justify-end">
            <div className="text-sm space-y-1 text-right">
              <div className="text-gray-600">
                Total bruto:{' '}
                <span className="font-medium text-gray-800">
                  {totalBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              {discount > 0 && (
                <div className="text-gray-500">
                  Desconto ({discount}%):{' '}
                  <span className="text-red-600">
                    -{((totalBruto * discount) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              )}
              <div className="text-base font-bold text-[#00529B]">
                Total líquido:{' '}
                {totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/propostas')}
            className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-[#00529B] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {createMutation.isPending ? 'Salvando...' : 'Salvar Proposta'}
          </button>
        </div>
      </form>
    </div>
  );
}
