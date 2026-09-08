import catalog from './products-data.json';
export const products = catalog;
export function productByRank(rank) { return products.find(p=>p.rank===rank); }
export function productBySlug(slug) { return products.find(p=>p.slug===slug); }
