import mongoose, { Types } from "mongoose"

const postschema = mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    image:String,
    description:{type:String,default:Date.now},
    tags:{type:[String],validate:[arr => arr.length <= 5],default:[]},
    videos:String,
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    comments: [{comment:String,nameofuser:String}],
    views:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}]
})

export const post = mongoose.model("post",postschema)