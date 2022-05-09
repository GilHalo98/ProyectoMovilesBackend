class EventosSockets {
    CONEXION = 'connect';
    DESCONEXION = 'disconnect';

    MENSAJE_ENVIADO_PRIVADO = 'mensaje_privado';

    CLIENTE_DISPONIBLE = 'cliente_disponible';
    CLIENTE_TERMINADO = 'cliente_terminado';

    CONSULTA_CLIENTES = 'consulta_clientes';
    CONSULTA_CONTACTOS = 'consulta_contactos';
}

module.exports = {
    EventosSockets
}