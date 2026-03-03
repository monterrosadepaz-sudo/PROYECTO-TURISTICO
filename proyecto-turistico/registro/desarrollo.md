SISTEMA - TURISTICO

dia 28/1/2026

En cumplimiento con el deber de el desarrollo de "horas profesionales" de MEGATEC_ITCA, nuestro grupo aocrdo el desarrollo de este sistema.

Por mi parte , yo Julio Alberto Depaz Monterroza , soy el encargado de el desarrollo del backend, considerese que para el desarrollo de este sistema , se decidio cambiar la arquitectura de MVC a API firts (estructura desacoplada, o estructura frontend-backend , como sea mas facil identificarlo) haciendo incapie en el hecho que el ing a cargo de la supervision del desarrollo del mismo, ing. Heber Mijango , especifico durante la etapa de plaeacion que el equipo de desarrollo podia decidir con total libertad su propio procedimiento de desarollo sin tener reglas claras, e ahi el motivo del cambio de arquitectura.

Lo que describo a continuacion es una especie de documentacion del codigo de los controladores que e ido usando para establecer los flujos de trabajo , dado que estoy usando laravel como framework para el desarrollo del backend, son controllers.

Primero dividi en la ruta app/Htpp/Controllers las subcarpetas admin y sitio , por que? bueno , po9r que al hacernos una imagen mental del proyecto cuya finalidad es tener un sitio web donde se registren sitios turisticos del departamento de La Paz , y tambien que e implementaran funciones de gestion de los mismo, da como resultado la division de dos grandes partesque serian la parte publica(sitio) y la parte privada (admin) todo con el objetivo de mantener una mediana trazabilidad.

ADMIN

loginController.php 

basicamente hacemo