# Google Maps de desarrollo

Configurar `public/config/google-maps.local.json` copiando `public/config/google-maps.example.json`.
Colocar la Demo Key en `apiKey`. El archivo local está ignorado por Git y Angular lo sirve como asset.
Si falta el archivo o la key, se muestra un fallback sin solicitar Google Maps.

`demoCenter` es un punto aproximado de demostración, NO la ubicación aprobada de LDF Projects.
El mapa y su marker se rotulan como demostración cuando se usa. Las coordenadas de
`seller.location.coordinates`, cuando estén aprobadas, tienen prioridad.

En producción, suministrar el mismo JSON con la key productiva y su `mapId`, eliminando
`demoCenter`. No requiere modificar SellerLocation. El JSON y la browser API key son
públicos en el cliente; ignorarlos en Git evita versionarlos, no los oculta al navegador.
No subir la Demo Key como configuración productiva.

Carga: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
Marker: https://developers.google.com/maps/documentation/javascript/advanced-markers/add-marker
