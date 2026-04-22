import dotenv, { populate } from "dotenv"
dotenv.config();
import express from "express"
import { user } from "./module/user.js"
import { post } from "./module/post.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import parser from "cookie-parser"
import multer from "multer"
import flash from "connect-flash"
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";
import nacl from "tweetnacl"
import bs58 from "bs58"
import mongoose from "mongoose";
import nodemailer from "nodemailer"
import pinataSDK from "@pinata/sdk";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    Keypair
} from '@solana/web3.js';

cloudinary.config({
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRETKEY,
    cloud_name: process.env.CLOUDINARY_NAME
})

const uploadToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        let resource = mimetype.startsWith("video/") ? "video" : "image";
        const stream = cloudinary.uploader.upload_stream({ resource_type: resource, folder: "postnow" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
        );
        stream.end(buffer);
    });
};

const uploaddpToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: "postnow" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
        );
        stream.end(buffer);
    });
};

const app = express()
const port = 57911

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(parser())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}))
app.use(flash())
app.get("/", (req, res) => {
    if (req.cookies.token) {
        res.redirect("/profile")
    }
    else {
        let error = req.flash("error")
        res.render("index", { error });
    }
})

app.get("/create", (req, res) => {
    let exists = req.flash("exists")
    let Infoerror = req.flash("Infoerror")
    res.render("create", { exists, Infoerror })
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS
    }
})

app.post("/sendotp", async (req, res) => {
    try {
        const { name, username, password, email } = req.body;
        const emailExists = await user.findOne({ email });
        if (emailExists) return res.status(400).json({ message: "Email already registered" });

        const usernameExists = await user.findOne({ username });
        if (usernameExists) return res.status(400).json({ message: "Username already taken" });

        if (!email || !username || !name || !password) {
            return res.status(400).json({ message: "Please Fill All Data" })
        }
        const usernameregex = /^[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/
        if (!usernameregex.test(username)) {
            return res.status(400).json({ message: "Invalid Username Syntax" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        req.session.otpdata = {
            name,
            username,
            password,
            email,
            otp,
            expiry: Date.now() + 2 * 60 * 1000
        };
        const mailsend = {
            from: process.env.EMAIL_NAME,
            to: email,
            subject: "Verify Connector Account",
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:white;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:21px;padding:40px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h2 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">Connector - Verify Your Account</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <p style="color:#a1a1aa;margin:0;font-size:14px;">Use the code below to verify your email address</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 0;">
              <table cellpadding="0" cellspacing="0" style="border:1px solid #4d4d54;border-radius:12px;padding:24px 48px;">
                <tr>
                  <td align="center">
                    <h1 style="color:#ffffff;margin:0;font-size:42px;font-weight:700;letter-spacing:10px;">${otp}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:16px;">
              <p style="color:#71717a;margin:0;font-size:13px;">This code expires in <span style="color:#ffffff;">2 minutes</span></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;border-top:1px solid #27272a;margin-top:32px;">
              <p style="color:#52525b;margin:0;font-size:12px;">If you didn't request this, ignore this email.</p>
              <p style="color:#52525b;margin:4px 0 0;font-size:12px;">© 2026 Connector</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
        }
        await transporter.sendMail(mailsend)
        res.json({ message: "Otp Send Successfully" });
    } catch (error) {
        res.json({ message: "problem!!!" });
    }
})


app.post("/create/account", async (req, res) => {
    try {
        const { otp } = req.body;
        const sessionData = req.session.otpdata;
        if (!sessionData) {
            return res.status(400).json({ message: "Session expired, resend OTP" });
        }
        if (Date.now() > sessionData.expiry) {
            delete req.session.otpdata;
            return res.status(400).json({ message: "OTP expired, resend OTP" });
        }
        if (otp.toString() !== sessionData.otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        let hash = await bcrypt.hash(sessionData.password, 10)
        const createuser = new user({
            email: sessionData.email,
            name: sessionData.name,
            username: sessionData.username,
            password: hash,
            image: "/images/default.png",
        })
        await createuser.save()
        let token = jwt.sign({ email: sessionData.email, id: createuser._id }, process.env.JWT_KEY, { expiresIn: "7d" })
        res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict", secure: false })
        res.json({ message: "Account created" });
    } catch (error) {
        res.json({ message: "Account not created" });
    }

})

app.get("/profile", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email }).populate("posts")
    res.render("profile", { userdata })
})

app.get('/image/:id', async (req, res) => {
    const postData = await post.findById(req.params.id);
    res.send(postData.image);
});

app.get("/home", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
    const userd = await user.findById(userdata._id);
    const interestedTags = userdata.interestedTags;
    const alluserspost = await post.aggregate([
        {
            $addFields: {
                matchScore: {
                    $size: {
                        $ifNull: [
                            { $setIntersection: ["$tags", interestedTags] }, // variable use karo
                            []
                        ]
                    }
                }
            }
        },

        { $sort: { matchScore: -1, createdAt: -1 } },

        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ]);
    res.render("home", { alluserspost, userdata });
})
app.get("/post", islogged, async (req, res) => {
    let success = req.flash("success")
    let error = req.flash("error")
    let undefined = req.flash("Undefined")
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("upload", { success, error, userdata, undefined });
})

app.get("/Vclips", islogged, async (req, res) => {
    let alluserspost = await post.find().populate("user").then(posts => posts.filter(post => post.user !== null));
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("vclips.ejs", { alluserspost, userdata });
})

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        // allowed types
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "video/mp4", "video/mkv"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // accept file
        } else {
            cb(new Error("Only images and videos are allowed"), false); // reject
        }
    }
});

const uploadfield = upload.fields([
    { name: "media", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
])
app.post("/post", uploadfield, islogged, async (req, res) => {
    try {

        const mediaFile = req.files["media"]?.[0]
        const ThumbnailFile = req.files["thumbnail"]?.[0]
        if (!mediaFile) {
            return res.status(400).json({ message: "Select Post First" })
        }

        const result = await uploadToCloudinary(mediaFile.buffer, mediaFile.mimetype)
        const result_thumb = ThumbnailFile ? await uploadToCloudinary(ThumbnailFile.buffer, ThumbnailFile.mimetype) : null;
        const isimage = mediaFile.mimetype.startsWith("image/");
        const isvideo = mediaFile.mimetype.startsWith("video/");
        const isthumbnail = ThumbnailFile?.mimetype.startsWith("image/") ?? false;
        const { description } = req.body;
        const isMintNft = req.body.isMintNft === "true"
        console.log(req.body.tgs);

        let userdata = await user.findOne({ email: req.datahere.email })
        const postcreate = new post({
            user: userdata._id,
            description,
            tags: JSON.parse(req.body.tgs || '[]'),
            image: isimage ? result.secure_url : "",
            videos: isvideo ? result.secure_url : "",
            thumbnail: isthumbnail ? result_thumb.secure_url : "",
            nftMint: null,
            nftMetaDataUri: null,
            isNftMint: false
        })
        await postcreate.save()
        userdata.posts.push(postcreate._id)
        await userdata.save()

        if (isMintNft) {
            return res.json({
                post: {
                    _id: postcreate._id,
                    description: postcreate.description,
                    imageUri: isimage ? result.secure_url : ""
                }
            })
        }

        return res.status(200).json({ success: "Post Successfully" })

    } catch (err) {
        return res.status(500).json({ message: "Post Failed" });
    }
})

const NftUpload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        // allowed types
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // accept file
        } else {
            cb(new Error("Videos Not Allowed As A Nft"), false); // reject
        }
    }
});


app.post("/nft/mint", NftUpload.single("media"), async (req, res) => {
    try {
        const { postid, postdescription, postimg, walletAddress } = req.body;
        const metadata = {
            name: "Connector Mint",
            description: postdescription || "Connector NFT Minting",
            image: postimg,
            attributes: [
                { trait_type: "Platform", value: "Connector" },
                { trait_type: "Post ID", value: postid }
            ]
        }
        const result = await pinata.pinJSONToIPFS(metadata)
        const metaDataUri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        const connection = new Connection(
            clusterApiUrl("devnet"), "confirmed"
        )

        const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
        const serverKeypair = Keypair.fromSecretKey(secretKey);
        console.log(serverKeypair.publicKey.toString());

        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(serverKeypair));

        const { nft } = await metaplex.nfts().create({
            uri: metaDataUri,
            name: "Connector NFT",
            sellerFeeBasisPoints: 500,
            tokenOwner: new PublicKey(walletAddress)
        })

        await post.findByIdAndUpdate(postid, {
            nftMint: nft.address.toString(),
            nftMetaDataUri: metaDataUri,
            isNftMint: true
        });

        res.status(200).json({ success: "NFT Mint Successfully" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

app.use((err, req, res, next) => {
    if (err.message === "Videos Not Allowed As A Nft") {
        return res.status(400).json({ success: false, message: "Video As A NFT Not Allowed ✕" })
    }
    next(err)
})

app.get("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/")
})
app.post("/logout", (req, res) => {
    res.redirect("/logout")
})

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        let finduser = await user.findOne({ username: req.body.username })
        if (finduser) {
            let checkpassword = await bcrypt.compare(req.body.password, finduser.password)
            if (checkpassword) {
                let token = jwt.sign({ email: finduser.email, id: finduser._id }, process.env.JWT_KEY, { expiresIn: "7d" })
                res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false, sameSite: "strict" })
                res.redirect("/home");
            }
            else {
                req.flash("error", "Email Or Password Is Wrong");
                res.redirect("/");
            }
        }
        else {
            req.flash("error", "Email Or Password Is Wrong");
            res.redirect("/")
        }
    } catch (error) {
        res.send("Something Went Wrong")
    }

})

function islogged(req, res, next) {
    if (!req.cookies.token) {
        return res.redirect("/")
    }
    if (req.cookies.token === "") {
        return res.redirect("/");
    }
    else {
        let verify = jwt.verify(req.cookies.token, process.env.JWT_KEY)
        req.datahere = verify;
        next()
    }
}


app.post("/follow/:followeduserid", islogged, async (req, res) => {
    let mydata = await user.findOne({ email: req.datahere.email })
    let otheruserdata = await user.findOne({ _id: req.params.followeduserid });
    if (otheruserdata.follower.includes(mydata._id)) {
        await user.updateOne({ _id: otheruserdata._id }, { $pull: { follower: mydata._id } })
        await user.updateOne({ _id: mydata._id }, { $pull: { following: otheruserdata._id } })
        return res.json({ following: false })
    }
    otheruserdata.follower.push(mydata._id);
    mydata.following.push(otheruserdata._id)
    await otheruserdata.save()
    await mydata.save()
    return res.json({ following: true })
})

app.post("/update", upload.single("dp"), islogged, async (req, res) => {
    let userdata = await user.findOne({ username: req.datahere.username })
    const { updescription, upname, upusername } = req.body;
    let updatedata = {};
    if (req.body.upname) {
        updatedata.name = upname;
    }
    if (req.body.updescription) {
        updatedata.bio = updescription;
    }
    if (req.body.upusername) {
        updatedata.username = upusername;
    }
    let image_url = null
    if (req.file) {
        const result = await uploaddpToCloudinary(req.file.buffer)
        image_url = result.secure_url;
    }
    else {
        image_url = "image/default.png"
    }
    if (req.file) {
        updatedata.image = image_url;
    }
    let update = await user.findOneAndUpdate(
        { email: req.datahere.email },
        updatedata,
        { new: true }
    )
    res.redirect("/profile")

})


app.get("/profiles/edit", islogged, async (req, res) => {
    let error = req.flash("error")
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("profileedit", { error, userdata })
})

app.get("/like/:likeid", islogged, async (req, res) => {
    try {
        let likepost = await post.findOne({ _id: req.params.likeid })
        let userlike = await user.findOne({ email: req.datahere.email })

        if (likepost.likes.indexOf(userlike._id) === -1) {
            likepost.likes.push(userlike._id)

            await user.findByIdAndUpdate(userlike._id, {
                $addToSet: { interestedTags: { $each: likepost.tags } }
            })
        }
        else {
            likepost.likes.splice(likepost.likes.indexOf(userlike._id), 1)
        }
        await likepost.save()
        res.json({ likes: likepost.likes.length })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

app.post("/send/:commentid", islogged, async (req, res) => {
    let commentpost = await post.findOne({ _id: req.params.commentid })
    
    if (req.body.comment) {
        commentpost.comments.push({ comment: req.body.comment, nameofuser: req.body.nameofuser,user:req.body.userid })
        await commentpost.save()
    }
    res.json({ comments: commentpost.comments.length })
})

app.post("/sendSol", islogged, async (req, res) => {
try {
    const { selectedAmount, toWalletAddress, postid } = req.body;
    console.log(selectedAmount,toWalletAddress,postid);
    
    let findpost = await post.findById(postid)
    let finduser = await user.findOne({ email: req.datahere.email })
    findpost.sol.push({ amount: selectedAmount, sender: finduser.username })
    await findpost.save()
    return res.status(200).json({success:true})
} catch (error) {
    return res.status(500).json({success:false})
}

})


app.get("/profile/viewpost/:postid", islogged, async (req, res) => {
    let myposts = await post.findOne({ _id: req.params.postid }).populate("user")
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("yourposts", { myposts, userdata })
})

app.get("/profile/deletepost/:postid", islogged, async (req, res) => {
    let userdata = await user.findOneAndUpdate({ email: req.datahere.email }, { $pull: { posts: req.params.postid } })
    let findpost = await post.findByIdAndDelete({ _id: req.params.postid })
    res.redirect("/profile")
})

app.post("/updatepost", async (req, res) => {
    try {
        let mypost = await post.findByIdAndUpdate(req.body.mypostid, { description: req.body.udescription })
        res.json({ success: true })
    } catch (error) {
        return res.json({ success: false })
    }
})

app.post("/profile/Connectphantom", islogged, async (req, res) => {
    try {
        const { publicKey, signature, message } = req.body;

        // 1. Verify signature
        const isValid = nacl.sign.detached.verify(
            new TextEncoder().encode(message),
            new Uint8Array(signature),
            bs58.decode(publicKey)
        );

        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid signature" });
        }

        // 2. Save wallet in DB
        let userdata = await user.findOne({ email: req.datahere.email });

        if (!userdata) {
            return res.status(404).json({ message: "User not found" });
        }

        userdata.walletAddress = publicKey;
        await userdata.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/auth/message", (req, res) => {
    const message = `Let's Connect With Our Platform At ${Date.now()}`;
    res.json({ message })
})

app.get("/profile/Disconnectphantom", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
    userdata.walletAddress = undefined;
    await userdata.save()
    res.redirect("/profile")
})


app.get("/home/:id", islogged, async (req, res) => {
    let userdata = await user.findOne({ _id: req.params.id }).populate("posts")
    let mydata = await user.findOne({ email: req.datahere.email })
    if (req.params.id == mydata._id) {
        return res.redirect("/profile")
    }
    res.render("otheruserprofile.ejs", { userdata })
})


app.get("/Search", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })

    res.render("search", { userdata })
})
app.get("/search/user", async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === "") {
        return res.json([])
    }

    const finduser = await user.find({
        username: { $regex: new RegExp(query, 'i') }
    }).select('username image _id').limit(8)

    res.json(finduser)
})

app.get("/Search/:id", islogged, async (req, res) => {
    let userdata = await user.findOne({ _id: req.params.id }).populate("posts")
    let mydata = await user.findOne({ email: req.datahere.email })
    if (userdata._id.toString() === mydata._id.toString()) {
        return res.redirect("/profile")
    }
    res.render("searcheduser", { userdata })
})

app.post("/view/:postid", islogged, async (req, res) => {
    let p = await post.findOne({ _id: req.params.postid })
    if (!p) {
        return res.status(404).json({ message: "User Not Found" })
    }
    let userdata = await user.findOne({ email: req.datahere.email })
    if (!p.views.includes(userdata._id.toString())) {
        p.views.push(userdata._id)
        await p.save()
    }
    res.json({ success: true })
})

app.get("/mobilestart", (req, res) => {
    res.render("mobileindex")
})


const pinata = new pinataSDK(
    process.env.PINATA_KEY,
    process.env.PINATA_SECRET
)

app.get("/Notify",islogged,async (req,res)=>{
    let wholiked;
    let userdata = await user.findOne({email:req.datahere.email}).populate({
        path:"posts",
        populate:{
            path:"likes",
            model:"user",
            select:"username image"
        }
    })
    
    res.render("notify",{userdata})
})

app.listen(port, () => {
    console.log(`my port at ${port}`);
})