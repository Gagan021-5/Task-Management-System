import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tasksAPI } from '../api/tasks';
import { usersAPI } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { HiOutlineArrowLeft, HiOutlineDocumentArrowUp, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const TaskFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) fetchTask();
    if (isAdmin) fetchUsers();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await tasksAPI.getById(id);
      const task = res.data.data.task;
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo?._id || '',
      });
    } catch (error) {
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll({ limit: 100 });
      setUsers(res.data.data.users);
    } catch (error) {
      // Non-admin can't fetch users, that's fine
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.length < 3) errs.title = 'Title must be at least 3 characters';
    else if (form.title.length > 100) errs.title = 'Title cannot exceed 100 characters';
    if (form.description && form.description.length > 2000) errs.description = 'Description cannot exceed 2000 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = { ...form };
      if (!data.dueDate) delete data.dueDate;
      if (!data.assignedTo) delete data.assignedTo;

      let taskId = id;
      if (isEdit) {
        await tasksAPI.update(id, data);
        toast.success('Task updated successfully');
      } else {
        const res = await tasksAPI.create(data);
        taskId = res.data.data.task._id;
        toast.success('Task created successfully');
      }

      // Upload files if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('documents', file));
        await tasksAPI.uploadDocuments(taskId, formData);
        toast.success('Files uploaded successfully');
      }

      navigate(`/tasks/${taskId}`);
    } catch (error) {
      const msg = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} task`;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter((f) => f.type === 'application/pdf');

    if (pdfFiles.length !== selectedFiles.length) {
      toast.error('Only PDF files are allowed');
    }

    if (pdfFiles.length + files.length > 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }

    setFiles([...files, ...pdfFiles]);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  if (loadingData) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">

      <div className="flex items-center gap-4 mb-8 animate-slide-up">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h1>
      </div>


      <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="Enter task title"
              id="task-title"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>


          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input min-h-[120px] resize-y"
              placeholder="Describe the task..."
              rows={4}
              id="task-description"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="form-input"
                id="task-status"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="form-input"
                id="task-priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="form-input"
                id="task-due-date"
              />
            </div>

            {users.length > 0 && (
              <div>
                <label className="form-label">Assign To</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="form-input"
                  id="task-assign-to"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>


          {!isEdit && (
            <div>
              <label className="form-label">Documents (PDF, max 3 files, 5MB each)</label>
              <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors">
                <HiOutlineDocumentArrowUp className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-3">Drop PDF files here or click to browse</p>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="task-file-upload"
                />
                <label
                  htmlFor="task-file-upload"
                  className="btn-secondary cursor-pointer inline-flex"
                >
                  Choose Files
                </label>
              </div>


              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      <span className="text-sm text-slate-300 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              id="task-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEdit ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormPage;
