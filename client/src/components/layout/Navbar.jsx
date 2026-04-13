import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HiOutlineBell, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
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
    <nav className="sticky top-0 z-40 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl gradient-brand shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
              <FaTasks className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">TaskFlow</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith(link.path)
                    ? 'text-white bg-slate-800/80 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Connection indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse-soft' : 'bg-red-400'}`} />
              <span className="text-xs text-slate-500 hidden lg:block">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-700/50">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-brand-500/20">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              {/* Logout */}
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

      {/* Mobile nav */}
      <div className="md:hidden border-t border-slate-700/50 px-4 py-2 flex gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname.startsWith(link.path)
                ? 'text-white bg-slate-800/80'
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
