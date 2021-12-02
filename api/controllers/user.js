const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.user_signup = async (req,res,next) => {
    let user = await User.find({email: req.body.email})
    if(user.length >= 1){
        return res.status(406).json({
            message: 'Email already taken!'
        })
    }else {
        let hasil = await bcrypt.hash(req.body.password, 10)
        if(!hasil){
            return res.status(500).json({
                message:"Server Error"
            })
        }
            const user = new User({
                _id: mongoose.Types.ObjectId(),
                fullName: req.body.fullName,
                email: req.body.email,
                password: hasil,
                roles: req.body.roles
            })
            user.save()
            res.send(user)
    }
}

exports.user_signin = async (req,res,next) =>{
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if(emailRegexp.test(req.body.email) == false){
        res.status(406).send({message:"yang dimasukin email ya ngabbb"})
        return
    }

    let user =  await User.findOne({email: req.body.email})

    if(!user){
        res.status(404).send({message:"no user"})
        return
    }
    

    let hasil = await bcrypt.compare(req.body.password, user.password)

    if (!hasil){
        res.status(403).send({
            message: 'Invalid email or password'
        }) 
        return
    }
        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, process.env.JWT_KEY, 
        {
            // expiresIn: "24h"
        }
        );
        return res.status(200).send({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            roles: user.roles,
            token: token
        })
}


exports.user_getProfile = async (req,res) => {
    let user = await User.findOne({_id:req.userData.id})
    const {_id, ...result } = user._doc
    result.id = user._id;
    res.send(result)
}

exports.user_getAll = async (req,res) => {
    let users = await User.find();
    users = users.map(user => {
        const {_id, ...result } = user._doc
        result.id = user._id;
        return result;
    })
    res.send(users)
}

// For Choosing Assigner BTW
exports.user_getManager = async (req,res) => {
    let users = await User.find({
        roles: 'management'
    })
    users = users.map(user => {
        const {_id, ...result } = user._doc
        result.id = user._id;
        return result;
    })
    res.send(users)
}

// Update for Your Self :)
exports.user_patch = async (req,res,next) => {
    if(req.body.password) {
        res.status(500).send({
            message: "U can't change your password here! try /user/profile/password"
        })
        return
    }
    
    if (req.body.email){
        res.status(500).send({
            message: "Sorry, you can't change your email"
        })
        return
    }

    let update = {
        fullName: req.body.fullName,
        // image: req.file.path
    }
    if(req.file) update.image = req.file.path
    
    await User.updateOne({_id: req.userData.id}, {$set: update}, {returnOriginal: false})
    let newData = await User.findOne({_id:req.userData.id})
    const {_id, ...result } = newData._doc
    result.id = newData._id;
    res.send(result)
}

exports.user_patchPW = async (req,res,next) => {
    const salt = bcrypt.genSaltSync(10)
    let user =  await User.findOne({email: req.userData.email})
    let oldPassword = req.body.oldPassword
    let compare = await bcrypt.compare(oldPassword, user.password)
    if(!compare || !oldPassword){
        return res.status(401).send({
            message: 'Invalid old password'
        })
    }
    
    req.body.password = await bcrypt.hash(req.body.password, salt)

    await User.updateOne({_id: req.userData.id}, req.body, {returnOriginal: false})
    let newData = await User.findOne({_id:req.userData.id})
    const {_id, ...result } = newData._doc
    result.id = newData._id;
    res.send(result)

}

// Delete By ID
exports.user_delete = async (req,res,next) => {
    let user = await User.findOne({_id:req.params.userId})
    await User.remove({_id:req.params.userId})
    res.send({message: user.fullName + ' deleted!'})
}