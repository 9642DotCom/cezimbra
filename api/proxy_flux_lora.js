// Proxy Node.js para multimodalart/flux-lora-the-explorer
// Requer: npm i express @gradio/client cors

import express from "express";
import cors from "cors";
import { Client } from "@gradio/client";

const app = express();
app.use(cors());
app.use(express.json({limit: '2mb'}));

app.post("/api/flux-lora", async (req, res) => {
  try {
    const { prompt } = req.body;
    const client = await Client.connect("multimodalart/flux-lora-the-explorer");
    const result = await client.predict("/run_lora", {
      prompt,
      image_input: null,
      image_strength: 0.75,
      cfg_scale: 3.5,
      steps: 28,
      randomize_seed: true,
      seed: 0,
      width: 1024,
      height: 1024,
      lora_scale: 0.95
    });
    // result.data[0] = url da imagem
    res.json({ image: result.data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro no proxy.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy Flux-Lora rodando em http://localhost:${PORT}/api/flux-lora`);
});
