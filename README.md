# Power Bill Analyzer MVP

A minimal Next.js (App Router) app for uploading a power bill PDF and extracting structured fields via the OpenAI API.

## Features

- Single-page UI with:
  - PDF upload input
  - **Analyze Bill** button
  - Rendered sections for extracted bill data, matched tariff, and recommendations
- API route: `POST /api/analyze`
  - Accepts `multipart/form-data`
  - Expects a PDF file under field name `bill`
  - Calls OpenAI using Structured Outputs JSON schema
- Local demo tariff dataset at `tariffs/demo_tariffs.json`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your OpenAI API key in `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## API contract

### `POST /api/analyze`

- Content type: `multipart/form-data`
- Form field: `bill` (`application/pdf`)

Response shape:

```json
{
  "extractedBillData": { "...": "..." },
  "matchedTariff": { "...": "..." },
  "recommendations": ["..."]
}
```

## Notes

- This is a demo MVP. Tariff matching and recommendations are intentionally simple heuristics.
- The API route returns an error if `OPENAI_API_KEY` is missing.
