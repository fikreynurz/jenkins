const mongoose = require('mongoose')

const lemburSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    documentId: { 
        type: String, required: true 
    },
    createdDate: { 
        type: String, required: true 
    },
    assignee: { 
        type: mongoose.Schema.Types.ObjectId, ref:'User', required:true 
    },
    assigner: { 
        type: mongoose.Schema.Types.ObjectId, ref:'User', required: true 
    },
    reasons: { 
        type: Array, required: true
    },
    time: { 
        type: Date, required: true 
    },
    startTime: { 
        type: Date, required: true
    },
    endTime: { 
        type: Date, required: true
    },
    approval: {
        type: String, default: 'process', required: true
    },
    totalTime: {
        type: Number
    }
    // lemburImage: { type: String, required: true }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('Lembur', lemburSchema)