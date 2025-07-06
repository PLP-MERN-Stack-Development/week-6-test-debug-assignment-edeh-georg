import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { generateToken } from './server/src/lib/utils.js'
import { create } from './server/src/models/post.model.js';
import { _create } from './server/src/models/user.model.js'; 
import dotenv from 'dotenv';

dotenv.config();


let mongoServer;
let userId;
let token;
let postId;

// Setup in-memory MongoDB server before all tests

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a test user
    const user = await _create({
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    });
    userId = user._id;
    token = generateToken(user);

    // Create a test post
    const post = await create({
        title: 'Test Post',
        content: 'This is a test post content',
        author: userId,
        slug: 'test-post',
    });
    postId = post._id;
});

afterAll(async () => {
    await mongoose.disconnect(); 
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections; 
    for (const key in collections) {
        const collection = collections[key];
        if (collection.collectionName !== 'users' && collection.collectionName !== 'posts') {
            await collection.deleteMany({});
        }
    }
});
