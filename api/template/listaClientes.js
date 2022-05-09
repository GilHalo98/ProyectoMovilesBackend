const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const template_listaClientes = (token) => {
    const userToken = token;

    const htmlTemplat = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Lista de usuarios</title>
            
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

                    #clientes {
                        list-style-type: none;
                        margin: 0;
                        padding: 0;
                    }

                    #clientes > li {
                        text-align: center;
                        padding: 0.5rem 1rem;
                    }

                    #clientes > li:nth-child(odd) {
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

                <h3 id="titulo">Lista de usuarios activos</h3>

                <ul id="clientes"></ul>

                <form id="form" action="">
                    <button>Refrescar lista</button>
                </form>
            
                <!-- Script para el manejo de socket.io -->
                <script>
                    var socket = io({
                        auth: {
                            token: '${token}'
                        }
                    });

                    var listaUsuarios = [];
                
                    var listaClientes = document.getElementById('clientes');
                    var form = document.getElementById('form');
                
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        socket.emit('${EVENTOS.CONSULTA_CLIENTES}');
                    });
                
                    socket.on('${EVENTOS.CONSULTA_CLIENTES}', function(usuarios) {
                        listaUsuarios = usuarios;
                        listaClientes.innerHTML = '';

                        for (const indexUsuario in usuarios) {
                            var item = document.createElement('li');
                            item.textContent = usuarios[indexUsuario];
                            item.id = 'usuario_' + usuarios[indexUsuario];
                            listaClientes.appendChild(item);
                            window.scrollTo(0, document.body.scrollHeight);
                        }
                    });

                    socket.on('${EVENTOS.CLIENTE_DISPONIBLE}', function(idUsuario) {
                        var usuarioEnLista = listaUsuarios.find(id => {
                            id === idUsuario
                        });

                        if (!usuarioEnLista) {
                            listaUsuarios.push(idUsuario);

                            var item = document.createElement('li');
                            item.textContent = idUsuario;
                            item.id = 'usuario_' + listaUsuarios[idUsuario];
                            listaClientes.appendChild(item);
                            window.scrollTo(0, document.body.scrollHeight);
                        }
                    });
                
                    socket.on('${EVENTOS.CLIENTE_TERMINADO}', function(idUsuario) {
                        var usuarioEnLista = listaUsuarios.find(id => {
                            id === idUsuario
                        });

                        if (usuarioEnLista) {
                            var index = listaUsuarios.indexOf(idUsuario);
                            delete listaUsuarios[payload.usuario];

                            listaClientes.removeChild(document.getElementById('usuario_' + idUsuario));
                            window.scrollTo(0, document.body.scrollHeight);
                        }
                    });

                    socket.emit('${EVENTOS.CONSULTA_CLIENTES}');
                </script>
            </body>
        </html>
    `;

    return htmlTemplat;
}


module.exports  = {
  template_listaClientes
}