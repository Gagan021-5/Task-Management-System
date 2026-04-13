import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { FaTasks } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/tasks', label: 'Tasks' },
    ...(isAdmin ? [{ path: '/users', label: 'Users' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-700/30 backdrop-blur-2xl"
      style={{ background: 'rgba(5, 10, 24, 0.7)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl gradient-brand shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <FaTasks className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">Taskify</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith(link.path)
                    ? 'text-white bg-white/[0.06] shadow-inner border border-white/[0.06]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/40' : 'bg-red-400'}`}
                style={connected ? { animation: 'pulse 2s ease-in-out infinite' } : {}} />
              <span className="text-xs text-slate-500 hidden lg:block">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-700/40">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>

              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Logout"
              >
                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-slate-700/30 px-4 py-2 flex gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname.startsWith(link.path)
                ? 'text-white bg-white/[0.06]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
