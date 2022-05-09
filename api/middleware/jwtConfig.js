const jwt = require('jsonwebtoken');

const getToken = (payload) => {
    // Buffer.from(process.env.Secret, 'base64'),
    return jwt.sign(
        payload,
        process.env.Secret,
//        {expiresIn: '1h'}
    );
}

const getTokenData = (token) => {
    let data = null;

    jwt.verify(token, process.env.Secret, (error, decoded) => {
        if (error) {
            console.log(`Error al decodificar datos en el token: ${error}`);
        } else {
            data = decoded;
        }
    });

    return data;
}

module.exports = {
    getToken,
    getTokenData
}
