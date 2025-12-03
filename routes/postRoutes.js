// backend/routes/postRoutes.js
const express = require('express')
const postController = require('../controllers/postController')
const verifyToken = require('../middleware/verifyToken')
const path = require('path')

const router = express.Router()

router.post('/dopost', verifyToken, postController.doPost)

// serve uploaded images
router.get('/uploads/:imageName', (req, res) => {
  const imageName = req.params.imageName
  const filePath = path.join(__dirname, '..', 'uploads', imageName)
  res.sendFile(filePath)
})

// public
router.get('/all-posts', postController.getAllPosts)

// protected: get my posts
router.get('/my-posts', verifyToken, postController.getMyPosts)

// protected: update post (PUT) with multer handled inside controller export
router.put('/:postId', verifyToken, postController.updatePostById)

// protected: delete post
router.delete('/:postId', verifyToken, postController.deletePostbyId)

module.exports = router
