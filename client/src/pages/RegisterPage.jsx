import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTasks } from 'react-icons/fa';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    else if (form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { confirmPassword, ...data } = form;
    const result = await register(data);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="auth-page-bg flex items-center justify-center px-4 py-12 min-h-screen">
      <div className="relative w-full max-w-md animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/25 mb-4">
            <FaTasks className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Get started with Taskify</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input pl-12" placeholder="John Doe" id="register-name" />
              </div>
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input pl-12" placeholder="you@example.com" id="register-email" />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-input pl-12 pr-12" placeholder="Min. 6 characters" id="register-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="form-input pl-12" placeholder="Repeat your password" id="register-confirm-password" />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="register-submit">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
