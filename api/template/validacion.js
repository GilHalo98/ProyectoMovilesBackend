const template_validacion = (datosUsuario) => {
    return `
    <html>
        <head>
            <title>Title of the document</title>
        </head>

        <body>
            <h1>Hola ${datosUsuario.nombreUsuario}!</h1>
            <p>Te has registrado en _. Ingresa el código siguiente para poder verificar tu registro</p>
            <h3>${datosUsuario.codigoVerificacion}</h3>
        </body>

        <footer>
          <p>Correo autogenerado, por favor no respondas a este mensaje.</p>
        </footer>
    </html>
    `;
};

const template_validacion_cambio_correo = (datosUsuario, correoAntiguo) => {
    return `
    <html>
        <head>
            <title>Title of the document</title>
        </head>

        <body>
            <h1>Hola ${datosUsuario.nombreUsuario}!</h1>
            <p>Se ha procesado un cambio de correo electrónico de ${correoAntiguo} a ${datosUsuario.correo}, por favor ingresa el código para continuar</p>
            <h3>${datosUsuario.codigoVerificacion}</h3>
        </body>

        <footer>
          <p>Correo autogenerado, por favor no respondas a este mensaje.</p>
        </footer>
    </html>
    `;
};

module.exports = {
    template_validacion,
    template_validacion_cambio_correo
};
