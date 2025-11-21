const Post = require('../models/Post')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')

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

const deletePostbyId = async(req,res)=>{
    try {
        const postId = req.params.postId
        const deletedPost = await Post.findByIdAndDelete(postId)
        if(!deletedPost){
            return res.status(404).json({error:'no post found'})
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({message:'Internal server error'})
    }
}

module.exports = {doPost: [upload.single('image'),doPost],deletePostbyId,getMyPosts}