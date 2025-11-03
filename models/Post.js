const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    type:{
        type:String,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    category:{
        type:[
            {
                type:String,
                enum:['followers','subscribers','level']
            }
        ]
    },
    selectedCategory:{
        type:String,
        required:true
    }
    ,
    price:{
        type:String,
        required:true
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