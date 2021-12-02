const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')

const CutiController = require('../controllers/cuti')

router.post('/', checkAuth(), CutiController.cuti_create)

router.get('/', checkAuth(), CutiController.cuti_getAll)

router.get('/:cutiId', checkAuth(), CutiController.cuti_getOne)

router.patch('/:cutiId', checkAuth('staff'), CutiController.cuti_patch)

router.patch('/approval/:cutiId', checkAuth('management'), CutiController.cuti_patchApproval)

router.delete('/:cutiId', checkAuth('management'), CutiController.cuti_deleteOne)

router.delete('/', checkAuth('management'), CutiController.cuti_deleteAll)

module.exports = router