DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS Categorias CASCADE;
DROP TABLE IF EXISTS Plantillas CASCADE;
DROP TABLE IF EXISTS Solicitud_plantilla CASCADE;
DROP TABLE IF EXISTS Preformularios CASCADE;
DROP TABLE IF EXISTS respuestas_preformularios CASCADE;
DROP TABLE IF EXISTS Publicaciones CASCADE;
DROP TABLE IF EXISTS Multimedia CASCADE;
DROP TABLE IF EXISTS HistorialPlantillas CASCADE;

CREATE TABLE Usuarios (
    idUsuario UUID,
    nombre VARCHAR(100),
    email VARCHAR(150),
    passwordd TEXT,
    rol VARCHAR(200),
    fechaRegistro TIMESTAMP
);

CREATE TABLE Categorias (
    idCategoria UUID,
    nombre VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE Plantillas (
    idPlantilla UUID,
    nombre VARCHAR(100),
    descripcion TEXT,
    contenido TEXT,
    estado VARCHAR(30),
    idCategoria UUID,
    fechaCreacion TIMESTAMP
);

CREATE TABLE Solicitud_plantilla (
    idSolicitud UUID,
    nombrePropuesta VARCHAR(100),
    descripcionPropuesta TEXT,
    contenidoPropuesto TEXT,
    estado VARCHAR(20),
    fechaSolicitud TIMESTAMP,
    revisadoPor UUID
);

CREATE TABLE Preformularios (
    idPreformulario UUID,
    nombre VARCHAR(100),
    descripcion TEXT,
    fechaCreacion TIMESTAMP
);

CREATE TABLE respuestas_preformularios (
    idRespuesta UUID,
    idPreformulario UUID,
    nombreSitio VARCHAR(150),
    descripcionLugar TEXT,
    ubicacion VARCHAR(200),
    tipoLugar VARCHAR(50),
    nombrePersona VARCHAR(100),
    horario VARCHAR(100),
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    fechaRespuesta TIMESTAMP,
    recomendaciones TEXT
);

CREATE TABLE Publicaciones (
    idPublicacion UUID,
    idPlantilla UUID,
    idRespuesta UUID,
    contenidoFinal TEXT,
    fechaPublicacion TIMESTAMP,
    estado VARCHAR(20)
);

CREATE TABLE Multimedia (
    idMedia UUID,
    idPublicacion UUID,
    tipo VARCHAR(20),
    imagen BYTEA,
    descripcion TEXT
);

CREATE TABLE HistorialPlantillas (
    idHistorial UUID,
    idPlantilla UUID,
    contenido TEXT,
    fechaCambio TIMESTAMP,
    cambiadoPor UUID
);

--more

DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS Categorias CASCADE;
DROP TABLE IF EXISTS Plantillas CASCADE;
DROP TABLE IF EXISTS Solicitud_plantilla CASCADE;
DROP TABLE IF EXISTS Preformularios CASCADE;
DROP TABLE IF EXISTS respuestas_preformularios CASCADE;
DROP TABLE IF EXISTS Publicaciones CASCADE;
DROP TABLE IF EXISTS Multimedia CASCADE;
DROP TABLE IF EXISTS HistorialPlantillas CASCADE;
DROP TABLE IF EXISTS Departamentos CASCADE;
DROP TABLE IF EXISTS Municipios CASCADE;
DROP TABLE IF EXISTS Distritos CASCADE;
DROP TABLE IF EXISTS Administrador CASCADE;

CREATE TABLE Usuarios (
    idUsuario UUID,
    nombre VARCHAR(100),
    email VARCHAR(150),
    passwordd TEXT,
    rol VARCHAR(200),
    fechaRegistro TIMESTAMP
);

CREATE TABLE Categorias (
    idCategoria UUID,
    nombre VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE Plantillas (
    idPlantilla UUID,
    nombre VARCHAR(100),
    descripcion TEXT,
    contenido TEXT,
    estado VARCHAR(30),
    idCategoria UUID,
    fechaCreacion TIMESTAMP
);

CREATE TABLE Solicitud_plantilla (
    idSolicitud UUID,
    nombrePropuesta VARCHAR(100),
    descripcionPropuesta TEXT,
    contenidoPropuesto TEXT,
    estado VARCHAR(20),
    fechaSolicitud TIMESTAMP,
    revisadoPor UUID
);

CREATE TABLE Preformularios (
    idPreformulario UUID,
    nombre VARCHAR(100),
    descripcion TEXT,
    fechaCreacion TIMESTAMP
);

CREATE TABLE respuestas_preformularios (
    idRespuesta UUID,
    idPreformulario UUID,
    nombreSitio VARCHAR(150),
    descripcionLugar TEXT,
    ubicacion VARCHAR(200),
    tipoLugar VARCHAR(50),
    nombrePersona VARCHAR(100),
    horario VARCHAR(100),
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    fechaRespuesta TIMESTAMP,
    recomendaciones TEXT
);

CREATE TABLE Publicaciones (
    idPublicacion UUID,
    idPlantilla UUID,
    idRespuesta UUID,
    contenidoFinal TEXT,
    fechaPublicacion TIMESTAMP,
    estado VARCHAR(20)
);

CREATE TABLE Multimedia (
    idMedia UUID,
    idPublicacion UUID,
    tipo VARCHAR(20),
    imagen BYTEA,
    descripcion TEXT
);

CREATE TABLE HistorialPlantillas (
    idHistorial UUID,
    idPlantilla UUID,
    contenido TEXT,
    fechaCambio TIMESTAMP,
    cambiadoPor UUID
);

CREATE TABLE Departamentos (
    idDepartamento UUID,
    nombre VARCHAR(100),
    codigo VARCHAR(10),
    capital VARCHAR(100),
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    descripcion TEXT
);

CREATE TABLE Municipios (
    idMunicipio UUID,
    idDepartamento UUID,
    nombre VARCHAR(100),
    codigo VARCHAR(10),
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    descripcion TEXT
);

CREATE TABLE Distritos (
    idDistrito UUID,
    idMunicipio UUID,
    nombre VARCHAR(100),
    codigo VARCHAR(10),
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    descripcion TEXT
);

CREATE TABLE Administrador (
    idAdmin UUID,
    nombre VARCHAR(100),
    email VARCHAR(150),
    passwordd TEXT,
    telefono VARCHAR(20),
    direccion TEXT,
    fechaRegistro TIMESTAMP,
    activo BOOLEAN
);

CREATE TABLE sitios_turisticos (
    idlugar UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    clasificacion TEXT[],
    politicas JSONB,
    horarios JSONB,
    costo_entrada NUMERIC(5,2),
    fecha_registro TIMESTAMP DEFAULT NOW()
);


	GRANT CONNECT ON DATABASE "dbTurismo" TO alberto19;
	GRANT USAGE ON SCHEMA public TO alberto19;
	GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO alberto19;
	GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO alberto19;
	GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO alberto19;
	
	ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO alberto19;
	
	ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO alberto19;
	
	ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT EXECUTE ON FUNCTIONS TO alberto19;

SELECT usename FROM pg_user;

--DROP funciones existentes

DROP FUNCTION insertar_respuesta( UUID, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DECIMAL, DECIMAL, TEXT ); DROP FUNCTION insertar_publicacion( UUID, UUID, TEXT, VARCHAR ); DROP FUNCTION insertar_multimedia( UUID, VARCHAR, BYTEA, TEXT ); DROP FUNCTION aprobar_solicitud_plantilla( UUID, UUID, UUID );


--PA verdaderos

-- Procedimiento de inserción en preformulario
CREATE OR REPLACE PROCEDURE insertar_respuesta(
    p_idPreformulario UUID,
    p_nombreSitio VARCHAR,
    p_descripcionLugar TEXT,
    p_ubicacion VARCHAR,
    p_tipoLugar VARCHAR,
    p_nombrePersona VARCHAR,
    p_horario VARCHAR DEFAULT NULL,
    p_latitud DECIMAL(9,6) DEFAULT NULL,
    p_longitud DECIMAL(9,6) DEFAULT NULL,
    p_recomendaciones TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_nombreSitio IS NULL OR p_nombreSitio = '' THEN
        RAISE EXCEPTION 'El nombre del sitio es obligatorio';
    END IF;
    IF p_descripcionLugar IS NULL OR p_descripcionLugar = '' THEN
        RAISE EXCEPTION 'La descripción del lugar es obligatoria';
    END IF;
    IF p_ubicacion IS NULL OR p_ubicacion = '' THEN
        RAISE EXCEPTION 'La ubicación es obligatoria';
    END IF;
    IF p_tipoLugar IS NULL OR p_tipoLugar = '' THEN
        RAISE EXCEPTION 'El tipo de lugar es obligatorio';
    END IF;
    IF p_nombrePersona IS NULL OR p_nombrePersona = '' THEN
        RAISE EXCEPTION 'El nombre de la persona es obligatorio';
    END IF;

    INSERT INTO respuestas_preformularios (
        idPreformulario, nombreSitio, descripcionLugar, ubicacion,
        tipoLugar, nombrePersona, horario, latitud, longitud,
        recomendaciones, fechaRespuesta
    )
    VALUES (
        p_idPreformulario, p_nombreSitio, p_descripcionLugar, p_ubicacion,
        p_tipoLugar, p_nombrePersona, p_horario, p_latitud, p_longitud,
        p_recomendaciones, NOW()
    );
END;
$$;

-- Procedimiento de inserción de publicación
CREATE OR REPLACE PROCEDURE insertar_publicacion(
    p_idPlantilla UUID,
    p_idRespuesta UUID,
    p_contenidoFinal TEXT,
    p_estado VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_contenidoFinal IS NULL OR p_contenidoFinal = '' THEN
        RAISE EXCEPTION 'El contenido final es obligatorio';
    END IF;
    IF p_estado NOT IN ('borrador','publicado') THEN
        RAISE EXCEPTION 'Estado inválido';
    END IF;

    INSERT INTO Publicaciones (
        idPlantilla, idRespuesta, contenidoFinal, fechaPublicacion, estado
    )
    VALUES (
        p_idPlantilla, p_idRespuesta, p_contenidoFinal, NOW(), p_estado
    );
END;
$$;

-- Procedimiento de inserción de multimedia
CREATE OR REPLACE PROCEDURE insertar_multimedia(
    p_idPublicacion UUID,
    p_tipo VARCHAR,
    p_imagen BYTEA,
    p_descripcion TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_tipo NOT IN ('imagen','video','mapa','360') THEN
        RAISE EXCEPTION 'Tipo inválido';
    END IF;
    IF p_imagen IS NULL THEN
        RAISE EXCEPTION 'La imagen/video es obligatorio';
    END IF;

    INSERT INTO Multimedia (
        idPublicacion, tipo, imagen, descripcion
    )
    VALUES (
        p_idPublicacion, p_tipo, p_imagen, p_descripcion
    );
END;
$$;

-- Procedimiento aprobar solicitud de plantilla
CREATE OR REPLACE PROCEDURE aprobar_solicitud_plantilla(
    p_idSolicitud UUID,
    p_idAdmin UUID,
    p_idCategoria UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_nombre VARCHAR;
    v_descripcion TEXT;
    v_contenido TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM solicitud_plantilla WHERE idSolicitud = p_idSolicitud
    ) THEN
        RAISE EXCEPTION 'La solicitud no existe';
    END IF;

    SELECT nombrePropuesta, descripcionPropuesta, contenidoPropuesto
    INTO v_nombre, v_descripcion, v_contenido
    FROM solicitud_plantilla
    WHERE idSolicitud = p_idSolicitud;

    UPDATE solicitud_plantilla
    SET estado = 'aprobada',
        revisadoPor = p_idAdmin
    WHERE idSolicitud = p_idSolicitud;

    INSERT INTO Plantillas (
        nombre, descripcion, contenido, estado, idCategoria, fechaCreacion
    )
    VALUES (
        v_nombre, v_descripcion, v_contenido, 'aprobada', p_idCategoria, NOW()
    );
END;
$$;

--login usuario(todos)
CREATE OR REPLACE PROCEDURE login_usuario(
    p_usuario VARCHAR,
    p_contrasena VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM usuarios
    WHERE usuario = p_usuario
      AND contrasena = p_contrasena;

    IF v_count > 0 THEN
        RAISE NOTICE 'Login usuario exitoso: %', p_usuario;
    ELSE
        RAISE EXCEPTION 'Credenciales inválidas para usuario';
    END IF;
END;
$$;

--login tabla admin(no se utiliza de momento)
CREATE OR REPLACE PROCEDURE login_administrador(
    p_usuario VARCHAR,
    p_contrasena VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM administrador
    WHERE usuario = p_usuario
      AND contrasena = p_contrasena;

    IF v_count > 0 THEN
        RAISE NOTICE 'Login administrador exitoso: %', p_usuario;
    ELSE
        RAISE EXCEPTION 'Credenciales inválidas para administrador';
    END IF;
END;
$$;

-- Procedimiento insertar departamento 
CREATE OR REPLACE PROCEDURE insertar_departamento(
p_idDepartamento UUID,
p_nombre VARCHAR,
p_codigo VARCHAR
) 
LANGUAGE plpgsql 
AS $$ 
BEGIN 
IF p_nombre IS NULL OR p_nombre = '' THEN RAISE EXCEPTION 'El nombre del departamento es obligatorio';
	END IF; 
	INSERT INTO Departamentos (idDepartamento, nombre, codigo)
	VALUES (p_idDepartamento, p_nombre, p_codigo);
	END;
	$$;

-- Procedimiento insertar municipio 
CREATE OR REPLACE PROCEDURE insertar_municipio(
p_idMunicipio UUID,
p_nombre VARCHAR,
p_idDepartamento UUID,
p_codigo VARCHAR,
p_latitud DECIMAL DEFAULT NULL, p_longitud DECIMAL DEFAULT NULL, p_descripcion TEXT DEFAULT NULL )
LANGUAGE plpgsql 
AS $$ 
BEGIN 
IF p_nombre IS NULL OR p_nombre = '' THEN RAISE EXCEPTION 'El nombre del municipio es obligatorio';
END IF;
INSERT INTO Municipios (idMunicipio, nombre, idDepartamento, codigo, latitud, longitud, descripcion)
VALUES (p_idMunicipio, p_nombre, p_idDepartamento, p_codigo, p_latitud, p_longitud, p_descripcion);
END;
$$; 

-- Procedimiento insertar distrito 
CREATE OR REPLACE PROCEDURE insertar_distrito(
p_idDistrito UUID,
p_nombre VARCHAR,
p_idMunicipio UUID,
p_codigo VARCHAR 
) 
LANGUAGE plpgsql 
AS $$ 
BEGIN 
IF p_nombre IS NULL OR p_nombre = '' THEN RAISE EXCEPTION 'El nombre del distrito es obligatorio';
END IF;
INSERT INTO Distritos (idDistrito, nombre, idMunicipio, codigo)
VALUES (p_idDistrito, p_nombre, p_idMunicipio, p_codigo);
END;
$$;


/*
insertar_respuesta
insertar_publicacion
insertar_multimedia
aprobar_solicitud_plantilla
login_administrador
login_usuario
insertar_departamento
insertar_municipio
insertar_distrito
insertar_administrador
insertar_usuario
*/


