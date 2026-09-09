import express from "express";
import { exec } from "child_process";
import fs from "fs";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.post("/ocr-image", async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Falta imagen" });
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const filename = `img_${Date.now()}.png`;

  fs.writeFileSync(filename, buffer);

  exec(`tesseract ${filename} stdout -l spa+eng+osd`, (err, stdout) => {
    fs.unlinkSync(filename);

    if (err) return res.status(500).json({ error: "Error en OCR" });

    res.json({ text: stdout.trim() });
  });
});

app.post("/ocr-pdf", async (req, res) => {
  const { pdfBase64 } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ error: "Falta PDF" });
  }

  const buffer = Buffer.from(pdfBase64, "base64");
  const pdfFile = `pdf_${Date.now()}.pdf`;

  fs.writeFileSync(pdfFile, buffer);

  exec(`pdftoppm ${pdfFile} page -png`, (err) => {
    if (err) {
      fs.unlinkSync(pdfFile);
      return res.status(500).json({ error: "Error al convertir PDF"});
    }

    const files = fs.readdirSync(".").filter(f => f.startsWith("page-") && f.endsWith(".png"));

    let fullText = "";

    const processNext = () => {
      if (files.length === 0) {
        fs.unlinkSync(pdfFile);
        return res.json({ text: fullText.trim() });
      }

      const file = files.shift();

      exec(`tesseract ${file} stdout -l spa+eng+osd`, (err, stdout) => {
        fs.unlinkSync(file);

        if (!err) fullText += stdout + "\n";

        processNext();
      });
    };

    processNext();
  });
});

app.listen(3000, () => console.log("OCR listo en Railway"));
