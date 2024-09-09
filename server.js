const express = require('express');
const path = require('path');

const app = express();
const PORT = 4000; 

// Servir los archivos estáticos de la raíz del proyecto
app.use(express.static(__dirname));

// Definir la ruta para servir tu archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
