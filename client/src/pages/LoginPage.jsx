import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTasks } from 'react-icons/fa';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="auth-page-bg flex items-center justify-center px-4 min-h-screen">
      <div className="relative w-full max-w-md animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/25 mb-4">
            <FaTasks className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your Taskify account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input pl-12"
                  placeholder="you@example.com"
                  id="login-email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-input pl-12 pr-12"
                  placeholder="••••••••"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="login-submit">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
