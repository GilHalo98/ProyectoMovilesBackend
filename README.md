# ProyectoMovilesBackend
Backend del proyecto de dispositivos móviles

Modelo de la DB

https://app.quickdatabasediagrams.com/#/

Usuario
---
idUsuario PK
nombreUsuario str UNIQUE
correo str UNIQUE
correoVerificado bool
idRol FK >- Rol.idRol
idPreferencias FK - Preferencia.idPreferencia

Rol
---
idRol PK
descripcionRol str

Preferencia
---
idPreferencia PK
