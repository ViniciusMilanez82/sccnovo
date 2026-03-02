import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/clientes/ClientesPage';
import { ProdutosPage } from './pages/produtos/ProdutosPage';
import { PropostasPage } from './pages/propostas/PropostasPage';
import { NovaPropostaPage } from './pages/propostas/NovaPropostaPage';
import { DetalhePropostaPage } from './pages/propostas/DetalhePropostaPage';
import { ContratosPage } from './pages/contratos/ContratosPage';
import { FaturamentoPage } from './pages/faturamento/FaturamentoPage';
import { FinanceiroPage } from './pages/financeiro/FinanceiroPage';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { MainLayout } from './components/layout/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/propostas" element={<PropostasPage />} />
              <Route path="/propostas/nova" element={<NovaPropostaPage />} />
              <Route path="/propostas/:id" element={<DetalhePropostaPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/faturamento" element={<FaturamentoPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
