# OCR Server (Tesseract + PDF) en Railway

## Endpoints

- `POST /ocr-image`
  - Body JSON: `{ "imageBase64": "..." }`
  - Devuelve: `{ "text": "..." }`

- `POST /ocr-pdf`
  - Body JSON: `{ "pdfBase64": "..." }`
  - Devuelve: `{ "text": "..." }`

## Ejemplo consumo (JS)

```js
const res = await fetch("https://TU_URL/ocr-image", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ imageBase64 })
});
const data = await res.json();
console.log(data.text);
