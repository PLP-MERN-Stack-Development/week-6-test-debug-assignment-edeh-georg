import mongoose from 'mongoose';
import slugify from 'slugify';

// title author content category slug

const BLOG_CATEGORIES = {
    TECHNOLOGY: 'technology',
    LIFESTYLE: 'lifestyle',
    TRAVEL: 'travel',
    FOOD: 'food',
    HEALTH: 'health',
    BUSINESS: 'business',
    EDUCATION: 'education',
    ENTERTAINMENT: 'entertainment'
  };

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: Object.values(BLOG_CATEGORIES),
            required: [true, 'Category is required'],
            default: BLOG_CATEGORIES.LIFESTYLE
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

postSchema.pre('save', async function (next){
    const baseSlug = slugify(this.title, { lower: true });
    let uniqueSlug = baseSlug;
    let count = 1;

    while (await this.constructor.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
    }

    this.slug = uniqueSlug;

    next();
});

const Post = mongoose.model("Post", postSchema);


export const create = async (data) => {
    const document = new Post(data);
    await document.validate();
    const savedDocument = await document.save();
    return savedDocument;
  };


export default Post;