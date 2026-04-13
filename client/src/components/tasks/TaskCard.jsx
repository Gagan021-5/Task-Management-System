import { Link } from 'react-router-dom';
import { HiOutlineCalendarDays, HiOutlineUser, HiOutlineDocumentText } from 'react-icons/hi2';
import { format } from 'date-fns';

const TaskCard = ({ task }) => {
  const statusConfig = {
    'todo': { badge: 'badge-todo', label: 'To Do' },
    'in-progress': { badge: 'badge-in-progress', label: 'In Progress' },
    'done': { badge: 'badge-done', label: 'Done' },
  };

  const priorityConfig = {
    low: { badge: 'badge-low', label: 'Low' },
    medium: { badge: 'badge-medium', label: 'Medium' },
    high: { badge: 'badge-high', label: 'High' },
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Link to={`/tasks/${task._id}`} className="glass-card-hover p-5 block group" id={`task-card-${task._id}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-white transition-colors line-clamp-2">
          {task.title}
        </h3>
        <span className={`badge ${status.badge} flex-shrink-0`}>{status.label}</span>
      </div>

      {task.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{task.description}</p>
      )}

      <div className="flex items-center flex-wrap gap-3 text-xs">
        <span className={`badge ${priority.badge}`}>{priority.label}</span>

        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            <HiOutlineCalendarDays className="w-3.5 h-3.5" />
            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        {task.assignedTo && (
          <div className="flex items-center gap-1 text-slate-500">
            <HiOutlineUser className="w-3.5 h-3.5" />
            <span>{task.assignedTo.name}</span>
          </div>
        )}

        {task.documents?.length > 0 && (
          <div className="flex items-center gap-1 text-slate-500">
            <HiOutlineDocumentText className="w-3.5 h-3.5" />
            <span>{task.documents.length} file{task.documents.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default TaskCard;
