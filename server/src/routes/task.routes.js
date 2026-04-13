import { Router } from 'express';
import {
  createTask, getTasks, getTaskById, updateTask, deleteTask,
  uploadDocuments, downloadDocument, deleteDocument,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createTaskValidator, updateTaskValidator } from '../validators/task.validator.js';
import upload from '../middleware/upload.js';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in-progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               dueDate: { type: string, format: date }
 *               assignedTo: { type: string }
 *     responses:
 *       201: { description: Task created }
 */
router.post('/', protect, validate(createTaskValidator), createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks (filterable, sortable, paginated)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: priority, schema: { type: string } }
 *       - { in: query, name: sort, schema: { type: string } }
 *       - { in: query, name: order, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: Tasks retrieved }
 */
router.get('/', protect, getTasks);

/** @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Task retrieved }
 */
router.get('/:id', protect, getTaskById);

/** @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Task updated }
 */
router.put('/:id', protect, validate(updateTaskValidator), updateTask);

/** @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Task deleted }
 */
router.delete('/:id', protect, deleteTask);

/** @swagger
 * /api/tasks/{id}/documents:
 *   post:
 *     summary: Upload documents (max 3 PDFs, 5MB each)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Documents uploaded }
 */
router.post('/:id/documents', protect, upload.array('documents', 3), uploadDocuments);

/** @swagger
 * /api/tasks/{id}/documents/{docId}:
 *   get:
 *     summary: Download a document
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: File download }
 */
router.get('/:id/documents/:docId', protect, downloadDocument);

/** @swagger
 * /api/tasks/{id}/documents/{docId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Document deleted }
 */
router.delete('/:id/documents/:docId', protect, deleteDocument);

export default router;
