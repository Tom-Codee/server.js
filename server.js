require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors()); // Permitir conexiones desde el frontend
app.use(express.json()); // Soportar JSON en las peticiones

const PORT = process.env.PORT || 8080;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

app.get("/", (req, res) => {
    res.send("🚀 API de Generación de Imágenes está funcionando correctamente.");
});

app.post("/generate-image", async (req, res) => {
    const prompt = req.body.prompt || req.body.text;  // Acepta "prompt" y "text"

    if (!prompt) {
        return res.status(400).json({ error: "⚠️ Debes escribir una descripción." });
    }

    try {
        // Petición a Replicate
        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // <-- Usar el ID correcto de Replicate

                input: { prompt: prompt }
            },
            {
                headers: {
                    "Authorization": `Token ${REPLICATE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const prediction = response.data;
        let imageUrl = null;

        // Esperar hasta que la imagen esté lista
        while (!imageUrl) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Espera 3s
            const result = await axios.get(prediction.urls.get, {
                headers: { "Authorization": `Token ${REPLICATE_API_KEY}` }
            });

            if (result.data.status === "succeeded") {
                imageUrl = result.data.output[0];
            } else if (result.data.status === "failed") {
                throw new Error("⛔ Error generando la imagen.");
            }
        }

        res.json({ imageUrl });
    } catch (error) {
        console.error("❌ Error en la API:", error);
        res.status(500).json({ error: "⛔ Error generando la imagen." });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
