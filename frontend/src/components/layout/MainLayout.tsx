import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ClipboardList,
  Receipt,
  DollarSign,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/propostas', label: 'Propostas', icon: FileText },
  { to: '/contratos', label: 'Contratos', icon: ClipboardList },
  { to: '/faturamento', label: 'Faturamento', icon: Receipt },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
];

export function MainLayout() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('scc_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('scc_token');
    localStorage.removeItem('scc_user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#00529B] text-white flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-xl font-bold">SCC-NG</h1>
          <p className="text-xs text-blue-200 mt-1">Multiteiner</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-[#00529B]'
                    : 'text-blue-100 hover:bg-blue-700'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuário e Logout */}
        <div className="p-4 border-t border-blue-700">
          <div className="text-sm text-blue-200 mb-3">
            <p className="font-medium text-white truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
