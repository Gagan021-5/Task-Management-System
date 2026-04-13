const User = require('../models/User');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users (paginated, filterable)
 * @route   GET /api/users
 * @access  Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter
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
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'User retrieved successfully', { user })
  );
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Check email uniqueness if changed
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('Email already in use');
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (password) user.password = password;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'User updated successfully', { user })
  );
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  // Remove user's tasks or reassign them
  await Task.deleteMany({ createdBy: user._id });
  await user.deleteOne();

  res.status(200).json(
    new ApiResponse(200, 'User deleted successfully')
  );
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
