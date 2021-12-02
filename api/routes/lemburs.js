const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const checkAuth = require('../middleware/check-auth')
const LemburController = require('../controllers/lembur')


const Lembur = require('../models/lembur')

router.get('/', checkAuth(), LemburController.lembur_getAll)

// upload.single('lemburImage'),

router.post('/', checkAuth(),LemburController.lembur_create)

router.get('/:lemburId', checkAuth(), LemburController.lembur_getOne)

router.get('/approval/process', checkAuth('management'), LemburController.lembur_getProcess)

router.get('/approval/approved', checkAuth('management'), LemburController.lembur_getApproved)

router.patch('/:lemburId', checkAuth(), LemburController.lembur_patch)

router.patch('/approval/:lemburId', checkAuth('management'), LemburController.lembur_patchApproval)

router.delete('/:lemburId', checkAuth('management'), LemburController.lembur_delete)

router.delete('/', checkAuth('management'), LemburController.lembur_deleteAll)

module.exports = router