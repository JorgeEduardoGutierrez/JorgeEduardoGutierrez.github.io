const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public')); // Servir archivos estáticos desde la carpeta 'public'

// Endpoint para obtener información de los experimentos
app.get('/api/experimentos', (req, res) => {
    const dataDir = path.join(__dirname, 'data');

    // Leer carpetas en el directorio 'data'
    fs.readdir(dataDir, (err, folders) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el directorio de datos' });
        }

        const experimentos = [];

        // Leer cada carpeta de experimento
        folders.forEach(folder => {
            const folderPath = path.join(dataDir, folder);
            const configPath = path.join(folderPath, 'config.json');

            // Verificar si la carpeta contiene un archivo config.json
            if (fs.statSync(folderPath).isDirectory() && fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                experimentos.push({
                    nombre: folder,
                    descripcion: config.Descripcion,
                    configuracion: config,
                    archivos: {
                        json: 'tensorflow.json',
                        imagen: 'pie_chart.png',
                        videos: fs.readdirSync(folderPath)
                            .filter(file => file.startsWith('video') && file.endsWith('.mp4'))
                    }
                });
            }
        });

        res.json(experimentos);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
