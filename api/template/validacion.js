const template_validacion = (datosUsuario) => {
    return `
    <html>
        <head>
            <title>Title of the document</title>
        </head>

        <body>
            <h1>Hola ${datosUsuario.nombreUsuario}!</h1>
            <p>Te has registrado en _. Ingresa el código siguiente para poder verificar tu registro</p>
            <h3>CODIGO</h3>
        </body>

        <footer>
          <p>Correo autogenerado, por favor no respondas a este mensaje.</p>
        </footer>
    </html>
    `;
}

module.exports  = {
    template_validacion
}
