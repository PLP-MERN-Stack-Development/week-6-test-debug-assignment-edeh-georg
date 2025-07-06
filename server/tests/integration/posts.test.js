// posts.test.js - Integration tests for posts API endpoints
import request from 'supertest';
import app from '../../src/app'
import { generateToken } from '../../src/lib/utils.js';


let token;
let userId;
let postId;


describe('POST /api/posts', () => {
  it('should create a new post when authenticated', async () => {
    const newPost = {
      title: 'New Test Post',
      content: 'This is a new test post content',
      author: userId,
      category: "technology"
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(newPost.title);
    expect(res.body.content).toBe(newPost.content);
    expect(res.body.author).toBe(userId.toString());
  });

  it('should return 401 if not authenticated', async () => {
    const newPost = {
      title: 'Unauthorized Post',
      content: 'This should not be created',
      category: Types.ObjectId().toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .send(newPost);

    expect(res.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    const invalidPost = {
      // Missing title
      content: 'This post is missing a title',
      category: Types.ObjectId().toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidPost);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// describe('GET /api/posts', () => {
//   it('should return all posts', async () => {
//     const res = await request(app).get('/api/posts');

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBeTruthy();
//     expect(res.body.length).toBeGreaterThan(0);
//   });

//   it('should filter posts by category', async () => {
//     const categoryId = Types.ObjectId().toString();
    
//     // Create a post with specific category
//     await create({
//       title: 'Filtered Post',
//       content: 'This post should be filtered by category',
//       author: userId,
//       category: categoryId,
//       slug: 'filtered-post',
//     });

//     const res = await request(app)
//       .get(`/api/posts?category=${categoryId}`);

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBeTruthy();
//     expect(res.body.length).toBeGreaterThan(0);
//     expect(res.body[0].category).toBe(categoryId);
//   });

//   it('should paginate results', async () => {
//     // Create multiple posts
//     const posts = [];
//     for (let i = 0; i < 15; i++) {
//       posts.push({
//         title: `Pagination Post ${i}`,
//         content: `Content for pagination test ${i}`,
//         author: userId,
//         category: Types.ObjectId(),
//         slug: `pagination-post-${i}`,
//       });
//     }
//     await insertMany(posts);

//     const page1 = await request(app)
//       .get('/api/posts?page=1&limit=10');
    
//     const page2 = await request(app)
//       .get('/api/posts?page=2&limit=10');

//     expect(page1.status).toBe(200);
//     expect(page2.status).toBe(200);
//     expect(page1.body.length).toBe(10);
//     expect(page2.body.length).toBeGreaterThan(0);
//     expect(page1.body[0]._id).not.toBe(page2.body[0]._id);
//   });
// });

// describe('GET /api/posts/:id', () => {
//   it('should return a post by ID', async () => {
//     const res = await request(app)
//       .get(`/api/posts/${postId}`);

//     expect(res.status).toBe(200);
//     expect(res.body._id).toBe(postId.toString());
//     expect(res.body.title).toBe('Test Post');
//   });

//   it('should return 404 for non-existent post', async () => {
//     const nonExistentId = Types.ObjectId();
//     const res = await request(app)
//       .get(`/api/posts/${nonExistentId}`);

//     expect(res.status).toBe(404);
//   });
// });

// describe('PUT /api/posts/:id', () => {
//   it('should update a post when authenticated as author', async () => {
//     const updates = {
//       title: 'Updated Test Post',
//       content: 'This content has been updated',
//     };

//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send(updates);

//     expect(res.status).toBe(200);
//     expect(res.body.title).toBe(updates.title);
//     expect(res.body.content).toBe(updates.content);
//   });

//   it('should return 401 if not authenticated', async () => {
//     const updates = {
//       title: 'Unauthorized Update',
//     };

//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .send(updates);

//     expect(res.status).toBe(401);
//   });

//   it('should return 403 if not the author', async () => {
//     // Create another user
//     const anotherUser = await _create({
//       username: 'anotheruser',
//       email: 'another@example.com',
//       password: 'password123',
//     });
//     const anotherToken = generateToken(anotherUser);

//     const updates = {
//       title: 'Forbidden Update',
//     };

//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${anotherToken}`)
//       .send(updates);

//     expect(res.status).toBe(403);
//   });
// });

// describe('DELETE /api/posts/:id', () => {
//   it('should delete a post when authenticated as author', async () => {
//     const res = await request(app)
//       .delete(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
    
//     // Verify post is deleted
//     const deletedPost = await findById(postId);
//     expect(deletedPost).toBeNull();
//   });

//   it('should return 401 if not authenticated', async () => {
//     const res = await request(app)
//       .delete(`/api/posts/${postId}`);

//     expect(res.status).toBe(401);
//   });
// }); 