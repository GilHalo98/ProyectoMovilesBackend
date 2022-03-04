const nodemailer = require("nodemailer");
const { template_validacion } = require("../template/validacion");

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
            html: template_validacion(),
        });
    } catch(error) {
        console.log('El email no fue enviado', error);
    }
}

module.exports  = {
    enviarValidacion
}
