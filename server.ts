import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave de API do Gemini (GEMINI_API_KEY) não está configurada no painel de segredos (Secrets) do seu projeto no AI Studio. Vá em Settings > Secrets e configure a variável GEMINI_API_KEY para habilitar a busca online por Inteligência Artificial.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to generate chords dynamically using Gemini
  app.post("/api/generate-chords", async (req: any, res: any) => {
    try {
      const { title, artist, originalKey } = req.body;
      if (!title || !artist) {
        return res.status(400).json({ error: "Title and artist are required." });
      }

      const ai = getAiClient();
      const prompt = `Gere a cifra de violão completa em português da música "${title}" do artista "${artist}".
Regras estritas:
1. O tom original deve ser "${originalKey || 'C'}".
2. Use o formato clássico padrão: os acordes (cifras) devem estar alinhados na linha de CIMA exatamente acima das sílabas e palavras correspondentes das letras na linha de baixo.
3. Organize a música com identificadores de seção entre colchetes como [Intro], [Verso 1], [Refrão], [Verso 2], [Ponte]. No [Intro] e solos, apenas indique a sequência de acordes.
4. Escreva a letra completa com os acordes.
5. NÃO coloque textos explicativos ou cabeçalhos sobre a IA. Retorne apenas o texto da cifra formatado diretamente.`;

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let cifraText = "";
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Tentando gerar cifra com o modelo ${modelName}...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          cifraText = response.text || "";
          if (cifraText && cifraText.trim()) {
            console.log(`Música gerada com sucesso usando o modelo: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`Aviso: Erro ao tentar com ${modelName}:`, err.message || err);
          lastError = err;
        }
      }

      if (!cifraText || !cifraText.trim()) {
        const errMsg = lastError?.message || "O servidor de IA retornou uma resposta sem conteúdo.";
        throw new Error(`Falha nos modelos de IA (${modelsToTry.join(", ")}). Erro detalhado: ${errMsg}`);
      }

      res.json({ cifra: cifraText });
    } catch (e: any) {
      console.error("Gemini Cifra generation error:", e);
      res.status(500).json({ error: e.message || "Failed to generate chords using Gemini." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
