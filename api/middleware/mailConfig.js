const nodemailer = require("nodemailer");
const { template_validacion } = require("../template/validacion");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_DIR,
        pass: process.env.MAIL_PASS
    }
});

const enviarValidacion = async (datosUsuario, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_DIR,
            to: datosUsuario.correo,
            subject: subject,
            text: 'prueba',
            html: template_validacion(datosUsuario),
        });
    } catch(error) {
        console.log('El email no fue enviado', error);
    }
}

module.exports  = {
    enviarValidacion
}
