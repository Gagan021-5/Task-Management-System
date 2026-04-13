import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineArrowRightOnRectangle, HiOutlineBars3, HiOutlineXMark, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { FaTasks } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { connected } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 dark:border-slate-700/30 dark:bg-[#050a18]/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <FaTasks className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">Taskify</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith(link.path)
                    ? 'text-indigo-700 bg-indigo-50 dark:text-white dark:bg-white/[0.06] shadow-inner border border-transparent dark:border-white/[0.06]'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
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

              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
                title="Toggle Theme"
              >
                {theme === 'light' ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
              </button>

              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-400/10 transition-all"
                title="Logout"
              >
                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
              >
                {isMobileMenuOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 dark:border-slate-700/30 dark:bg-slate-900/95 backdrop-blur-xl absolute w-full shadow-2xl">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.startsWith(link.path)
                    ? 'text-indigo-700 bg-indigo-50 dark:text-white dark:bg-white/[0.06] border dark:border-white/[0.06]'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                toggleTheme();
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'light' ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
              <span className="text-sm font-medium">Toggle Theme</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-all"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
