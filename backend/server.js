// backend/server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const REPOSITORY_NAME = process.env.REPOSITORY_NAME;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para obtener contenido de una ruta específica en GitHub
app.get('/api/github/contents/*', async (req, res) => {
    const path = req.params[0];
    const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPOSITORY_NAME}/contents/${path}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw' // Para obtener contenido sin base64
            }
        });

        if (response.status === 404) {
            return res.status(404).json({ error: 'Archivo o carpeta no encontrada.' });
        }

        if (!response.ok) {
            return res.status(response.status).json({ error: `Error de GitHub API: ${response.statusText}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error al comunicarse con la API de GitHub:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Servir archivos estáticos del frontend
app.use('/', express.static('../frontend'));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
