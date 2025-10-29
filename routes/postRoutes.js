const express = require('express')
const postController = require('../controllers/postController')
const verifyToken = require('../middleware/verifyToken')

const router = express.Router()

router.post('/dopost',verifyToken,postController.doPost);

router.get('/uploads/:imageName',(req,res)=>{
    const imageName = req.params.imageName
    res.headerssent('Content-Type','image/jpeg')
    res.sendFile(Path2D.join(__dirname, '..', 'uploads', imageName))
});

router.delete('/:postId',postController.deletePostbyId)

module.exports = router;