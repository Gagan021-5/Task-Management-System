import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ pagination, onPageChange }) => {
  const { page, pages, total } = pagination;

  if (!pages || pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages);
    } else if (pages > 1) {
      rangeWithDots.push(pages);
    }

    return [...new Set(rangeWithDots)];
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-slate-400">
        Showing page <span className="font-medium text-slate-200">{page}</span> of{' '}
        <span className="font-medium text-slate-200">{pages}</span> ({total} total)
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((num, idx) => (
          <button
            key={idx}
            onClick={() => typeof num === 'number' && onPageChange(num)}
            disabled={num === '...'}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
              num === page
                ? 'gradient-brand text-white shadow-lg shadow-brand-500/25'
                : num === '...'
                ? 'text-slate-500 cursor-default'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
