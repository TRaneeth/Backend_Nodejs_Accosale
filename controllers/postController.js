const Post = require('../models/Post')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
})
const upload = multer({ storage });

/**
 * Create post
 */
const doPost = async (req, res) => {
  try {
    const { type, id, category, selectedCategory, price, link, info } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Vendor not found" });

    const parsedCategory = category ? JSON.parse(category) : [];

    const post = new Post({
      type,
      id,
      category: parsedCategory,
      selectedCategory,
      price,
      link,
      image,
      info,
      user: user._id, // single id
    });

    const savedPost = await post.save();

    // push only post id to user's post array
    user.post.push(savedPost._id);
    await user.save();

    return res.status(200).json({ message: "posted successfully", post: savedPost });
  } catch (error) {
    console.error("❌ ERROR in doPost:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all posts (public)
 */
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Get posts for currently logged-in user
 */
const getMyPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("❌ ERROR in getMyPosts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update post by id (owner only). Accepts multipart/form-data (optional image)
 */
const updatePostById = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { type, id, category, selectedCategory, price, link, info } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Authorization: only owner can edit
    // post.user can be array or single id depending on your schema usage; handle both
    const ownerId = Array.isArray(post.user) ? String(post.user[0]) : String(post.user);
    if (String(req.userId) !== ownerId) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    // Apply changes
    if (type) post.type = type;
    if (id) post.id = id;
    if (category) {
      try {
        post.category = JSON.parse(category);
      } catch (e) {
        // fallback if category already array-like
        post.category = Array.isArray(category) ? category : [category];
      }
    }
    if (selectedCategory) post.selectedCategory = selectedCategory;
    if (price) post.price = price;
    if (link) post.link = link;
    if (info) post.info = info;

    if (image) {
      // delete old image file if exists
      if (post.image) {
        const oldPath = path.join(__dirname, '..', 'uploads', post.image);
        fs.unlink(oldPath, (err) => { if (err) console.warn('failed to delete old image', err); });
      }
      post.image = image;
    }

    post.updatedAt = Date.now();
    await post.save();

    return res.status(200).json({ message: "Post updated", post });
  } catch (error) {
    console.error("❌ ERROR in updatePostById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete post by id (owner only). Also removes reference from user's post array and deletes image file.
 */
const deletePostbyId = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'no post found' });

    // Authorization: only owner can delete
    const ownerId = Array.isArray(post.user) ? String(post.user[0]) : String(post.user);
    if (String(req.userId) !== ownerId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // delete image file if exists
    if (post.image) {
      const imgPath = path.join(__dirname, '..', 'uploads', post.image);
      fs.unlink(imgPath, (err) => { if (err) console.warn('failed to delete image', err); });
    }

    // remove post id from user's post array
    await User.findByIdAndUpdate(ownerId, { $pull: { post: post._id } });

    // remove post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  doPost: [upload.single('image'), doPost],
  deletePostbyId,
  getMyPosts,
  getAllPosts,
  updatePostById: [upload.single('image'), updatePostById]
}
