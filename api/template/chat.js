const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const template_chat = (username) => {
  const htmlTemplat = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Socket.IO chat</title>

        <script src="/socket.io/socket.io.js"></script>

        <style>
          body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

          #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
          #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
          #input:focus { outline: none; }
          #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }

          #messages { list-style-type: none; margin: 0; padding: 0; }
          #messages > li { padding: 0.5rem 1rem; }
          #messages > li:nth-child(odd) { background: #efefef; }
        </style>
      </head>

      <body>
        <h3>Mensajeria Instantanea con Sockets</h3>

        <h5>Bienvenido ${username}</h5>

        <ul id="messages"></ul>

        <form id="form" action="">
            <input id="input" autocomplete="off" /><button>Send</button>
        </form>

        <script>
          var socket = io();
          socket.emit('${EVENTOS.USUARIO_DISPONIBLE}', '${username}');

          var messages = document.getElementById('messages');
          var form = document.getElementById('form');
          var input = document.getElementById('input');

          form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (input.value) {
              var item = document.createElement('li');
              item.style.cssText = 'text-align: right;';
              item.textContent = input.value;
              
              
              socket.emit('${EVENTOS.MENSAJE_ENVIADO}', input.value);
              input.value = '';

              messages.appendChild(item);
              window.scrollTo(0, document.body.scrollHeight);
            }
          });

          socket.on('${EVENTOS.MENSAJE_ENVIADO}', function(msg) {
            var item = document.createElement('li');
            item.textContent = msg;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
          });

          socket.on('${EVENTOS.USUARIO_DISPONIBLE}', function(usr) {
            var item = document.createElement('li');
            item.textContent = 'Usuario conectado: ' + usr;
            item.style.cssText = 'text-align: center;background-color:#99FC92';
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
          });
        </script>
      </body>
    </html>
  `;

  return htmlTemplat;
}


module.exports  = {
  template_chat
}