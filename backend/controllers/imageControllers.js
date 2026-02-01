import grid from 'gridfs-stream';
import mongoose from 'mongoose';
// const url="https://blogapp-i0iw.onrender.com"
const url = "https://chatternet-backend.onrender.com";


let gfs, gridfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
});
export const UploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: "file not found" });
    }
    const imageurl = `${url}/file/${req.file.filename}`;
    return res.status(200).json(imageurl);

}



export const getImage = async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        // const readStream = gfs.createReadStream(file.filename);
        // readStream.pipe(response);
        const readStream = gridfsBucket.openDownloadStream(file._id);
        readStream.pipe(res);

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}