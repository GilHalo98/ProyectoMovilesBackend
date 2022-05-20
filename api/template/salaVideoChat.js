const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const template_video_chat = (token, id, usuario) => {
    const userToken = token;
    const idUser = id;
    const username = usuario;

    const htmlTemplat = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Video Chat de ${username}</title>
            
                <!-- Required meta tags -->
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            
                <!-- Bootstrap CSS -->
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                    crossorigin="anonymous"
                >
            
                <script src="/socket.io/socket.io.js"></script>
            
                <style>
                    body {
                        margin: 0;
                        padding-bottom: 3rem;
                    }

                    #titulo {
                        text-align: center;
                    }

                    video {
                        width: 800px;
                        height: 600px;
                    }
                </style>
            </head>
            
            <body>
                <!-- Option 1: Bootstrap Bundle with Popper -->
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                    crossorigin="anonymous"
                ></script>

                <h3 id="titulo">Sala de video chat</h3>

                <div class="container">
                    <div class="row">
                        <div class="col">
                            <h5 id="titulo">Usuario: ${username}</h5>
                        </div>

                        <div class="col">
                            <h5 id="titulo">ID: ${idUser}</h5>
                        </div>

                        <div class="col">
                            <div class="status"></div>
                        </div>
                    </div>

                    <div class="row>
                        <div class="col">
                            <video id="video" playsinline autoplay></video>
                        </div>
                    </div>

                    <div class="row>
                        <div class="col">
                            <canvas id="previsualizacion"></canvas>
                        </div>
                    </div>

                    <div class="row>
                        <div class="col">
                            <button id="emitir" class="btn btn-outline-success">Emitir</button>
                        </div>
                    </div>
                </div>
            
                <!-- Script para el manejo de socket.io -->
                <script>
                    var previsualizacion = document.querySelector("#previsualizacion");
                    var video = document.querySelector("#video");
                    var contexto = previsualizacion.getContext("2d");
                    var boton = document.querySelector("#emitir");
                    var status = document.querySelector(".status");

                    previsualizacion.width = 512;
                    previsualizacion.height = 384;

                    contexto.width = previsualizacion.width;
                    contexto.height = previsualizacion.height;

                    var socket = io({
                        auth: {
                            token: '${token}'
                        }
                    });

                    function mostrarMenaje(msg) {
                        status.innerText = msg;
                    }

                    function errorCamara() {
                        mostrarMensaje('La camara fallo');
                    }

                    function loadCamara(stream) {
                        video.srcObject = stream;
                        mostrarMensaje('Camara funcionado');
                    }

                    function mostrarVideo(video, contexto) {
                        contexto.drawImage(video, 0, 0, contexto.width, contexto.height);

                        socket.emit('${EVENTOS.STREAMING}', previsualizacion.toDataURL('image/webp'));
                    }

                    boton.addEventListener('click', () => {
                        try {
                            navigator.getUserMedia = (
                                navigator.getUserMedia
                                || navigator.webkitGetUserMedia
                                || navigator.mozGetUserMedia
                                || navigator.msgGetUserMedia
                            );

                            if (navigator.getUserMedia) {
                                navigator.getUserMedia({
                                    audio: true,
                                    video: true,
                                }, loadCamara, errorCamara);

                                var intervalo = setInterval (() => {
                                    mostrarVideo(video, contexto);
                                }, 30);
                                
                            } else {
                                alert("Error al capturar camara");
                            }

                        } catch (e) {
                            alert("Error fatal");
                            console.log(e.toString());
                        }
                    });

                    socket.on('${EVENTOS.CONEXION}', () => {
                        socket.emit('${EVENTOS.CLIENTE_DISPONIBLE}');
                    });
                </script>
            </body>
        </html>
    `;

  return htmlTemplat;
};

const template_video_chat_recivido = (token, id, usuario) => {
    const userToken = token;
    const idUser = id;
    const username = usuario;

    const htmlTemplat = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Video Chat de ${username}</title>
            
                <!-- Required meta tags -->
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            
                <!-- Bootstrap CSS -->
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                    crossorigin="anonymous"
                >
            
                <script src="/socket.io/socket.io.js"></script>
            
                <style>
                    body {
                        margin: 0;
                        padding-bottom: 3rem;
                    }

                    #titulo {
                        text-align: center;
                    }

                    video {
                        width: 800px;
                        height: 600px;
                    }
                </style>
            </head>
            
            <body>
                <!-- Option 1: Bootstrap Bundle with Popper -->
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                    crossorigin="anonymous"
                ></script>

                <h3 id="titulo">Sala de video chat</h3>

                <div class="container">
                    <div class="row">
                        <div class="col">
                            <h5 id="titulo">Usuario: ${username}</h5>
                        </div>

                        <div class="col">
                            <h5 id="titulo">ID: ${idUser}</h5>
                        </div>
                    </div>

                    <div class="row>
                        <div class="col">
                            <image id="previsualizacion"></image>
                        </div>
                    </div>
                </div>
            
                <!-- Script para el manejo de socket.io -->
                <script>
                    var socket = io({
                        auth: {
                            token: '${token}'
                        }
                    });

                    socket.on('${EVENTOS.STREAMING}', (video) => {
                        var previsualizacion = document.getElementById("previsualizacion");
                        previsualizacion.src = video;
                    });

                    socket.on('${EVENTOS.CONEXION}', () => {
                        socket.emit('${EVENTOS.CLIENTE_DISPONIBLE}');
                    });
                </script>
            </body>
        </html>
    `;

  return htmlTemplat;
};

module.exports = {
    template_video_chat,
    template_video_chat_recivido,
};