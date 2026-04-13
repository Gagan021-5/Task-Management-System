import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="min-h-screen relative">
      <div className="app-bg" />
      <div className="app-bg-orb app-bg-orb-1" />
      <div className="app-bg-orb app-bg-orb-2" />
      <div className="app-bg-orb app-bg-orb-3" />
      <div className="app-bg-grid" />

      <div className="relative z-10">
        <Navbar />
        <main className="animate-fade-in">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(51, 65, 85, 0.4)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
          success: { iconTheme: { primary: '#06b6d4', secondary: '#e2e8f0' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' } },
        }}
      />
    </div>
  );
};

export default Layout;
