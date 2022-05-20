const nodemailer = require("nodemailer");
const {
    template_validacion,
    template_validacion_cambio_correo,
} = require("../template/validacion");

var transporter = nodemailer.createTransport({
    service: 'Outlook365',
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
};

const enviarValidacionCorreoNuevo = async (datosUsuario, correoAntiguo, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_DIR,
            to: datosUsuario.correo,
            subject: subject,
            text: 'prueba',
            html: template_validacion_cambio_correo(datosUsuario, correoAntiguo),
        });

    } catch(error) {
        console.log('El email no fue enviado', error);
    }
};

module.exports  = {
    enviarValidacion,
    enviarValidacionCorreoNuevo
}
