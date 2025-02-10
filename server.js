require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = "black-forest-labs/FLUX.1-dev";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

// 🔄 Mantener Railway activo (Keep Alive cada 5 minutos)
setInterval(() => {
    axios.get("https://serverjs-production-429f.up.railway.app/")
        .then(() => console.log("🔄 Keep-Alive enviado a Railway"))
        .catch(err => console.error("⚠️ Error en Keep-Alive:", err));
}, 300000); // 300000ms = 5 minutos

// 📡 Ruta para verificar que el servidor está activo
app.get("/", (req, res) => {
    console.log("✅ Solicitud GET en /");
    res.send("✅ Servidor de generación de imágenes IA activo 🚀");
});

// 🎨 Ruta POST para generar imágenes
app.post("/generate-image", async (req, res) => {
    console.log("📡 Recibida solicitud POST en /generate-image");

    const { prompt } = req.body;
    if (!prompt) {
        console.log("⚠️ Error: No se recibió prompt");
        return res.status(400).json({ error: "⚠️ Debes escribir una descripción." });
    }

    try {
        console.log(`📡 Enviando petición a Hugging Face con prompt: ${prompt}`);

        const response = await axios.post(API_URL, { inputs: prompt }, {
            headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
            responseType: "arraybuffer"
        });

        console.log("✅ Imagen generada con éxito.");
        res.setHeader("Content-Type", "image/png");
        res.send(response.data);
    } catch (error) {
        console.error("❌ Error en la API de Hugging Face:", error.response ? error.response.data : error.message);

        if (error.response) {
            if (error.response.status === 503) {
                return res.status(503).json({ error: "⚠️ El modelo está cargando. Intenta en unos minutos." });
            }
            if (error.response.status === 401) {
                return res.status(401).json({ error: "⛔ API Key incorrecta o bloqueada." });
            }
            return res.status(error.response.status).json({ error: error.response.data });
        }

        res.status(500).json({ error: "⛔ Error generando la imagen." });
    }
});

// 🚀 Iniciar el servidor en Railway
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
