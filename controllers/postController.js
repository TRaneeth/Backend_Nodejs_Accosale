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

const doPost = async(req,res)=>{
    try {
        const {type,id,category,price,link,info} = req.body
        const image = req.file? req.file.filename:undefined;
        const user = await User.findById(req.userId)
        if(!user){
            res.status(404).json({message:'Vender not found'})
        }
        const post = new Post({
            type,id,category,price,link,image,info,user:user._id
        })
    
        const savedPost = await post.save()
        user.post.push(savedPost)
        await user.save()

        return res.status(200).json({message:'posted successfully'})
    } catch (error) {
        console.error(error)
        res.status(500).json({message:'Internal server error'})
    }
}

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

module.exports = {doPost: [upload.single('image'),doPost],deletePostbyId}