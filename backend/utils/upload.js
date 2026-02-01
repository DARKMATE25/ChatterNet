import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import mongoose from "mongoose";

const storage = new GridFsStorage({
  db: mongoose.connection,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    };
  },
});

const upload = multer({ storage });

export default upload;
