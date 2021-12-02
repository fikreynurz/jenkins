const mongoose = require('mongoose')

const sickSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    staffId: { 
        type: mongoose.Schema.Types.ObjectId, ref:'User', required:true 
    },
    managerId: { 
        type: mongoose.Schema.Types.ObjectId, ref:'User'
    },
    image: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
    date: {
        type: Date, required: true
    },
    accept: {
        type: String, default: 'process', required: true
    },
    acceptedDate: {
        type: Date,
        default: null
    }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('SickLeave', sickSchema)