import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../api/tasks';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskCard from '../components/tasks/TaskCard';
import Pagination from '../components/common/Pagination';
import { HiOutlinePlus, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 12 });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 12 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage and track all your tasks
          </p>
        </div>
        <Link to="/tasks/new" className="btn-primary" id="create-task-btn">
          <HiOutlinePlus className="w-5 h-5" />
          New Task
        </Link>
      </div>

      {/* Filters */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <TaskFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <HiOutlineClipboardDocumentList className="w-20 h-20 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-1">No tasks found</p>
          <p className="text-slate-500 text-sm">
            {Object.keys(filters).length > 2
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {tasks.map((task, idx) => (
              <div key={task._id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
                <TaskCard task={task} />
              </div>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default TaskListPage;
