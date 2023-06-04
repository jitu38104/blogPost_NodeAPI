const multer = require("multer");

const multerStorage = (type) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        const fileName = `${type}-${Date.now()}.${ext}`;
        cb(null, fileName);
    }
});
const multerFilter = (req, file, cb) => {
    const ext = (file.mimetype.split("/")[1]).toLowerCase();
    if(["png", "jpg", "jpeg", "webp"].includes(ext)) cb(null, true);
    else cb(new Error("Invalid Image File!"), false);
}

const upload = (type) => multer({
    storage: multerStorage(type),
    fileFilter: multerFilter
});

module.exports = upload;