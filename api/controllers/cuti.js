const Cuti = require('../models/cuti')
const User = require('../models/user')
const mongoose = require('mongoose')
const mailer = require('./nodemailer')

exports.cuti_create = async (req, res) => {
    let managers  = await User.find({roles: "management"})
    let user = await User.findById(req.userData.id)
    let day1 = new Date(req.body.startDate)
    let day2 = new Date(req.body.endDate)
    let diff = Math.abs(day2-day1)
    let leaveDuration = diff/(1000 * 3600 * 24) + 1
    const userId = mongoose.Types.ObjectId(req.userData.id)
    
    
    let cutiss = await Cuti.find({assignee: userId})
    let hari = 0    
    cutiss.forEach(x => {
        hari = hari + x.leaveDuration
    });
    
    // let paidLeaveRemaining = (12 - (hari + leaveDuration))
    
    if (hari + leaveDuration > 12) {
        res.status(403).send({message:'Durasi cuti sudah melebihi limit'})
        console.log("duration limit")
        return
    }

    if (req.body.endDate < req.body.startDate){
        res.status(403).send({
            message:"endDate gabisa kurang dari startDate ngab"
        })
        return
    }

    if(!req.body.startDate || !req.body.endDate){
        res.status(404).send({
            message:"startDate sama endDate nya belom ada"
        })
        return
    }

    let pos = req.body.position
    if(pos.length < 3){
        res.status(403).send({
            message: "position harus lebih dari 3 karakter"
        })
        return
    }

    let nec = req.body.necessity
    if(nec.length < 5){
        res.status(403).send({
            message: "necessity harus lebih dari 5 karakter"
        })
        return
    }


    const cuti = new Cuti({
        _id: new mongoose.Types.ObjectId(),
        assignee: req.userData.id,
        position: req.body.position,
        necessity: req.body.necessity,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        leaveDuration: leaveDuration
    })
    await cuti.save()
    managers.forEach(manager => {
        mailer.cuti_email(cuti, manager.email, user.fullName)
    });
    res.send({message: "Created!"})

}

// ########################

exports.cuti_getAll = async (req, res) => {
    let filter = {}
    let role = req.userData.roles
    if(role == "staff") {
        filter = {assignee: req.userData.id}
    }

    const userId = mongoose.Types.ObjectId(req.userData.id)

    let filterFind = {
        assignee: userId,
        approval: 'approved'
    }

    let cutiss = await Cuti.find(filterFind)
    let hari = 0    
    cutiss.forEach(x => {
        hari = hari + x.leaveDuration
    });

    let sisaCuti = 12 - hari


    const docs = await Cuti.find(filter)
    let docsi = await Promise.all( docs.map( async (doc)  => {
        const { _id, assigner, ...docum } = doc._doc;
        const assigners = await User.findById(doc.assigner);
        const users = await User.findById(doc.assignee);
        if(assigners) docum.assigner = assigners.fullName;
        docum.assignee = users.fullName;
        docum.id = doc._id;
        return docum;
    }))
    res.status(200).send({
        total: docsi.length,
        data: docsi, 
        sisaCutiAnda: sisaCuti
    })
}

// ########################

exports.cuti_getOne = async (req, res, next) => {
    const docs = await Cuti.findById(req.params.cutiId)
    const user = req.userData
    if(!docs){
        res.status(404).send({message:'not found'})
        return
    }
    if(docs.assigner == null){
        let docsi = await Promise.all( [docs].map( async (doc)  => {
            const { _id, assigner, ...docum } = doc._doc;
            const assigners = await User.findById(doc.assigner);
            const users = await User.findById(doc.assignee);
            if(assigners)docum.assigner = assigners.fullName;
            docum.assignee = users.fullName;
            docum.id = doc._id;
            return docum;
        }))
        res.status(200).send({total: docsi.length,data: docsi, assigner:null})
        return
    }
    if(user.roles == 'management' || user.id == docs.assignee && user.roles == 'staff'){
        let docsi = await Promise.all( [docs].map( async (doc)  => {
            const { _id, assigner, ...docum } = doc._doc;
            const assigners = await User.findById(doc.assigner);
            const users = await User.findById(doc.assignee);
            if(assigners)docum.assigner = assigners.fullName;
            docum.assignee = users.fullName;
            docum.id = doc._id;
            return docum;
        }))
        res.status(200).send({total: docsi.length,data: docsi})
        return
    }
    res.status(403).send({
        message: "No Access"
    })
    return
}

// ########################

exports.cuti_patch = async (req, res) => {
    let day1 = new Date(req.body.startDate)
    let day2 = new Date(req.body.endDate)
    let diff = Math.abs(day2-day1)
    let leaveDuration = diff/(1000 * 3600 * 24) + 1
    const cuti = await Cuti.findById({_id: req.params.cutiId})
    const userId = mongoose.Types.ObjectId(req.userData.id)
    
    let cutiss = await Cuti.find({assignee: userId})
    let hari = 0    
    cutiss.forEach(x => {
        hari = hari + x.leaveDuration
    });

    
    if (hari + leaveDuration - cuti.leaveDuration  > 12) {
        res.status(403).send({message:'Sisa cuti anda telah melewati batas'})
        console.log(hari + leaveDuration)
        return
    }
    
    
    if(cuti.approval == "approved" || cuti.approval == "rejected"){
        res.status(404).send({
            message: "You can't update the 'approved/rejected' form"
        })
        return
    }
    
    let pos = req.body.position
    if(pos.length < 3 || !pos){
        res.status(403).send({
            message: "position harus lebih dari 3 karakter"
        })
        return
    }

    let nec = req.body.necessity
    if(nec.length < 5 || !nec){
        res.status(403).send({
            message: "necessity harus lebih dari 5 karakter"
        })
        return
    }
    
    if (req.body.endDate < req.body.startDate){
        res.status(403).send({
            message:"endDate gabisa kurang dari startDate ngab"
        })
        return
    }
    
    let update = {
        position: req.body.position,
        necessity: req.body.necessity,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        leaveDuration: leaveDuration
    }
    
    await Cuti.updateOne({_id: req.params.cutiId}, {$set: update}, {new:true})
    const newData = await Cuti.findById({_id: req.params.cutiId})
    const user = await User.findById(newData.assigner);
    const users = await User.findById(newData.assignee);
    const {_id, ...result } = newData._doc
    result.id = newData._id;
    result.assignee = users.fullName
    if(user)result.assigner = user.fullName
    res.send(result)
}

// ########################

exports.cuti_patchApproval = async (req, res) => {
    const cuti = await Cuti.findById(req.params.cutiId)
    
    
    if(cuti.approval == "approved" || cuti.approval == "rejected"){
        res.status(404).send({
            message: "You can't update the 'approved/rejected' form"
        })
        return
    }

    let update = {
        approval: req.body.approval
    }
    
    await Cuti.updateOne({_id: cuti}, {$set: update}, {new:true})
    if(req.body.approval == 'approved'){
        let id = mongoose.Types.ObjectId(req.params.cutiId)
        let update = {
            approvedDate: new Date(),
            assigner: req.userData.id
        }
        await Cuti.updateOne({_id: id}, {$set: update}, {new: true})
        let manager = await User.findById(req.userData)
        let user = await User.findById(cuti.assignee)
        mailer.cuti_approved(user, manager)
    }
    const newData = await Cuti.findById({_id: req.params.cutiId})
    const user = await User.findById(newData.assigner);
    const users = await User.findById(newData.assignee);
    const {_id, ...result } = newData._doc
    result.id = newData._id;
    result.assignee = users.fullName
    if(user)result.assigner = user.fullName
    res.send(result)
}

// ########################

exports.cuti_deleteOne = async (req, res) => {
    const id = req.params.cutiId
    const findId = await Cuti.findById(id)
    if(!findId){
        res.status(403).send({
            message: "form not found"
        })
        return
    }
    let deleteCuti = await Cuti.remove({ _id: id })
    res.send(deleteCuti)
}

// ########################

exports.cuti_deleteAll = async (req, res) => {
    let deleteCuti = await Cuti.deleteMany()
    res.send(deleteCuti)
}