const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountController');
const auth = require('../middlewhere/auth');
const path = require('path');
const multer = require('multer')

const storage = multer.diskStorage({
    destination:'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.new() + path.extname(file.originalname))
    }
});


const upload = multer({
    limits: {fieldSize: 1024 * 1024},
    storage: storage,
    fileFilter: (req, file, cb) => {
        let fileTypes = /jpeg|jpg|png/;
        let mimeType = fileTypes.test(file.mimetype);
        let extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if(mimeType && extname) return cb(null, true);
        cb(new Error('لا يمكن رفع ملف بهذا الحجم'))
    }
})

router.post('/', [auth.authenticated, upload.single('avatar')], controller.profile)

router.post('/password', auth.authenticated, controller.password)


module.exports = router