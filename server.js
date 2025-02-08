require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "⚠️ Debes escribir una descripción." });
    }

    try {
        // Petición a Replicate
        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
                input: {
                    prompt: prompt,
                    scheduler: "K_EULER",  // Agregando scheduler como en tu ejemplo de Replicate
                    width: 512,
                    height: 512,
                    num_outputs: 1
                }
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
            await new Promise(resolve => setTimeout(resolve, 3000));
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
        console.error("❌ Error en la API:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: "⛔ Error generando la imagen.", 
            details: error.response ? error.response.data : error.message
        });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
