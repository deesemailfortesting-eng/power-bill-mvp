import OpenAI from 'openai';
import { buildRecommendations, matchTariff } from '@/lib/tariff';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    providerName: { type: 'string' },
    customerName: { type: 'string' },
    accountType: {
      type: 'string',
      enum: ['residential', 'commercial']
    },
    billingPeriodStart: { type: 'string' },
    billingPeriodEnd: { type: 'string' },
    totalAmount: { type: 'number' },
    currency: { type: 'string' },
    monthlyKwh: { type: 'number' },
    totalKwh: { type: 'number' },
    peakKwh: { type: 'number' },
    offPeakKwh: { type: 'number' },
    demandKw: { type: 'number' },
    powerFactor: { type: 'number' }
  },
  required: [
    'providerName',
    'customerName',
    'accountType',
    'billingPeriodStart',
    'billingPeriodEnd',
    'totalAmount',
    'currency',
    'monthlyKwh',
    'totalKwh',
    'peakKwh',
    'offPeakKwh',
    'demandKw',
    'powerFactor'
  ]
};

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'Missing OPENAI_API_KEY.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('bill');

    if (!(file instanceof File) || file.type !== 'application/pdf') {
      return Response.json({ error: 'Please upload a valid PDF in field "bill".' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Pdf = Buffer.from(bytes).toString('base64');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Extract all requested fields from this electricity bill PDF. If missing, infer conservative numeric defaults as 0 and empty strings for text fields.'
            },
            {
              type: 'input_file',
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64Pdf}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'bill_extraction',
          strict: true,
          schema
        }
      }
    });

    const extractedBillData = JSON.parse(response.output_text);
    const matchedTariff = matchTariff(extractedBillData);
    const recommendations = buildRecommendations(extractedBillData, matchedTariff);

    return Response.json({
      extractedBillData,
      matchedTariff,
      recommendations
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to analyze bill at this time.' }, { status: 500 });
  }
}
