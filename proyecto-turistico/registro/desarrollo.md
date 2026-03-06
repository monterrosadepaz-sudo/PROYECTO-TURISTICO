SISTEMA - TURISTICO

dia 28/1/2026

En cumplimiento con el deber de el desarrollo de "horas profesionales" de MEGATEC_ITCA, nuestro grupo aocrdo el desarrollo de este sistema.

Por mi parte , yo Julio Alberto Depaz Monterroza , soy el encargado de el desarrollo del backend, considerese que para el desarrollo de este sistema , se decidio cambiar la arquitectura de MVC a API firts (estructura desacoplada, o estructura frontend-backend , como sea mas facil identificarlo) haciendo incapie en el hecho que el ing a cargo de la supervision del desarrollo del mismo, ing. Heber Mijango , especifico durante la etapa de plaeacion que el equipo de desarrollo podia decidir con total libertad su propio procedimiento de desarollo sin tener reglas claras, e ahi el motivo del cambio de arquitectura.

Lo que describo a continuacion es una especie de documentacion del codigo de los controladores que e ido usando para establecer los flujos de trabajo , dado que estoy usando laravel como framework para el desarrollo del backend, son controllers.

Primero dividi en la ruta app/Htpp/Controllers las subcarpetas admin y sitio , por que? bueno , po9r que al hacernos una imagen mental del proyecto cuya finalidad es tener un sitio web donde se registren sitios turisticos del departamento de La Paz , y tambien que e implementaran funciones de gestion de los mismo, da como resultado la division de dos grandes partesque serian la parte publica(sitio) y la parte privada (admin) todo con el objetivo de mantener una mediana trazabilidad.

ADMIN

loginController.php 

basicamente hacemo


paso a paso de apache 24

descargamos la paqueteria
descomprimimos
nos vamos al archivo httpd.conf
hacemos:

Define SRVROOT "D:\httpd-2.4.66-260223-Win64-VS18\Apache24"

ServerRoot "${SRVROOT}"

DocumentRoot "D:/proyecto/proyecto-turistico/public"
<Directory "ruta del proyecto">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

Listen 127.0.0.1:80

# --- INICIO CONFIGURACION PHP ---
LoadModule php_module "D:/php-8.5.3-Win32-vs17-x64/php8apache2_4.dll"
AddType application/x-httpd-php .php
PHPIniDir "D:/php-8.5.3-Win32-vs17-x64"
# --- FIN CONFIGURACION PHP ---

-----------------------------------------------------


DocumentRoot "D:/ALN/back/proyecto-turistico/public"
<Directory "D:/ALN/back/proyecto-turistico/public">

en php.ini

extension_dir ="D:\php-8.4.5-Win32-vs17-x64\ext"
;extension=bz2
extension=curl
;extension=ffi
;extension=ftp
extension=fileinfo
;extension=gd
;extension=gettext
;extension=gmp
;extension=intl
;extension=ldap
extension=mbstring
;extension=exif      ; Must be after mbstring as it depends on it
;extension=mysqli
;extension=odbc
;extension=openssl
;extension=pdo_firebird
;extension=pdo_mysql
;extension=pdo_odbc
extension=pdo_pgsql
;extension=pdo_sqlite
extension=pgsql
;extension=shmop

upload_max_filesize = 20000M
max_file_uploads = 400
default_socket_timeout = 600
max_execution_time = 300
max_input_time = 600
memory_limit = 2048M


COMANDO PARA LANZAR APACHE

./httpd.exe  s se iinstal com srrvicio basta con rrniiciiarr lueg de instalar 

net stop Apache2.4
net start Appachee2.4

instalamos composer en el proyeecto

composer install
