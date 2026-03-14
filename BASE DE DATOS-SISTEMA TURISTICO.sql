--
-- PostgreSQL database dump
--

\restrict m87thHvZWP0yiQkQh4dk3oQrQOFGI9BU1zWn2JBQjrhOFMHFVp7fbnh3usmjpDw

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2026-03-03 19:54:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17119)
-- Name: media; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.media (
    id integer NOT NULL,
    lote_id uuid NOT NULL,
    preformulario_id uuid,
    publicacion_id uuid,
    nombre character varying(255) NOT NULL,
    tipo character varying(20) NOT NULL,
    formato character varying(10) NOT NULL,
    peso bigint NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    video_link character varying(255)
);


ALTER TABLE public.media OWNER TO julio_alberto;

--
-- TOC entry 221 (class 1259 OID 17118)
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: julio_alberto
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO julio_alberto;

--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 221
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julio_alberto
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- TOC entry 219 (class 1259 OID 16926)
-- Name: mensajes_admin; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.mensajes_admin (
    idmensaje uuid NOT NULL,
    idpublicacion uuid NOT NULL,
    remitente_id uuid NOT NULL,
    destinatario_id uuid NOT NULL,
    accion character varying(20) NOT NULL,
    comentarios text,
    respuesta_a uuid,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying
);


ALTER TABLE public.mensajes_admin OWNER TO julio_alberto;

--
-- TOC entry 218 (class 1259 OID 16918)
-- Name: mensajes_colab; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.mensajes_colab (
    idmensaje uuid NOT NULL,
    idpublicacion uuid NOT NULL,
    remitente_id uuid NOT NULL,
    destinatario_id uuid NOT NULL,
    accion character varying(20) NOT NULL,
    comentarios text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying
);


ALTER TABLE public.mensajes_colab OWNER TO julio_alberto;

--
-- TOC entry 216 (class 1259 OID 16837)
-- Name: preformularios; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.preformularios (
    idpreformulario uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario uuid NOT NULL,
    nombre text,
    departamento text,
    latitud numeric(9,6),
    longitud numeric(9,6),
    clasificacion jsonb,
    politicas jsonb,
    horarios jsonb,
    costo_entrada numeric(10,2),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    imagen character varying(255),
    municipio character varying(100),
    distrito character varying(100),
    tarifas_desglosadas jsonb,
    descripcion text,
    fecha date,
    personas integer,
    detalles jsonb
);


ALTER TABLE public.preformularios OWNER TO julio_alberto;

--
-- TOC entry 217 (class 1259 OID 16851)
-- Name: publicaciones; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.publicaciones (
    idpublicacion uuid DEFAULT gen_random_uuid() NOT NULL,
    idpreformulario uuid NOT NULL,
    idusuario uuid NOT NULL,
    aprobado_por uuid NOT NULL,
    fecha_aprobacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nombre text,
    departamento text,
    latitud numeric(9,6),
    longitud numeric(9,6),
    clasificacion jsonb,
    politicas jsonb,
    horarios jsonb,
    costo_entrada numeric(10,2),
    estado text DEFAULT 'activo'::text,
    imagen character varying(255),
    municipio character varying(100),
    distrito character varying(100),
    tarifas_desglosadas jsonb,
    descripcion text,
    fecha date,
    personas integer,
    detalles jsonb
);


ALTER TABLE public.publicaciones OWNER TO julio_alberto;

--
-- TOC entry 220 (class 1259 OID 16934)
-- Name: registro_interacciones; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.registro_interacciones (
    idregistro uuid NOT NULL,
    idpublicacion uuid NOT NULL,
    idmensaje_colab uuid,
    idmensaje_admin uuid,
    accion_colab character varying(20),
    accion_admin character varying(20),
    comentarios_colab text,
    comentarios_admin text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.registro_interacciones OWNER TO julio_alberto;

--
-- TOC entry 215 (class 1259 OID 16804)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: julio_alberto
--

CREATE TABLE public.usuarios (
    idusuario uuid NOT NULL,
    nombre text,
    email text,
    passwordd text,
    rol text,
    fecharegistro timestamp without time zone,
    foto_perfil character varying(255),
    numero character varying(20)
);


ALTER TABLE public.usuarios OWNER TO julio_alberto;

--
-- TOC entry 3299 (class 2604 OID 17122)
-- Name: media id; Type: DEFAULT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- TOC entry 3314 (class 2606 OID 17125)
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- TOC entry 3310 (class 2606 OID 16933)
-- Name: mensajes_admin mensajes_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.mensajes_admin
    ADD CONSTRAINT mensajes_admin_pkey PRIMARY KEY (idmensaje);


--
-- TOC entry 3308 (class 2606 OID 16925)
-- Name: mensajes_colab mensajes_colab_pkey; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.mensajes_colab
    ADD CONSTRAINT mensajes_colab_pkey PRIMARY KEY (idmensaje);


--
-- TOC entry 3304 (class 2606 OID 16845)
-- Name: preformularios preformularios_pkey; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.preformularios
    ADD CONSTRAINT preformularios_pkey PRIMARY KEY (idpreformulario);


--
-- TOC entry 3306 (class 2606 OID 16860)
-- Name: publicaciones publicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (idpublicacion);


--
-- TOC entry 3312 (class 2606 OID 16941)
-- Name: registro_interacciones registro_interacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.registro_interacciones
    ADD CONSTRAINT registro_interacciones_pkey PRIMARY KEY (idregistro);


--
-- TOC entry 3302 (class 2606 OID 16830)
-- Name: usuarios usuarios_pk; Type: CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pk PRIMARY KEY (idusuario);


--
-- TOC entry 3316 (class 2606 OID 16871)
-- Name: publicaciones fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT fk_admin FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 3319 (class 2606 OID 17224)
-- Name: media fk_media_preformulario; Type: FK CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT fk_media_preformulario FOREIGN KEY (preformulario_id) REFERENCES public.preformularios(idpreformulario) ON DELETE CASCADE;


--
-- TOC entry 3320 (class 2606 OID 17219)
-- Name: media fk_media_publicacion; Type: FK CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT fk_media_publicacion FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(idpublicacion) ON DELETE CASCADE;


--
-- TOC entry 3317 (class 2606 OID 16861)
-- Name: publicaciones fk_preformulario; Type: FK CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT fk_preformulario FOREIGN KEY (idpreformulario) REFERENCES public.preformularios(idpreformulario);


--
-- TOC entry 3315 (class 2606 OID 16846)
-- Name: preformularios fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.preformularios
    ADD CONSTRAINT fk_usuario FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 3318 (class 2606 OID 16866)
-- Name: publicaciones fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: julio_alberto
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT fk_usuario FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


-- Completed on 2026-03-03 19:55:07

--
-- PostgreSQL database dump complete
--

\unrestrict m87thHvZWP0yiQkQh4dk3oQrQOFGI9BU1zWn2JBQjrhOFMHFVp7fbnh3usmjpDw

