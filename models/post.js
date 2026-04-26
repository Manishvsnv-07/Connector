import mongoose, { Types } from "mongoose"

const postschema = mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    image:String,
    thumbnail:String,
    description:{type:String,default:Date.now,maxlength:1500},
    tags:{type:[String],validate:[arr => arr.length <= 5],default:[]},
    videos:String,
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    comments: [{comment:String,nameofuser:String,user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},replies:[{replier:String,reply:String}]}],
    sol:[{amount:String,sender:String,senderId:{type:mongoose.Schema.Types.ObjectId,ref:"user"}}],
    views:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}],
    nftMint:{
        type:String,
        default:null
    },
    nftMetaDataUri:{
        type:String,
        default:null
    },
    isNftMint:{
        type:Boolean,
        default:false
    }
})

export const post = mongoose.model("post",postschema)