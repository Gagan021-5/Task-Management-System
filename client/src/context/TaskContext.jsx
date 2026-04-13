import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../api/tasks';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const { socket } = useSocket();

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const mergedParams = { ...filters, ...params };
      const res = await tasksAPI.getAll(mergedParams);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('task:created', (task) => {
      setTasks((prev) => [task, ...prev]);
      toast.success(`New task: ${task.title}`, { icon: '📋' });
    });

    socket.on('task:updated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    socket.on('task:deleted', (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    socket.on('task:statusChanged', ({ taskId, status }) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t))
      );
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:statusChanged');
    };
  }, [socket]);

  const value = {
    tasks,
    pagination,
    loading,
    filters,
    setFilters,
    fetchTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
