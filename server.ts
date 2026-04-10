import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HISTORY_FILE = path.join(process.cwd(), "history.json");

  app.use(express.json());

  // Ensure history file exists
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
  }

  // API: Get History
  app.get("/api/history", (req, res) => {
    try {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read history" });
    }
  });

  // API: Save Analysis
  app.post("/api/history", (req, res) => {
    try {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      const history = JSON.parse(data);
      const newEntry = {
        id: Date.now().toString(),
        ...req.body,
        timestamp: Date.now()
      };
      
      // Keep only last 20 entries
      const updatedHistory = [newEntry, ...history].slice(0, 20);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
      
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to save history" });
    }
  });

  // API: Delete Entry
  app.delete("/api/history/:id", (req, res) => {
    try {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      const history = JSON.parse(data);
      const updatedHistory = history.filter((entry: any) => entry.id !== req.params.id);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete entry" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
