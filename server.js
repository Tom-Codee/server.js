require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY; // 🔹 Obtenemos la API Key de Railway

app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "⚠️ Debes escribir una descripción." });
    }

    try {
        const response = await axios.post(
            "https://api.deepai.org/api/text2img",
            { text: prompt },  // 🔹 Enviamos el prompt como parámetro
            {
                headers: {
                    "Api-Key": DEEPAI_API_KEY, // ✅ Agregamos la API Key en los headers
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ imageUrl: response.data.output_url });
    } catch (error) {
        console.error("❌ Error en la API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "⛔ Error generando la imagen." });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
