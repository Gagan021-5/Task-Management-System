const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} glass-card p-6 animate-scale-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
