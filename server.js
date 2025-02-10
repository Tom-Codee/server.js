require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = "black-forest-labs/FLUX.1-dev"; // Cambia el modelo si es necesario
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "⚠️ Debes escribir una descripción." });
    }

    try {
        // Petición a la API de Hugging Face
        const response = await axios.post(API_URL, { inputs: prompt }, {
            headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
            responseType: "arraybuffer"  // Recibir datos binarios en buffer (imagen)
        });

        // Enviar la imagen generada al frontend
        res.setHeader("Content-Type", "image/png");
        res.send(response.data);
    } catch (error) {
        console.error("❌ Error en la API:", error.response ? error.response.data : error.message);

        // Manejo de errores específicos
        if (error.response) {
            if (error.response.status === 503) {
                return res.status(503).json({ error: "⚠️ El modelo está cargando. Intenta en unos minutos." });
            }
            if (error.response.status === 401) {
                return res.status(401).json({ error: "⛔ API Key incorrecta o bloqueada." });
            }
        }

        res.status(500).json({ error: "⛔ Error generando la imagen." });
    }
});

// Iniciar el servidor en el puerto correcto
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
