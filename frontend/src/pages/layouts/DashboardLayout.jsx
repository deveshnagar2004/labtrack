import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ALL_LINKS = [
  { name: 'Dashboard', path: '/', roles: ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Equipment', path: '/equipment', roles: ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Bookings', path: '/bookings', roles: ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Issue / Return', path: '/transactions', roles: ['LAB_ASSISTANT', 'ADMIN'] },
  { name: 'My Equipment', path: '/transactions', roles: ['STUDENT'] },
  { name: 'Issues', path: '/issues', roles: ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Maintenance', path: '/maintenance', roles: ['LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Laboratories', path: '/labs', roles: ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Categories', path: '/categories', roles: ['ADMIN'] },
  { name: 'Users', path: '/users', roles: ['ADMIN'] },
  { name: 'Analytics', path: '/analytics', roles: ['LAB_ASSISTANT', 'ADMIN'] },
  { name: 'Scan QR', path: '/qr-scanner', roles: ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'] },
];

const ROLE_LABELS = {
  STUDENT: 'Student',
  LAB_ASSISTANT: 'Lab Assistant',
  ADMIN: 'Administrator',
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const links = ALL_LINKS.filter((link) => link.roles.includes(user?.role));

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-gray-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
            LT
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">LabTrack</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Lab Equipment System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `block rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400">{ROLE_LABELS[user?.role]}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-gray-400 hover:text-red-400 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="md:hidden font-semibold text-gray-900">LabTrack</div>
          <div className="hidden md:block text-sm text-gray-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600 font-medium">Logout</button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden border-t border-gray-200 bg-white flex overflow-x-auto">
          {links.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex-shrink-0 px-4 py-3 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
