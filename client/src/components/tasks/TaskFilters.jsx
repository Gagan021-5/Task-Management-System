import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const TaskFilters = ({ filters, onChange, onReset }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const hasFilters = filters.status || filters.priority || filters.search || filters.sort;

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3">

        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search tasks..."
            className="form-input pl-10 py-2.5"
            id="task-search"
          />
        </div>


        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="form-input py-2.5 w-full lg:w-44"
          id="task-filter-status"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>


        <select
          value={filters.priority || ''}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="form-input py-2.5 w-full lg:w-44"
          id="task-filter-priority"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>


        <select
          value={filters.sort || ''}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="form-input py-2.5 w-full lg:w-44"
          id="task-filter-sort"
        >
          <option value="">Sort By</option>
          <option value="createdAt">Date Created</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>


        {hasFilters && (
          <button
            onClick={onReset}
            className="btn-ghost py-2.5 whitespace-nowrap"
            id="task-filter-reset"
          >
            <HiOutlineXMark className="w-5 h-5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
