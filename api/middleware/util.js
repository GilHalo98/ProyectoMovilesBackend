const generar_codigo = () => {
    var min = 1000;
    var max = 9999;

    return Math.floor((Math.random() * (max - min + 1)) + min);
};

const generar_codigo_sala = (idDestinatario, idRemitente) => {
    // Genera un codigo para la sala privada de video llamada.
    return `PDM-${idDestinatario}-${idRemitente}`
};

module.exports  = {
    generar_codigo,
    generar_codigo_sala
}
