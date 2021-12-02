const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')
const multer = require('multer')
const fs = require('fs')
const yearNow = new Date().getFullYear()
const monthNow = new Date().getMonth() + 1
const year = `./uploads/${yearNow}/`
const month = `./uploads/${yearNow}/${monthNow}/`

const SickController = require('../controllers/sickLeave')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      if(!fs.existsSync(year)){
        fs.mkdirSync(year, {recursive: true}, (err) => {
          if(err) throw err
        })
      }
      if(!fs.existsSync(month)){
        fs.mkdirSync(month, {recursive: true}, (err) => {
          if(err) throw err
        })
      }
      cb(null, month);
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
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
    // fileFilter: fileFilter
});

router.post('/', checkAuth(), upload.single('image'), SickController.sick_create)

router.get('/', checkAuth(), SickController.sick_getAll)

router.get('/:sickId', checkAuth(), SickController.sick_getOne)

router.patch('/:sickId', checkAuth('staff'), upload.single('image'),SickController.sick_patch)

router.patch('/accept/:sickId', checkAuth('management'), SickController.sick_patchAccept)

router.delete('/:sickId', checkAuth('management'), SickController.sick_deleteOne)

router.delete('/', checkAuth('management'), SickController.sick_deleteAll)

module.exports = router