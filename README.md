# Vox

Hackathon VoxPM. Persona A = motor de datos. Persona B = PWA.

Los comentarios son mock. No hay llamadas a xAI.

## Como correrlo

node server/index.js

Abre http://localhost:3000

GET /api/comentarios
GET /api/comentarios?severity=high&es_bug=true&feature=latencia
GET /api/tickets
POST /api/tickets

A toca server/ mock/ shared/
B toca public/

Demo 002/003: mock only. El feed filtrado es lo que llega (las tarjetas son el trabajo).
`GET`/`POST /api/tickets` sigue en el server para un umbral automático después; la UI ya no crea tickets a mano.
Sin xAI, Linear ni Supabase.
