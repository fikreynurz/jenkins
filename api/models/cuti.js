const mongoose = require('mongoose')

const cutiSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    assignee: { 
        type: mongoose.Schema.Types.ObjectId, ref:'User', required:true 
    },
    assigner: { 
        type: mongoose.Schema.Types.ObjectId, ref:'User', default: null
    },
    position: { 
        type: String, required: true 
    },
    leaveDuration: { 
        type: Number, required: true 
    },
    necessity: { 
        type: String, required: true
    },
    startDate: { 
        type: Date, required: true
    },
    endDate: { 
        type: Date, required: true
    },
    approval: {
        type: String, default: 'process', required: true
    },
    approvedDate: {
        type: Date,
        default: null
    }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('Cuti', cutiSchema)