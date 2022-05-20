const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const template_chat = (token, id, usuario, contactos) => {
  const userToken = token;
  const idUser = id;
  const username = usuario;
  const contacts = contactos;

  // Formatea una lista de items para poder seleccionar el usuario al
  // que se le enviara el mensaje.
  var listaContactos = `
    <div
      class="btn-group-vertical"
      id="listaContactos"
      role="group"
      aria-label="Basic radio toggle button group"
    >
  `;
  
  for (const indexContacto in contacts) {
    var contacto = contacts[indexContacto];
    var idItem = 'contacto_' + contacto.id;
    var idLabel = 'label_contacto_' + contacto.id;

    var item = `
      <input
        type="radio"
        class="btn-check"
        name="botonContactos"
        id="${idItem}"
        value="${contacto.id}"
        autocomplete="off"
        alt="${contacto.nombreUsuario}"
      >
      <label class="btn btn-outline-danger" id="${idLabel}" for="${idItem}">
        ${contacto.nombreUsuario}
      </label>
    `;
    listaContactos += item;
  }

  listaContactos += `
    </div>
  `;

    const htmlTemplat = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Chat privado ${username}</title>
            
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
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }

                    #form {
                        background: rgba(0, 0, 0, 0.15);
                        padding: 0.25rem;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        display: flex;
                        height: 3rem;
                        box-sizing: border-box;
                        backdrop-filter: blur(10px);
                    }

                    #input {
                        border: none;
                        padding: 0 1rem;
                        flex-grow: 1;
                        border-radius: 2rem;
                        margin: 0.25rem;
                    }

                    #input:focus {
                        outline: none;
                    }

                    #form > button {
                        background: #333;
                        border: none;
                        padding: 0 1rem;
                        margin: 0.25rem;
                        border-radius: 3px;
                        outline: none;
                        color: #fff;
                    }

                    #messages {
                        list-style-type: none;
                        margin: 0;
                        padding: 0;
                    }

                    #messages > li {
                        padding: 0.5rem 1rem;
                    }

                    #messages > li:nth-child(odd) {
                        background: #efefef;
                    }

                    #listaContactos {
                        display: flex;
                    }

                    #titulo {
                        text-align: center;
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

                <h3 id="titulo">Mensajeria Instantanea con Sockets</h3>
                

                <div class="container">
                    <div class="row">
                        <div class="col">
                            <h5 id="titulo">Usuario: ${username}</h5>
                        </div>

                        <div class="col">
                            <h5 id="titulo">ID: ${idUser}</h5>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Columna de contactos -->
                        <div class="col-3">
                            <h5>Lista de contactos</h5>

                            ${listaContactos}
                        </div>

                        <!-- Columna de sala de chat -->
                        <div class="col">
                            <h5 id="nombreSala">Sala de Chat</h5>

                            <ul id="messages"></ul>

                            <form id="form" action="">
                                <input id="input" autocomplete="off" />

                                <button>Send</button>
                            </form>
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

                    var mensajeHacia = null;
                    var logChats = {};
                
                    var messages = document.getElementById('messages');
                    var form = document.getElementById('form');
                    var listaContactos = document.getElementById('listaContactos');
                    var input = document.getElementById('input');
                    var nombreSala = document.getElementById('nombreSala');

                    listaContactos.addEventListener('change', function(e) {
                        e.preventDefault();

                        nombreSala.textContent = "Sala de Chat de " + e.target.alt;

                        mensajeHacia = e.target.value;
                    });

                    socket.on('${EVENTOS.CONEXION}', () => {
                        socket.emit('${EVENTOS.CLIENTE_DISPONIBLE}');
                    });
                
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        if (input.value) {
                            var item = document.createElement('li');
                            item.style.cssText = 'text-align: right;';
                            item.textContent = input.value;
                            
                            socket.emit(
                                '${EVENTOS.MENSAJE_ENVIADO_PRIVADO}',
                                input.value,
                                mensajeHacia
                            );
                            input.value = '';
                    
                            messages.appendChild(item);
                            window.scrollTo(0, document.body.scrollHeight);
                        }
                    });
                
                    socket.on('${EVENTOS.MENSAJE_ENVIADO_PRIVADO}', function(msg) {
                        var item = document.createElement('li');
                        item.textContent = msg;
                        messages.appendChild(item);
                        window.scrollTo(0, document.body.scrollHeight);
                    });

                    socket.on('${EVENTOS.CLIENTE_DISPONIBLE}', function(idContacto) {
                        var idLabel = 'label_contacto_' + idContacto;
                        console.log(idLabel);
                        var label = document.getElementById(idLabel);
                        label.setAttribute('class', 'btn btn-outline-success');
                    });
                
                    socket.on('${EVENTOS.CLIENTE_TERMINADO}', function(idContacto) {
                        var idLabel = 'label_contacto_' + idContacto;
                        console.log(idLabel);
                        var label = document.getElementById(idLabel);
                        label.setAttribute('class', 'btn btn-outline-danger');
                    });

                    socket.emit('${EVENTOS.CONSULTA_CONTACTOS}');
                </script>
            </body>
        </html>
    `;

  return htmlTemplat;
};

module.exports = {
  template_chat
};