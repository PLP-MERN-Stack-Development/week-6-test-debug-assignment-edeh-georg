// posts.test.js - Integration tests for posts API endpoints
import dotenv from 'dotenv';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../../src/app';
import User from '../../src/models/user.model.js';
import Post from '../../src/models/post.model.js';
import { generateToken } from '../../src/lib/utils.js';

let userId;
let token;
let testUser;
dotenv.config();

beforeAll(async () => {
  // Connect to test database (fixed connection string)
  await mongoose.connect("mongodb://localhost:27017/test");

  // Clean up any existing test data first
  await User.deleteMany({});
  await Post.deleteMany({});

  // Create test user
  testUser = await User.create({
    fullName: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  });

  userId = testUser._id;
  token = generateToken(userId);
});

afterAll(async () => {
  // Clean up all test data
  await Post.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clean up posts before each test (keep user)
  await Post.deleteMany({});
});

describe('POST /api/posts', () => {
  it('should create a new post when authenticated', async () => {
    const newPost = {
      title: 'New Test Post',
      content: 'This is a new test post content',
      author: userId,
      category: "technology"
    };

    const res = await request(app)
      .post('/api/message/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(newPost.title);
    expect(res.body.content).toBe(newPost.content);
    expect(res.body.author.toString()).toBe(userId.toString());
  });

  it('should return 401 if not authenticated', async () => {
    const newPost = {
      title: 'Unauthorized Post',
      content: 'This should not be created',
      category: 'technology',
    };

    const res = await request(app)
      .post('/api/message/posts')
      .send(newPost);

    expect(res.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    const invalidPost = {
      // Missing title
      content: 'This post is missing a title',
      category: 'technology',
    };

    const res = await request(app)
      .post('/api/message/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidPost);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/posts', () => {
  let postId;

  beforeEach(async () => {
    // Create a test post for GET tests
    const post = await Post.create({
      title: 'Test Post',
      content: 'This is a test post content',
      author: userId,
      category: 'technology',
      slug: 'test-post',
    });
    postId = post._id;
  });

  it('should return all posts', async () => {
    const res = await request(app)
      .get('/api/message/user-posts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should filter posts by category', async () => {
    // Create a post with specific category
    await Post.create({
      title: 'Filtered Post',
      content: 'This post should be filtered by category',
      author: userId,
      category: 'technology',
      slug: 'filtered-post',
    });

    const res = await request(app)
      .get('/api/message/user-posts?category=technology')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].category).toBe('technology');
  });

  it('should paginate results', async () => {
    // Create multiple posts efficiently
    const posts = Array.from({ length: 15 }, (_, i) => ({
      title: `Pagination Post ${i}`,
      content: `Content for pagination test ${i}`,
      author: userId,
      category: 'technology',
      slug: `pagination-post-${i}`,
    }));

    await Post.insertMany(posts);

    const [page1, page2] = await Promise.all([
      request(app)
        .get('/api/message/user-posts?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`),
      request(app)
        .get('/api/message/user-posts?page=2&limit=10')
        .set('Authorization', `Bearer ${token}`),
    ]);

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.length).toBe(10);
    expect(page2.body.length).toBeGreaterThan(0);
    expect(page1.body[0]._id).not.toBe(page2.body[0]._id);
  });
});

describe('GET /api/posts/:id', () => {
  let postId;

  beforeEach(async () => {
    const post = await Post.create({
      title: 'Test Post',
      content: 'This is a test post content',
      author: userId,
      category: 'technology',
      slug: 'test-post',
    });
    postId = post._id;
  });

  it('should return a post by ID', async () => {
    const res = await request(app)
      .get(`/api/message/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(postId.toString());
    expect(res.body.title).toBe('Test Post');
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = new Types.ObjectId();
    const res = await request(app)
      .get(`/api/message/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    console.log('RESPONSE STATUS', res, 'TOKEN', token);
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid ObjectId', async () => {
    const res = await request(app)
      .get('/api/message/posts/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/posts/:id', () => {
  let postId;

  beforeEach(async () => {
    const post = await Post.create({
      title: 'Test Post',
      content: 'This is a test post content',
      author: userId,
      category: 'technology',
      slug: 'test-post',
    });
    postId = post._id;
  });

  it('should update a post when authenticated as author', async () => {
    const updates = {
      title: 'Updated Test Post',
      content: 'This content has been updated',
    };

    const res = await request(app)
      .put(`/api/message/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.content).toBe(updates.content);
  });

  it('should return 401 if not authenticated', async () => {
    const updates = {
      title: 'Unauthorized Update',
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .send(updates);

    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user with unique email
    const anotherUser = await User.create({
      fullName: 'Another User',
      username: 'anotheruser',
      email: `another-${Date.now()}@example.com`,
      password: 'password123',
    });
    const anotherToken = generateToken(anotherUser);

    const updates = {
      title: 'Forbidden Update',
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send(updates);

    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = new Types.ObjectId();
    const updates = {
      title: 'Update Non-existent Post',
    };

    const res = await request(app)
      .put(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation errors', async () => {
    const invalidUpdates = {
      title: '', // Empty title should fail validation
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(invalidUpdates);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /api/posts/:id', () => {
  let postId;

  beforeEach(async () => {
    const post = await Post.create({
      title: 'Test Post',
      content: 'This is a test post content',
      author: userId,
      category: 'technology',
      slug: 'test-post',
    });
    postId = post._id;
  });

  it('should delete a post when authenticated as author', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Verify post is deleted
    const deletedPost = await Post.findById(postId);
    expect(deletedPost).toBeNull();
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`);

    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user with unique email
    const anotherUser = await User.create({
      fullName: 'Another User',
      username: `anotheruser-${Date.now()}`,
      email: `another-delete-${Date.now()}@example.com`,
      password: 'password123',
    });
    const anotherToken = generateToken(anotherUser);

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = new Types.ObjectId();
    const res = await request(app)
      .delete(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid ObjectId', async () => {
    const res = await request(app)
      .delete('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});