import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="animate-fade-in">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: { primary: '#06b6d4', secondary: '#e2e8f0' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' },
          },
        }}
      />
    </div>
  );
};

export default Layout;
