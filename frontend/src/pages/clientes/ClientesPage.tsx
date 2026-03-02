export function ClientesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button className="bg-[#00529B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          Novo Cliente
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          O módulo de Clientes (US-CAD-001) será implementado na Sprint 2.
        </p>
      </div>
    </div>
  );
}
