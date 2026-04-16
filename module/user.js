import mongoose from "mongoose"
mongoose.connect("mongodb://localhost:27017/Animetube")
const userschema = mongoose.Schema({
    email: { type: String, required: [true, "Needed"] },
    name: { type: String, required: [true, "Needed"] },
    username: {
        type: String, required: [true, "Needed"], 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { type: String, required: [true, "Needed"] },
    bio: { type: String, default: "I Am Villain." },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    follower: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    image: { type: String },
    interestedTags: { type: [String], default: [] },
    walletAddress: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now }
})

export const user = mongoose.model("user", userschema)