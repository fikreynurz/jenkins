const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
  
const upload = multer({
    storage: storage,
    limits: {
      // fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


const UserController = require('../controllers/user')

router.get('/allUser', checkAuth('management'),UserController.user_getAll)

router.get('/profile', checkAuth(), UserController.user_getProfile)

router.get('/manager', checkAuth(), UserController.user_getManager)

router.post('/signup', UserController.user_signup)

router.post('/signin' , UserController.user_signin )

router.patch('/profile', upload.single('image'), checkAuth(), UserController.user_patch)

router.patch('/profile/password', checkAuth(), UserController.user_patchPW)

router.delete('/:userId', checkAuth('management'), UserController.user_delete)

module.exports = router

// kalo checkAuthnyah kosong, berti semua role