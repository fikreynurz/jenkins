const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fullName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique:true
    },
    password: { 
        type: String, 
        required: true
    },
    roles: { 
        type: String, 
        default:'staff' , 
        enum: ['staff','management'],
        required: true 
    },
    image: {
        type: String,
        default: 'uploads/default.jpg',
        required: true
    }
},
{
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)