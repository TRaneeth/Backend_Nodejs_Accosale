const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    type:{
        type:String,
        require:true
    },
    id:{
        type:String,
        require:true
    },
    category:{
        type:[
            {
                type:String,
                enum:['followers','subscribers','level']
            }
        ]
    },
    price:{
        type:String,
        require:true
    },
    link:{
        type:String,
    },
    image:{
        type:String
    },
    info:{
        type:String,
    },
    user:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ]
})
const Post = mongoose.model('Post',postSchema)
module.exports = Post