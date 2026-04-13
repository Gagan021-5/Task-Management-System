const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;

  const task = await Task.create(req.body);
  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('task:created', populated);
  }

  res.status(201).json(
    new ApiResponse(201, 'Task created successfully', { task: populated })
  );
});

/**
 * @desc    Get all tasks (with filtering, sorting, pagination)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  // Date range filter
  if (req.query.dueBefore || req.query.dueAfter) {
    filter.dueDate = {};
    if (req.query.dueBefore) filter.dueDate.$lte = new Date(req.query.dueBefore);
    if (req.query.dueAfter) filter.dueDate.$gte = new Date(req.query.dueAfter);
  }

  // Search in title and description
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Non-admin users see only their own tasks or tasks assigned to them
  if (req.user.role !== 'admin') {
    filter.$or = filter.$or || [];
    const userFilter = [
      { createdBy: req.user._id },
      { assignedTo: req.user._id },
    ];
    if (filter.$or.length > 0) {
      // Combine search with user filter using $and
      filter.$and = [
        { $or: filter.$or },
        { $or: userFilter },
      ];
      delete filter.$or;
    } else {
      filter.$or = userFilter;
    }
  }

  // Build sort
  const sortField = req.query.sort || 'createdAt';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Tasks retrieved successfully', {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  );
});

/**
 * @desc    Get task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Non-admin users can only see their own tasks or tasks assigned to them
  if (
    req.user.role !== 'admin' &&
    task.createdBy._id.toString() !== req.user._id.toString() &&
    (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('Not authorized to view this task');
  }

  res.status(200).json(
    new ApiResponse(200, 'Task retrieved successfully', { task })
  );
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private (Owner/Admin)
 */
const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this task');
  }

  const previousStatus = task.status;

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  // Emit socket events
  const io = req.app.get('io');
  if (io) {
    io.emit('task:updated', task);
    if (req.body.status && req.body.status !== previousStatus) {
      io.emit('task:statusChanged', { taskId: task._id, status: task.status });
    }
  }

  res.status(200).json(
    new ApiResponse(200, 'Task updated successfully', { task })
  );
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Owner/Admin)
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this task');
  }

  // Delete associated files
  if (task.documents && task.documents.length > 0) {
    task.documents.forEach((doc) => {
      const filePath = path.join(__dirname, '../../uploads', doc.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  await task.deleteOne();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('task:deleted', req.params.id);
  }

  res.status(200).json(
    new ApiResponse(200, 'Task deleted successfully')
  );
});

/**
 * @desc    Upload documents to a task
 * @route   POST /api/tasks/:id/documents
 * @access  Private (Owner/Admin)
 */
const uploadDocuments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to upload documents to this task');
  }

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }

  // Check total document count
  const totalDocs = task.documents.length + req.files.length;
  if (totalDocs > 3) {
    // Clean up uploaded files
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
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

  res.status(200).json(
    new ApiResponse(200, 'Documents uploaded successfully', { task: populated })
  );
});

/**
 * @desc    Download a document
 * @route   GET /api/tasks/:id/documents/:docId
 * @access  Private
 */
const downloadDocument = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  const doc = task.documents.id(req.params.docId);
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  const filePath = path.join(__dirname, '../../uploads', doc.filename);
  if (!fs.existsSync(filePath)) {
    throw ApiError.notFound('File not found on server');
  }

  res.download(filePath, doc.originalName);
});

/**
 * @desc    Delete a document
 * @route   DELETE /api/tasks/:id/documents/:docId
 * @access  Private (Owner/Admin)
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete documents from this task');
  }

  const doc = task.documents.id(req.params.docId);
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  // Delete file from disk
  const filePath = path.join(__dirname, '../../uploads', doc.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  doc.deleteOne();
  await task.save();

  res.status(200).json(
    new ApiResponse(200, 'Document deleted successfully')
  );
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  uploadDocuments,
  downloadDocument,
  deleteDocument,
};
