/**
 * Add this file to the SAME Google Apps Script project as Code.gs.
 * It lets the demo POS automatically add a frontend catalog item to the
 * Google Sheets Products sheet when the demo catalog contains a product that
 * is not in the seeded sheet yet.
 */

function syncProduct_(data) {
  data = data || {};

  const sheet = getSheet_(CONFIG.sheets.products);
  const rows = readSheetObjects_(CONFIG.sheets.products);

  const model = String(data.model || '').trim();
  const sku = String(data.sku || '').trim();
  const name = String(data.name || '').trim();

  let existing = rows.find(function(row) {
    return (model && String(row.model).toLowerCase() === model.toLowerCase()) ||
           (sku && String(row.sku).toLowerCase() === sku.toLowerCase()) ||
           (name && String(row.name).toLowerCase() === name.toLowerCase());
  });

  if (existing) {
    return { success: true, product: existing, existing: true };
  }

  const product = [
    'PRD-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
    data.brandId || '',
    data.brandName || '',
    sku || ('SKU-' + Utilities.getUuid().substring(0, 6).toUpperCase()),
    model,
    name || model,
    '',
    data.category || '',
    Number(data.unitPrice || 0),
    Math.max(0, Number(data.stock || 0)),
    data.active !== false,
    data.image || '',
    new Date()
  ];

  appendRows_(sheet, [product]);

  return {
    success: true,
    product: rowToObject_(CONFIG.sheets.products, product),
    existing: false
  };
}

/* Extend the existing router without changing Code.gs. */
function routeRequest_(method, action, data, params) {
  action = String(action || '').trim();

  if (action === 'syncProduct') {
    return syncProduct_(data);
  }

  return routeRequestOriginal_(method, action, data, params);
}
