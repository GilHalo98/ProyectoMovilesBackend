class EventosSockets {
    CONEXION = 'connect';
    DESCONEXION = 'disconnect';

    MENSAJE_ENVIADO_PRIVADO = 'mensaje_privado';

    CLIENTE_DISPONIBLE = 'cliente_disponible';
    CLIENTE_TERMINADO = 'cliente_terminado';

    CONSULTA_CLIENTES = 'consulta_clientes';
    CONSULTA_CONTACTOS = 'consulta_contactos';

    STREAMING_VIDEO_LLAMADA = 'streaming_video_llamada';
    PETICION_VIDEO_LLAMADA = 'peticion_video_llamada';
    VIDEO_LLAMADA_ACEPTADA = 'video_llamada_aceptada';
    VIDEO_LLAMADA_NEGADA = 'video_llamada_negada';
}

module.exports = {
    EventosSockets
}