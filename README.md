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

Demo 002/003: mock only. Tickets fingidos en memoria. Sin xAI, Linear ni Supabase.
