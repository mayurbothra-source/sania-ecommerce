/**
 * SANIA – Google Sheet backend (Web App)
 *
 * Paste into: Sheet > Extensions > Apps Script. Then Deploy > New deployment > Web app.
 * Sheet columns (matched by header name, any order):
 *   SKU | Product Name | Category | Price (₹) | Image URL | XS Qty | S Qty | M Qty | L Qty | XL Qty | XXL Qty | Active (Yes/No)
 *
 * GET  -> { ok:true, products:[{ sku, name, category, price, image, sizes:{XS:n,...}, active }] }
 *         A blank size cell = size not offered; 0 = out of stock; n>0 = in stock.
 * POST -> body (text/plain JSON) { sku, size, secret? }  reduces that size's Qty by 1.
 *         -> { ok:true, sku, size, qty }  or  { ok:false, error }
 *
 * Optional protection: Project Settings > Script properties > add  SECRET = <long random text>.
 * When set, POST requests must include the same value as "secret" (the website sends it server-side).
 */

var SHEET_NAME = 'Sheet1';            // change if your tab is named differently
var SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function doGet() {
  try {
    var t = readTable_();
    var products = t.rows.map(function (r) {
      var sizes = {};
      SIZES.forEach(function (s) {
        var v = r[t.col[s.toLowerCase() + ' qty']];
        sizes[s] = (v === '' || v === null || v === undefined) ? null : Number(v) || 0;
      });
      var price = r[t.col['price']];
      return {
        sku: String(r[t.col['sku']]).trim(),
        name: String(r[t.col['product name']] || '').trim(),
        category: String(r[t.col['category']] || '').trim(),
        price: price === '' || price === null ? null : Number(price),
        image: String(r[t.col['image url']] || '').trim(),
        sizes: sizes,
        active: /^(yes|y|true|1)$/i.test(String(r[t.col['active']]).trim())
      };
    }).filter(function (p) { return p.sku; });
    return json_({ ok: true, products: products });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();     // stops two simultaneous orders overselling
  try {
    lock.waitLock(10000);
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (secret && body.secret !== secret) return json_({ ok: false, error: 'Unauthorized' });

    var sku = String(body.sku || '').trim();
    var size = String(body.size || '').trim().toUpperCase();
    if (!sku || SIZES.indexOf(size) < 0) return json_({ ok: false, error: 'Invalid sku or size' });

    var t = readTable_();
    var colIdx = t.col[size.toLowerCase() + ' qty'];
    var rowPos = -1;
    for (var i = 0; i < t.rows.length; i++) {
      if (String(t.rows[i][t.col['sku']]).trim() === sku) { rowPos = i; break; }
    }
    if (rowPos < 0) return json_({ ok: false, error: 'SKU not found' });
    if (!/^(yes|y|true|1)$/i.test(String(t.rows[rowPos][t.col['active']]).trim())) return json_({ ok: false, error: 'Product not available' });

    var cell = t.sheet.getRange(rowPos + 2, colIdx + 1);   // +2: header row + 1-based
    var qty = Number(cell.getValue());
    if (!(qty > 0)) return json_({ ok: false, error: 'Out of stock' });
    cell.setValue(qty - 1);
    SpreadsheetApp.flush();
    return json_({ ok: true, sku: sku, size: size, qty: qty - 1 });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Reads the sheet and maps header names (lower-cased, "(…)" removed) to column positions. */
function readTable_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActive().getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var col = {};
  values[0].forEach(function (h, i) {
    col[String(h).replace(/\(.*?\)/g, '').trim().toLowerCase()] = i;
  });
  ['sku', 'product name', 'price', 'image url', 'active'].concat(SIZES.map(function (s) { return s.toLowerCase() + ' qty'; }))
    .forEach(function (k) { if (col[k] === undefined) throw new Error('Missing column: ' + k); });
  return { sheet: sheet, col: col, rows: values.slice(1) };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
