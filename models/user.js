import mongoose from "mongoose"
mongoose.connect("mongodb://localhost:27017/Animetube")
const userschema = mongoose.Schema({
    email: { type: String, required: [true, "Needed"],unique:true },
    name: { type: String, required: [true, "Needed"],maxlength:20},
    username: {
        type: String, required: [true, "Needed"], 
        unique: true,
        trim: true,
        lowercase: true,
        minlength:3,
        maxlength:20,
        match: /^[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/
    },
    password: { type: String, required: [true, "Needed"] },
    bio: { type: String, default: "Never Give Up ‖",maxlength:111},
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    follower: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    image: { type: String },
    interestedTags: { type: [String], default: [] },
    walletAddress: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now }
})

export const user = mongoose.model("user", userschema)