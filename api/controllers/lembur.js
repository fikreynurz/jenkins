const Lembur = require('../models/lembur')
const User = require('../models/user')
const mongoose = require('mongoose')
const mailer = require('./nodemailer')

exports.lembur_create = async (req, res, next) => {
    let assigner = await User.findById(req.body.assigner); // tujuan kirim email
    let assignee = await User.findById(req.userData.id)
    let now = new Date()
    let y2d = now.getFullYear().toString().substr(-2)
    let m2d = ("0" + (now.getMonth() + 1)).slice(-2)
    let d2d = ("0" + (now.getDate())).slice(-2)
    let time1 = new Date(req.body.endTime)
    let time2 = new Date(req.body.startTime)

    const lembur = new Lembur({
        _id: new mongoose.Types.ObjectId(),
        documentId: documentId = `${y2d}/${m2d}/${d2d}/${count = ( "000" + (await Lembur.count() + 1 )).slice(-3)}`,
        createdDate: createdDate = `${d2d}/${m2d}/${y2d}`,
        assignee: req.userData.id,
        email: req.userData.email,
        assigner: req.body.assigner,
        reasons: req.body.reasons,
        time: req.body.time,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        approval: req.body.approval,
        totalTime: totalTime = (time1.getTime() - time2.getTime()) / 60000 // menit
    })

    if(!req.body.assigner || req.body.assigner == null){
        res.status(404).send({
            message: "Assigner can't be empty"
        })
    }

    else if(!req.body.reasons || req.body.reasons == null){
        res.status(404).send({
            message: "Reasons can't be empty"
        })
    }

    else if(!req.body.time || req.body.time == null){
        res.status(404).send({
            message: "Time can't be empty"
        })
    }

    else if(!req.body.startTime || req.body.startTime == null){
        res.status(404).send({
            message: "StartTime can't be empty"
        })
    }

    else if(!req.body.endTime || req.body.endTime == null){
        res.status(404).send({
            message: "EndTime can't be empty"
        })
    }

    else if(req.body.endTime < req.body.startTime || req.body.startTime == req.body.endTime){
        res.status(500).send({
            message: "You can't set endTime is lesser than startTime or both are equal"
        })
    }

    else {
        await lembur.save()
        mailer.send_email(lembur, assigner.email, assignee.fullName)
        res.status(200).send({message: "Created!"})
    }
}

exports.lembur_getAll = async (req, res, next) => {
    let filter = {}
    let role = req.userData.roles
    if(role == "staff") {
        filter = {assignee: req.userData.id}
    }

    const docs = await Lembur.find(filter)
    let docsi = await Promise.all( docs.map( async (doc)  => {
        const { _id, assigner, ...docum } = doc._doc;
        const assigners = await User.findById(doc.assigner);
        const users = await User.findById(doc.assignee);
        docum.assigner = assigners.fullName;
        docum.assignee = users.fullName;
        docum.id = doc._id;
        return docum;
    }))
    res.status(200).json({total: docsi.length,data: docsi})
}

exports.lembur_getOne = async (req, res, next) => {
    const id = await req.params.lemburId
    const docs = await Lembur.findById(id)
    const acc = req.userData
    if(acc.roles == 'management'){
        let docsi = await Promise.all( [docs].map( async (doc)  => {
            const { _id, assigner, ...docum } = doc._doc;
            const result = await User.findById(doc.assigner);
            const users = await User.findById(doc.assignee);
            docum.assigner = result.fullName;
            docum.assignee = users.fullName;
            docum.id = doc._id;
            return docum;
        }))
        res.status(200).json({total: docsi.length,data: docsi})
    } else if(acc.roles == 'staff' && acc.id == docs.assignee ){
        const docs = await Lembur.findById(id)
        let docsi = await Promise.all( [docs].map( async (doc)  => {
            const { _id, assigner, ...docum } = doc._doc;
            const result = await User.findById(doc.assigner);
            const users = await User.findById(doc.assignee);
            docum.assigner = result.fullName;
            docum.assignee = users.fullName;
            docum.id = doc._id;
            return docum;
        }))
        res.status(200).json({total: docsi.length,data: docsi})
    } 
    else{
        res.status(404).send({
            message: 'No access'
        })
    }
}

exports.lembur_getProcess = async (req, res) => {
    const docs = await Lembur.find({
        approval: 'process'
    })
    let docsi = await Promise.all( docs.map( async (doc)  => {
        const { _id, assigner, ...docum } = doc._doc;
        const result = await User.findById(doc.assigner);
        const users = await User.findById(doc.assignee);
        docum.assigner = result.fullName;
        docum.assignee = users.fullName;
        docum.id = doc._id;
        return docum;
    }))
    res.status(200).json({total: docsi.length,data: docsi})
}

exports.lembur_getApproved = async (req, res) => {
    const docs = await Lembur.find({
        approval: 'approved'
    })
    let docsi = await Promise.all( docs.map( async (doc)  => {
        const { _id, assigner, ...docum } = doc._doc;
        const result = await User.findById(doc.assigner);
        const users = await User.findById(doc.assignee);
        docum.assigner = result.fullName;
        docum.assignee = users.fullName;
        docum.id = doc._id;
        return docum;
    }))
    res.status(200).json({total: docsi.length,data: docsi})
}


exports.lembur_patch = async (req, res) => {
    let time1 = new Date(req.body.endTime)
    let time2 = new Date(req.body.startTime)
    let totalTime = (time1.getTime() - time2.getTime()) / 60000 // menit
    if(req.body.approval){
        res.status(404).send({
            message: "can't change approval here"
        })
        return
    }
    
    await Lembur.updateOne({_id:req.params.lemburId}, req.body, {new:true})
    await Lembur.updateOne({_id:req.params.lemburId}, {totalTime: totalTime}, {new:true})
    const docs = await Lembur.findById({_id:req.params.lemburId})
    const { _id, assigner, ...docum } = docs._doc;
    const user = await User.findById(docs.assigner);
    const users = await User.findById(docs.assignee);
    docum.assignee = users.fullName;
    docum.assigner = user.fullName;
    docum.id = docs._id;
    // console.log(docum)
    res.send(docum)

}

exports.lembur_patchApproval = async (req,res) => {
    const lembur = await Lembur.findById({_id:req.params.lemburId})
    let userID = await User.findById(mongoose.Types.ObjectId(lembur.assignee))
    let assignerID = await User.findById(mongoose.Types.ObjectId(lembur.assigner))
    let userEmail = userID.email
    let assignerName = assignerID.fullName
    if(lembur.approval == "approved" || lembur.approval == "rejected"){
        res.status(404).send({
            message: "You can't update the 'approved/rejected' form"
        })
        return
    }

    if(req.userData.id != lembur.assigner){
        res.status(404).send({
            message: `Only ${assignerName} can approve this form`
        })
        return
    }

    await Lembur.updateOne({_id:req.params.lemburId}, req.body, {new:true})
    if(req.body.approval == "approved"){
        mailer.approved(userEmail, assignerName)
    } else if(req.body.approval == "rejected"){
        mailer.rejected(userEmail, assignerName)
    }
    const docs = await Lembur.findById({_id:req.params.lemburId})
    const { _id, assigner, ...docum } = docs._doc;
    const user = await User.findById(docs.assigner);
    const users = await User.findById(docs.assignee);
    docum.assignee = users.fullName;
    docum.assigner = user.fullName;
    docum.id = docs._id;
    // console.log(docum)
    res.send(docum)

}

exports.lembur_delete = async (req, res, next) => {
    const id = req.params.lemburId
    let deleteLembur = await Lembur.remove({ _id: id })
    res.send(deleteLembur)
}

exports.lembur_deleteAll = async (req,res) => {
    let deleteLembur = await Lembur.deleteMany()
    res.send(deleteLembur)
}