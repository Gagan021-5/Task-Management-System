const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

let mongoServer;
let adminToken;
let userToken;
let adminUser;
let regularUser;

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '1d';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});

  // Create admin user
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });
  adminToken = adminRes.body.data.token;
  adminUser = adminRes.body.data.user;

  // Create regular user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User', email: 'user@test.com', password: 'password123' });
  userToken = userRes.body.data.token;
  regularUser = userRes.body.data.user;
});

describe('Task Endpoints', () => {
  const taskData = {
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'high',
    status: 'todo',
  };

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe(taskData.title);
      expect(res.body.data.task.createdBy._id).toBe(regularUser._id);
    });

    it('should not create task without auth', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(res.status).toBe(401);
    });

    it('should not create task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });

    it('should create task with assignedTo', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...taskData, assignedTo: adminUser._id });

      expect(res.status).toBe(201);
      expect(res.body.data.task.assignedTo._id).toBe(adminUser._id);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create several tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task 1', priority: 'high', status: 'todo' });
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task 2', priority: 'low', status: 'done' });
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Task', priority: 'medium', status: 'in-progress' });
    });

    it('should get all tasks for admin', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(3);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.tasks.forEach((task) => {
        expect(task.status).toBe('todo');
      });
    });

    it('should filter by priority', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.tasks.forEach((task) => {
        expect(task.priority).toBe('high');
      });
    });

    it('should search tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get task by id', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.task._id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update own task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title', status: 'in-progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Updated Title');
      expect(res.body.data.task.status).toBe('in-progress');
    });

    it('admin should update any task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Admin Updated');
    });

    it('should not allow non-owner to update', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData);
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete own task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });

    it('admin should delete any task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
