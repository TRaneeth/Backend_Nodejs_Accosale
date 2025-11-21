const express = require('express')
const postController = require('../controllers/postController')
const verifyToken = require('../middleware/verifyToken')

const router = express.Router()

router.post('/dopost',verifyToken,postController.doPost);

router.get('/uploads/:imageName',(req,res)=>{
    const imageName = req.params.imageName
    res.headersSent('Content-Type','image/jpeg')
    res.sendFile(path.join(__dirname, '..', 'uploads', imageName))
});

router.delete('/:postId',postController.deletePostbyId)

router.get('/my-posts', verifyToken, postController.getMyPosts);


module.exports = router;