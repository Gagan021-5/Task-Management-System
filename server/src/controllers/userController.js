import User from '../models/User.js';
import Task from '../models/Task.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Users retrieved successfully', {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json(new ApiResponse(200, 'User retrieved successfully', { user }));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict('Email already in use');
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (password) user.password = password;

  await user.save();
  res.status(200).json(new ApiResponse(200, 'User updated successfully', { user }));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  await Task.deleteMany({ createdBy: user._id });
  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, 'User deleted successfully'));
});
