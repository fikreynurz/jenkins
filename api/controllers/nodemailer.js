exports.send_email = (lembur, email, name) => {
    require('dotenv').config()
    
    const nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pklsija2021@gmail.com',
            pass: process.env.emailPasswd
        }
    })
    
    let mailOptions = {
        from: '"PKL SIJA 2021"<pklsija2021@gmail.com>',
        to: email,
        subject: 'Permintaan Izin Lembur Pegawai PT. GTI',
        text: `Nama\t\t : ${name}\nAlasan\t\t : ${lembur.reasons}\nTanggal\t\t : ${lembur.time.toLocaleDateString()} \nJam\t\t : ${lembur.startTime.toLocaleTimeString()} - ${lembur.endTime.toLocaleTimeString()}\nTotal\t\t : ${lembur.totalTime} Menit`
    }
    
    transporter.sendMail(mailOptions, function(err, data) {
        if(err) {
            console.log(err)
        }else {
            console.log('Mail Sent!')
        }
    })
}

exports.approved = (userEmail, assignerName) => {
    require('dotenv').config()
    
    const nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pklsija2021@gmail.com',
            pass: process.env.emailPasswd
        }
    })
    
    let mailOptions = {
        from: '"PKL SIJA 2021"<pklsija2021@gmail.com>',
        to: userEmail,
        subject: 'Izin Lembur Anda Telah Disetujui',
        text: `Izin lembur anda telah disetujui oleh ${assignerName}`
    }
    
    transporter.sendMail(mailOptions, function(err, data) {
        if(err) {
            console.log(err)
        }else {
            console.log(`Mail Sent to ${userEmail}`)
        }
    })
}

exports.rejected = (userEmail, assignerName) => {
    require('dotenv').config()
    
    const nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pklsija2021@gmail.com',
            pass: process.env.emailPasswd
        }
    })
    
    let mailOptions = {
        from: '"PKL SIJA 2021"<pklsija2021@gmail.com>',
        to: userEmail,
        subject: 'Izin Lembur Anda Tidak Disetujui',
        text: `Izin lembur anda tidak disetujui oleh ${assignerName}`
    }
    
    transporter.sendMail(mailOptions, function(err, data) {
        if(err) {
            console.log(err)
        }else {
            console.log(`Mail Sent to ${userEmail}`)
        }
    })
}


// #####################################################################

exports.cuti_email = (cuti, email, name) => {
    require('dotenv').config()
    
    const nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pklsija2021@gmail.com',
            pass: process.env.emailPasswd
        }
    })
    
    let mailOptions = {
        from: '"PKL SIJA 2021"<pklsija2021@gmail.com>',
        to: email,
        subject: 'Permohonan Cuti Pegawai PT. GTI',
        text: `Nama\t\t : ${name}\nAlasan\t\t : ${cuti.necessity}\nPada tanggal: ${cuti.startDate.toLocaleDateString()} - ${cuti.endDate.toLocaleDateString()}\nTotal\t\t : ${cuti.leaveDuration} Hari`
    }
    
    transporter.sendMail(mailOptions, function(err, data) {
        if(err) {
            console.log(err)
        }else {
            console.log(`Mail Sent to ${email}!`)
        }
    })
}

exports.cuti_approved = (user, manager) => {
    require('dotenv').config()
    
    const nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pklsija2021@gmail.com',
            pass: process.env.emailPasswd
        }
    })
    
    let mailOptions = {
        from: '"PKL SIJA 2021"<pklsija2021@gmail.com>',
        to: user.email,
        subject: 'Permohonan Cuti Anda Telah Disetujui',
        text: `Permohonan cuti anda telah disetujui oleh ${manager.fullName}`
    }
    
    transporter.sendMail(mailOptions, function(err, data) {
        if(err) {
            console.log(err)
        }else {
            console.log(`Mail Sent to ${user.email}`)
        }
    })
}