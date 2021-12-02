const Sick = require('../models/sickLeave')
const User = require('../models/user')
const mongoose = require('mongoose')
const mailer = require('./nodemailer')
require('dotenv').config()

exports.sick_create = async (req, res) => {
    const sick = new Sick({
        _id: new mongoose.Types.ObjectId(),
        staffId: req.userData.id,
        image: req.file.path,
        description: req.body.description,
        date: req.body.date
    })
    await sick.save()
    res.send({message:"sickLeave created!"})
}

exports.sick_getAll = async (req, res) => {
    let filter = {}
    let role = req.userData.roles
    if(role == "staff") {
        filter = {staffId: req.userData.id}
    }

    const docs = await Sick.find(filter)
    let docsi = await Promise.all( docs.map( async (doc)  => {
        const { _id, managerId, ...docum } = doc._doc;
        const manager = await User.findById(doc.managerId);
        const staff = await User.findById(doc.staffId);
        if(manager) docum.managerId = manager.fullName;
        docum.image = process.env.myAddress + docum.image
        docum.staffId = staff.fullName;
        docum.id = doc._id;
        return docum;
    }))
    res.status(200).json({total: docsi.length,data: docsi})
}

exports.sick_getOne = async (req, res) => {
    const sick = await Sick.findById(req.params.sickId)
    const user = req.userData

    if(!sick){
        res.status(404).send({
            message: "Not Found"
        })
        return
    }
    if(user.roles == 'management' || user.id == sick.staffId && user.roles == 'staff'){
        let docsi = await Promise.all( [sick].map( async (doc)  => {
            const { _id, managerId, ...docum } = doc._doc;
            const manager = await User.findById(doc.managerId);
            const staff = await User.findById(doc.staffId);
            if(manager) docum.managerId = manager.fullName;
            docum.image = process.env.myAddress + docum.image
            docum.staffId = staff.fullName;
            docum.id = doc._id;
            return docum;
        }))
        res.status(200).json({data: docsi})
        return
    }
    else{
        res.status(401).send({
            message: "No Access"
        })
    }
}

exports.sick_patch = async (req, res) => {
    const id = await Sick.findById(req.params.sickId)

    if(id.accept != 'process'){
        res.status(403).send({
            message: "Can't update an accepted form"
        })
        return
    }
    let update = {
        date: req.body.date,
        description: req.body.description,
        // image: req.file.path
    }
    if(req.file) update.image = req.file.path

    await Sick.updateOne({_id:id}, {$set: update}, {new: true})
    const newData = await Sick.findById(id)
    const manager = await User.findById(newData.managerId);
    const staff = await User.findById(newData.staffId);
    const {_id, ...result } = newData._doc
    if(manager)result.managerId = manager.fullName
    result.staffId = staff.fullName
    result.id = newData._id;
    res.send(result)
}

exports.sick_patchAccept = async (req, res) => {
    const id = await Sick.findById(req.params.sickId)

    if(req.body.description){
        res.status(403).send({
            message: "accept only"
        })
        return
    }

    if(id.accept == 'accepted'){
        res.status(403).send({
            message:'form already accepted'
        })
        return
    }

    let update = {
        accept: req.body.accept,
        managerId: req.userData.id,
        acceptedDate: new Date()
    }
    await Sick.updateOne({_id:id}, {$set: update}, {new:true})
    const newData = await Sick.findById(id)
    const manager = await User.findById(newData.managerId);
    const staff = await User.findById(newData.staffId);
    const {_id, ...result } = newData._doc
    if(manager)result.managerId = manager.fullName
    result.id = newData._id;
    result.staffId = staff.fullName
    res.status(200).send(result)   
}

exports.sick_deleteOne = async (req, res) => {
    const id = req.params.sickId
    const sick = await Sick.findById(id)
    if(!sick){
        res.status(403).send({
            message: "form not found"
        })
        return
    }
    let deleteSick = await Sick.remove({ _id: id })
    res.send(deleteSick)
}

exports.sick_deleteAll = async (req, res) => {
    let deleteSick = await Sick.deleteMany()
    res.send(deleteSick)
}