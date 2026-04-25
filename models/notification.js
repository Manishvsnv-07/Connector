import mongoose from "mongoose";

const Notifaction = mongoose.Schema({
    to:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    from:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    postid:{type:mongoose.Schema.Types.ObjectId,ref:"post"},
    type:{type:String,enum:["like","follow","sol","comment"]},
    sol:{type:String,default:null},
    isread:{type:Boolean,default:false}
},{ timestamps: true })

export const notify = new mongoose.model("notification",Notifaction)