#!/usr/bin/env node
/**
 * Amazon PA-API v5 — SearchItems
 * Busca as melhores lava e seca e salva em src/content/paapi-results.json
 *
 * Uso:
 *   node scripts/amazon-search.mjs                 # termo padrao
 *   node scripts/amazon-search.mjs "lava e seca lg"
 *
 * Documentacao:
 *   https://webservices.amazon.com/paapi5/documentation/
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// -- Variaveis de ambiente --
const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG;
const HOST = process.env.AMAZON_HOST || 'webservices.amazon.com.br';
const REGION = process.env.AMAZON_REGION || 'us-east-1';
const MARKETPLACE = process.env.AMAZON_MARKETPLACE || 'www.amazon.com.br';

if (!ACCESS_KEY || !SECRET_KEY || !PARTNER_TAG) {
  console.error('❌ Faltam variaveis no .env.local: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG');
  process.exit(1);
}

const KEYWORDS = process.argv[2] || 'lava e seca';
const SERVICE = 'ProductAdvertisingAPI';
const URI = '/paapi5/searchitems';
const TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';

const payload = {
  Keywords: KEYWORDS,
  SearchIndex: 'Appliances',
  ItemCount: 10,
  PartnerTag: PARTNER_TAG,
  PartnerType: 'Associates',
  Marketplace: MARKETPLACE,
  Resources: [
    'Images.Primary.Large',
    'Images.Primary.Medium',
    'ItemInfo.Title',
    'ItemInfo.Features',
    'ItemInfo.ManufactureInfo',
    'ItemInfo.ProductInfo',
    'ItemInfo.ByLineInfo',
    'ItemInfo.TechnicalInfo',
    'Offers.Listings.Price',
    'Offers.Listings.Availability.Message',
    'Offers.Summaries.HighestPrice',
    'Offers.Summaries.LowestPrice',
    'CustomerReviews.Count',
    'CustomerReviews.StarRating',
  ],
};

// ---- SigV4 ----
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function signingKey(secret, date, region, service) {
  const kDate = hmac('AWS4' + secret, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

async function main() {
  const body = JSON.stringify(payload);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': HOST,
    'x-amz-date': amzDate,
    'x-amz-target': TARGET,
  };
  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    'POST',
    URI,
    '',
    canonicalHeaders,
    signedHeaders,
    sha256(body),
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const key = signingKey(SECRET_KEY, dateStamp, REGION, SERVICE);
  const signature = crypto.createHmac('sha256', key).update(stringToSign).digest('hex');

  const authorization = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestHeaders = { ...headers, Authorization: authorization };

  console.log(`🔎 Buscando: "${KEYWORDS}" em ${MARKETPLACE}...`);

  const response = await fetch(`https://${HOST}${URI}`, {
    method: 'POST',
    headers: requestHeaders,
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(`❌ PA-API retornou ${response.status}:`);
    console.error(text);
    process.exit(1);
  }

  const data = JSON.parse(text);
  const outPath = path.join(ROOT, 'src', 'content', 'paapi-results.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

  const items = data.SearchResult?.Items || [];
  console.log(`✅ ${items.length} produtos encontrados. Salvos em ${path.relative(ROOT, outPath)}`);

  // Resumo legivel
  for (const item of items.slice(0, 10)) {
    const title = item.ItemInfo?.Title?.DisplayValue || '—';
    const asin = item.ASIN;
    const price = item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'n/d';
    const image = item.Images?.Primary?.Large?.URL || '—';
    console.log(`  • [${asin}] ${title}`);
    console.log(`    ${price}`);
    console.log(`    img: ${image}`);
  }
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
