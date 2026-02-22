import tariffs from '@/tariffs/demo_tariffs.json';

function estimateMonthlyKwh(extractedBillData) {
  if (typeof extractedBillData.monthlyKwh === 'number') {
    return extractedBillData.monthlyKwh;
  }

  if (typeof extractedBillData.totalKwh === 'number') {
    return extractedBillData.totalKwh;
  }

  return 0;
}

export function matchTariff(extractedBillData) {
  const usage = estimateMonthlyKwh(extractedBillData);
  const accountType = (extractedBillData.accountType || 'residential').toLowerCase();

  const sameType = tariffs.filter((tariff) => tariff.category === accountType);
  const pool = sameType.length ? sameType : tariffs;

  return (
    pool.find((tariff) => usage <= tariff.maxMonthlyKwh) ||
    pool[pool.length - 1]
  );
}

export function buildRecommendations(extractedBillData, matchedTariff) {
  const recs = [];
  const usage = estimateMonthlyKwh(extractedBillData);

  recs.push(`Current best demo match: ${matchedTariff.name}.`);

  if (usage > 0 && usage > 800) {
    recs.push('Usage is high: consider shifting heavy appliances to off-peak hours.');
  }

  if ((extractedBillData.peakKwh || 0) > (extractedBillData.offPeakKwh || 0)) {
    recs.push('Peak usage exceeds off-peak usage; time-of-use optimization may reduce costs.');
  }

  if (typeof extractedBillData.powerFactor === 'number' && extractedBillData.powerFactor < 0.95) {
    recs.push('Power factor is below 0.95; consider correction equipment to avoid penalties.');
  }

  if (recs.length === 1) {
    recs.push('Your consumption profile looks stable; monitor month-over-month changes for anomalies.');
  }

  return recs;
}
