# ProyectoMovilesBackend
Backend del proyecto de dispositivos móviles

Modelo de la DB

https://app.quickdatabasediagrams.com/#/

Usuario
---
idUsuario PK  # ID del usuario
nombreUsuario str UNIQUE  # Nombre del usuario
correo str UNIQUE  # Correo Electronico del usuario
password str  # Contraseña cifrada del usuario
codigoVerificacion int  # Codigo de verificacion de correo
correoVerificado bool  # Indica si el correo esta verificado
idRol FK >- Rol.idRol  # Rol asignado al usuario
idPreferencias FK - Preferencia.idPreferencia  # Preferencias del usuario.

Rol
---
idRol PK  # ID del rol
nombreRol str  # Nombre del rol
descripcionRol str  # Descripcion del rol

Preferencia
---
idPreferencia PK  # ID de preferencia
idioma str  # Idioma de la interfaz.
pais str  # Pais del usuario
estadoPerfil str  # Estado del perfil, un texto descriptivo
contactos FK >- Usuario.idUsuario  # Lista de contactos

Mensaje
---
idMensaje PK  # ID del mensaje
contenido str  # Contenido del mensaje
fecha date  # Fecha del envio del mensaje
idRemitente FK >- Usuario.idUsuario  # ID del remitente
idDestinatario FK -< Usuario.idUsuario  # ID del Destinatario

---

Descargar npm
Descargar xammp

Una vez descargado esto, ingresar en la consola en el directorio del proyecto lo siguiente:

npm install -g sequelize-cli
npm install

Ahora ejecutamos xammp, abrimos los servicios de mysql y php

Despues de esto creamos una base de datos llamada pdm y creamos un archivo .env con los siguientes parametros:

DB_DATABASE=PDM
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_DIALECT=mysql
DB_PORT=3306

PORT=3001
HOST=localhost

Secret=secret

API_URL=/api/

BASE_DIR=Directorio absoluto al proyecto

MAIL_DIR=
MAIL_PASS=

una vez creada la base de datos y el archivo .env ejecutamos los siguientes comandos

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

y para ejecutar el servidor del backend se ejecuta el comando
npm start