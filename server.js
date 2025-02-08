require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "⚠️ Debes escribir una descripción." });
    }

    try {
        // Petición a la API de Hugging Face
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
            { inputs: prompt },
            {
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.error) {
            throw new Error(response.data.error);
        }

        res.json({ imageUrl: response.data });
    } catch (error) {
        console.error("❌ Error en la API:", error);
        res.status(500).json({ error: "⛔ Error generando la imagen." });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
