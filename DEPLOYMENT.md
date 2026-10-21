# Despliegue en Azure

1. Configura `.env` con secretos aleatorios únicos y la dirección pública del servidor en `SITE_ADDRESS`. `CORS_ALLOWED_ORIGINS` debe ser el origen HTTPS exacto, por ejemplo `https://<IP-pública>`.
2. En la NSG y el firewall del servidor permite TCP 80 y 443; no publiques los puertos de PostgreSQL, MongoDB, Redis ni los servicios internos.
3. Despliega desde esta carpeta con `docker compose up -d --build`.
4. Caddy redirige HTTP a HTTPS, usa la IP como SNI predeterminado para clientes que omiten SNI al conectarse por IP y solicita/renueva un certificado ACME de corta duración. Conserva los volúmenes `caddy_data` y `caddy_config` para mantener el estado de ACME.
5. Revisa la emisión del certificado con `docker compose logs caddy` y confirma el sitio con `curl -I https://<IP-pública>`.

La Gateway, catalog-service y cart-service validan los tokens HS256 con el mismo `JWT_SECRET` que users-service. Los carritos se asocian al `userId` firmado en el token; los identificadores enviados por el cliente se ignoran.

Las contraseñas y el secreto JWT ya se rotaron en el `.env` local, que no se versiona. Al cambiar `JWT_SECRET` se invalidan los tokens emitidos anteriormente.
