import dotenv from "dotenv"
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import multer from "multer"

cloudinary.config({
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRETKEY,
    cloud_name: process.env.CLOUDINARY_NAME
})

export const uploaddpToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: "postnow" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
        );
        stream.end(buffer);
    });
};

export const uploadToCloudinary = (buffer, mimetype) => {
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

export const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "video/mp4", "video/mkv"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File Type Not Supported!"), false);
        }
    }
});

export const NftUpload = multer({
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

export const uploadfield = upload.fields([
    { name: "media", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
])

export default cloudinary;