import dotenv, { populate } from "dotenv"
dotenv.config();
import express from "express"
import islogged from "../middlewares/islogged.js";
import { NftUpload } from "../config/cloudinary.js"
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import nacl from "tweetnacl"
import bs58 from "bs58"
import pinataSDK from "@pinata/sdk";
import { post } from "../models/post.js";
import { user } from "../models/user.js";
import { notify } from "../models/notification.js"
import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    Keypair
} from '@solana/web3.js';
const router = express.Router()

// -------------------------- Connect Phantom Account -----------------------------------

router.post("/profile/Connectphantom", islogged, async (req, res) => {
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


router.get("/auth/message", (req, res) => {
    const message = `Let's Connect With Connector ✅| Creators And Users First 😊`;
    res.json({ message })
})

router.get("/profile/Disconnectphantom", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
    userdata.walletAddress = undefined;
    await userdata.save()
    res.redirect("/profile")
})

// -------------------------- MINT POST AS A NFT ------------------------------------- 

const pinata = new pinataSDK(
    process.env.PINATA_KEY,
    process.env.PINATA_SECRET
)

router.post("/nft/mint",islogged, NftUpload.single("media"), async (req, res) => {
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
        console.log("result : ",result)
        const metaDataUri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;   
        const connection = new Connection(
            clusterApiUrl("devnet"), "confirmed"
        )
        
        const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
        const serverKeypair = Keypair.fromSecretKey(secretKey);
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
        console.log("nftmint error:", error) 
        res.status(500).json({ success: false, error: error.message })
    }
})

// -------------------------- Send Sol From One Account To Another --------------------------------


router.post("/sendSol", islogged, async (req, res) => {
    try {
        const { selectedAmount, toWalletAddress, postid } = req.body;
        let findpost = await post.findById(postid)
        let finduser = await user.findOne({ email: req.datahere.email })
        if (findpost.user.toString() !== finduser._id.toString()) {
            await notify.create({
                to: findpost.user,
                from: finduser._id,
                type: "sol",
                sol:selectedAmount,
                postid: findpost._id
            })
        }

        findpost.sol.push({ amount: selectedAmount, sender: finduser.username ,senderId:finduser._id})
        await findpost.save()
        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false })
    }

})

export default router;