import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tasksAPI } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { format } from 'date-fns';
import {
  HiOutlineArrowLeft,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineDocumentArrowDown,
  HiOutlineDocumentArrowUp,
  HiOutlineXMark,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await tasksAPI.getById(id);
      setTask(res.data.data.task);
    } catch (error) {
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = isAdmin || task?.createdBy?._id === user?._id;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tasksAPI.delete(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalDocs = (task.documents?.length || 0) + files.length;
    if (totalDocs > 3) {
      toast.error(`Maximum 3 documents. Currently has ${task.documents?.length || 0}.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('documents', f));
      const res = await tasksAPI.uploadDocuments(id, formData);
      setTask(res.data.data.task);
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, originalName) => {
    try {
      const res = await tasksAPI.downloadDocument(id, docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await tasksAPI.deleteDocument(id, docId);
      setTask({
        ...task,
        documents: task.documents.filter((d) => d._id !== docId),
      });
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getStatusClass = (status) => {
    const map = { 'todo': 'badge-todo', 'in-progress': 'badge-in-progress', 'done': 'badge-done' };
    return map[status];
  };

  const getStatusLabel = (status) => {
    const map = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
    return map[status];
  };

  const getPriorityClass = (p) => {
    const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
    return map[p];
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="page-container max-w-4xl">

      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Link to={`/tasks/${id}/edit`} className="btn-secondary" id="edit-task-btn">
              <HiOutlinePencilSquare className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => setDeleteModal(true)}
              className="btn-danger"
              id="delete-task-btn"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>


      <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`badge ${getStatusClass(task.status)}`}>{getStatusLabel(task.status)}</span>
            <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority} priority</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
        </div>


        {task.description && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 mb-2">Description</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>
        )}


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          {task.dueDate && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <HiOutlineCalendarDays className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Due Date</p>
                <p className="text-sm text-slate-200 font-medium">
                  {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}

          {task.assignedTo && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <HiOutlineUser className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Assigned To</p>
                <p className="text-sm text-slate-200 font-medium">{task.assignedTo.name}</p>
                <p className="text-xs text-slate-500">{task.assignedTo.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-700/50">
              <HiOutlineUser className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Created By</p>
              <p className="text-sm text-slate-200 font-medium">{task.createdBy?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-700/50">
              <HiOutlineCalendarDays className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm text-slate-200 font-medium">
                {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>


        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4" />
              Documents ({task.documents?.length || 0}/3)
            </h2>

            {canEdit && (task.documents?.length || 0) < 3 && (
              <label className="btn-secondary cursor-pointer text-xs">
                <HiOutlineDocumentArrowUp className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {task.documents?.length > 0 ? (
            <div className="space-y-2">
              {task.documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <HiOutlineDocumentText className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-sm text-slate-300 truncate">{doc.originalName}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(doc._id, doc.originalName)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all"
                      title="Download"
                    >
                      <HiOutlineDocumentArrowDown className="w-4 h-4" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm p-4 text-center rounded-xl bg-slate-800/20 border border-slate-700/20">
              No documents attached
            </p>
          )}
        </div>
      </div>


      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Task">
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete <strong>"{task.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={() => setDeleteModal(false)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;
