import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/tasks';
import { HiOutlinePlus, HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [allRes, todoRes, progressRes, doneRes] = await Promise.all([
        tasksAPI.getAll({ limit: 5, sort: 'createdAt', order: 'desc' }),
        tasksAPI.getAll({ status: 'todo', limit: 1 }),
        tasksAPI.getAll({ status: 'in-progress', limit: 1 }),
        tasksAPI.getAll({ status: 'done', limit: 1 }),
      ]);

      setStats({
        total: allRes.data.data.pagination.total,
        todo: todoRes.data.data.pagination.total,
        inProgress: progressRes.data.data.pagination.total,
        done: doneRes.data.data.pagination.total,
      });
      setRecentTasks(allRes.data.data.tasks);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: HiOutlineClipboardDocumentList,
      gradient: 'from-cyan-500 via-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/20' },
    { title: 'To Do', value: stats.todo, icon: HiOutlineClock,
      gradient: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/20' },
    { title: 'In Progress', value: stats.inProgress, icon: HiOutlineExclamationTriangle,
      gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { title: 'Completed', value: stats.done, icon: HiOutlineCheckCircle,
      gradient: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/20' },
  ];

  const getStatusBadge = (status) => {
    const classes = { 'todo': 'badge-todo', 'in-progress': 'badge-in-progress', 'done': 'badge-done' };
    const labels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
    return <span className={`badge ${classes[status]}`}>{labels[status]}</span>;
  };

  const getPriorityBadge = (priority) => {
    const classes = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
    return <span className={`badge ${classes[priority]}`}>{priority}</span>;
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your tasks</p>
        </div>
        <Link to="/tasks/new" className="btn-primary" id="dashboard-new-task">
          <HiOutlinePlus className="w-5 h-5" />
          New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={card.title} className="glass-card-hover p-6 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadow}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{card.value}</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            View all →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineClipboardDocumentList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tasks yet</p>
            <p className="text-slate-500 text-sm mt-1">Create your first task to get started</p>
            <Link to="/tasks/new" className="btn-primary mt-4 inline-flex">
              <HiOutlinePlus className="w-5 h-5" />
              Create Task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-200 group-hover:text-white truncate transition-colors">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                    {task.dueDate && (
                      <span className="text-xs text-slate-500">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-slate-400 transition-colors ml-4">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
