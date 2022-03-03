const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_DIR,
        pass: process.env.MAIL_PASS
    }
});

const enviarValidacion = async (email, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_DIR,
            to: email,
            subject: subject,
            text: 'prueba',
            html: '<h1>Prueba<h1/>',
        });
    } catch(error) {
        console.log('El email no fue enviado', error);
    }
}

module.exports  = {
    enviarValidacion
}
