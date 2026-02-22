'use client';

import { useState } from 'react';

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onAnalyze() {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('bill', file);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>⚡ Power Bill Analyzer MVP</h1>
      <p className="muted">
        Upload a utility bill PDF, extract key fields with Structured Outputs, and get a demo tariff recommendation.
      </p>

      <section className="card">
        <h2>Upload Bill</h2>
        <div className="row">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button onClick={onAnalyze} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze Bill'}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {result ? (
        <>
          <section className="card">
            <h2>1) Extracted Bill Data</h2>
            <pre>{JSON.stringify(result.extractedBillData, null, 2)}</pre>
          </section>

          <section className="card">
            <h2>2) Matched Tariff</h2>
            <pre>{JSON.stringify(result.matchedTariff, null, 2)}</pre>
          </section>

          <section className="card">
            <h2>3) Recommendations</h2>
            <ul>
              {result.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  );
}
