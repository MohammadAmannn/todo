/**
 * BACKEND SERVER (Node.js + Express + MongoDB)
 * npm install express mongoose bcryptjs jsonwebtoken cors dotenv
 */

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const { connect, Schema, model } = mongoose;
const { hash, compare } = bcrypt;
const { sign, verify } = jwt;

// --------------------------------------------------
// ENV VALIDATION
// --------------------------------------------------
if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing');

// --------------------------------------------------
// MONGODB CONNECTION
// --------------------------------------------------
connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

// --------------------------------------------------
// SCHEMAS
// --------------------------------------------------
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: String,
    category: { type: String, enum: ['Urgent', 'Non-Urgent'] },
    completed: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const User = model('User', UserSchema);
const Todo = model('Todo', TodoSchema);

// --------------------------------------------------
// 🔑 NORMALIZE MONGODB ID → FRONTEND id
// --------------------------------------------------
const normalizeId = (doc) => {
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// --------------------------------------------------
// AUTH MIDDLEWARE
// --------------------------------------------------
const auth = (req, res, next) => {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  try {
    const token = header.replace('Bearer ', '');
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    res.status(401).send({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Admin access only' });
  }
  next();
};

// --------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await hash(password, 10);
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed
    });

    const token = sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET
    );

    const userObj = normalizeId(user);
    delete userObj.password;

    res.status(201).send({ user: userObj, token });
  } catch {
    res.status(400).send({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { credential, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: credential }, { username: credential }]
    });

    if (!user || !(await compare(password, user.password))) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET
    );

    const userObj = normalizeId(user);
    delete userObj.password;

    res.send({ user: userObj, token });
  } catch {
    res.status(500).send({ message: 'Server error' });
  }
});

// --------------------------------------------------
// TODO ROUTES (ADMIN CAN EDIT & DELETE ANY)
// --------------------------------------------------

// User → own todos
app.get('/api/todos', auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.user.id });
  res.send(todos.map(normalizeId));
});

// Admin → all todos
app.get('/api/todos/admin/all', auth, adminOnly, async (req, res) => {
  const todos = await Todo.find().populate('userId', 'username');

  res.send(
    todos.map(t => ({
      ...normalizeId(t),
      userName: t.userId?.username || 'System',
      userId: t.userId?._id.toString()
    }))
  );
});

// Create todo
app.post('/api/todos', auth, async (req, res) => {
  const todo = await Todo.create({
    ...req.body,
    userId: req.user.id
  });

  res.status(201).send(normalizeId(todo));
});

// Edit todo (user → own, admin → any)
app.patch('/api/todos/:id', auth, async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

  const todo = await Todo.findOneAndUpdate(filter, req.body, { new: true });
  if (!todo) {
    return res.status(404).send({ message: 'Not found or unauthorized' });
  }

  res.send(normalizeId(todo));
});

// Delete todo (user → own, admin → any)
app.delete('/api/todos/:id', auth, async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

  const todo = await Todo.findOneAndDelete(filter);
  if (!todo) {
    return res.status(404).send({ message: 'Not found or unauthorized' });
  }

  res.send({ message: 'Deleted', id: todo._id.toString() });
});

// --------------------------------------------------
// ADMIN ROUTES
// --------------------------------------------------
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  const users = await User.find({}, '-password');
  res.send(users.map(normalizeId));
});

app.patch('/api/admin/users/:id/role', auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );

  res.send(normalizeId(user));
});

// --------------------------------------------------
// SERVER START
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
