import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Task from '../models/Task.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTask = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;

  const task = await Task.create(req.body);
  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  const io = req.app.get('io');
  if (io) io.emit('task:created', populated);

  res.status(201).json(new ApiResponse(201, 'Task created successfully', { task: populated }));
});

export const getTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  if (req.query.dueBefore || req.query.dueAfter) {
    filter.dueDate = {};
    if (req.query.dueBefore) filter.dueDate.$lte = new Date(req.query.dueBefore);
    if (req.query.dueAfter) filter.dueDate.$gte = new Date(req.query.dueAfter);
  }

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.user.role !== 'admin') {
    const userFilter = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
    if (filter.$or && filter.$or.length > 0) {
      filter.$and = [{ $or: filter.$or }, { $or: userFilter }];
      delete filter.$or;
    } else {
      filter.$or = userFilter;
    }
  }

  const sortField = req.query.sort || 'createdAt';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Tasks retrieved successfully', {
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) throw ApiError.notFound('Task not found');

  if (
    req.user.role !== 'admin' &&
    task.createdBy._id.toString() !== req.user._id.toString() &&
    (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('Not authorized to view this task');
  }

  res.status(200).json(new ApiResponse(200, 'Task retrieved successfully', { task }));
});

export const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this task');
  }

  const previousStatus = task.status;

  task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  const io = req.app.get('io');
  if (io) {
    io.emit('task:updated', task);
    if (req.body.status && req.body.status !== previousStatus) {
      io.emit('task:statusChanged', { taskId: task._id, status: task.status });
    }
  }

  res.status(200).json(new ApiResponse(200, 'Task updated successfully', { task }));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this task');
  }

  if (task.documents && task.documents.length > 0) {
    task.documents.forEach((doc) => {
      const filePath = path.join(__dirname, '../../uploads', doc.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  }

  await task.deleteOne();

  const io = req.app.get('io');
  if (io) io.emit('task:deleted', req.params.id);

  res.status(200).json(new ApiResponse(200, 'Task deleted successfully'));
});

export const uploadDocuments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to upload documents to this task');
  }

  if (!req.files || req.files.length === 0) throw ApiError.badRequest('No files uploaded');

  const totalDocs = task.documents.length + req.files.length;
  if (totalDocs > 3) {
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    throw ApiError.badRequest(`Task can have maximum 3 documents. Currently has ${task.documents.length}.`);
  }

  const newDocs = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
  }));

  task.documents.push(...newDocs);
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.status(200).json(new ApiResponse(200, 'Documents uploaded successfully', { task: populated }));
});

export const downloadDocument = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');

  const doc = task.documents.id(req.params.docId);
  if (!doc) throw ApiError.notFound('Document not found');

  const filePath = path.join(__dirname, '../../uploads', doc.filename);
  if (!fs.existsSync(filePath)) throw ApiError.notFound('File not found on server');

  res.download(filePath, doc.originalName);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete documents from this task');
  }

  const doc = task.documents.id(req.params.docId);
  if (!doc) throw ApiError.notFound('Document not found');

  const filePath = path.join(__dirname, '../../uploads', doc.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  doc.deleteOne();
  await task.save();

  res.status(200).json(new ApiResponse(200, 'Document deleted successfully'));
});
