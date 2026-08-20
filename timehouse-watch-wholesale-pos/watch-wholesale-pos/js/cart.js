import { Store } from "./storage.js";
import { getProduct, getBrand } from "./data.js";
import { APP_CONFIG } from "./config.js";

export function cartEntries() {
  return Object.entries(Store.getCart())
    .map(([productId, row]) => {
      const p = getProduct(productId);
      return p ? { product: p, quantity: Number(row.quantity || 0) } : null;
    })
    .filter(Boolean)
    .filter(x => x.quantity > 0);
}

export function setQuantity(productId, quantity) {
  const p = getProduct(productId);
  if (!p) return;
  let q = Math.max(0, Math.floor(Number(quantity) || 0));
  q = Math.min(q, p.stock);
  const cart = { ...Store.getCart() };
  if (q === 0) delete cart[productId];
  else cart[productId] = { productId, quantity: q };
  Store.setCart(cart);
}

export function addQuantity(productId, delta=1) {
  const current = Number(Store.getCart()[productId]?.quantity || 0);
  setQuantity(productId, current + delta);
}

export function removeProduct(productId) {
  setQuantity(productId, 0);
}

export function clearCart() {
  Store.clearCart();
}

export function totals(discount=0) {
  const subtotal = cartEntries().reduce((sum, x) => sum + x.product.price * x.quantity, 0);
  const safeDiscount = Math.max(0, Math.min(Number(discount || 0), subtotal));
  const taxable = Math.max(0, subtotal - safeDiscount);
  const tax = APP_CONFIG.taxEnabled ? taxable * (APP_CONFIG.taxRate / 100) : 0;
  const grandTotal = taxable + tax;
  const totalQuantity = cartEntries().reduce((sum, x) => sum + x.quantity, 0);
  return { subtotal, discount: safeDiscount, tax, grandTotal, totalQuantity };
}

export function groupByBrand() {
  const groups = {};
  for (const item of cartEntries()) {
    const brand = getBrand(item.product.brandId);
    if (!groups[brand.id]) groups[brand.id] = { brand, items: [], subtotal: 0 };
    groups[brand.id].items.push(item);
    groups[brand.id].subtotal += item.product.price * item.quantity;
  }
  return Object.values(groups);
}

export function snapshotCart() {
  return cartEntries().map(x => ({
    productId: x.product.id,
    brandId: x.product.brandId,
    model: x.product.model,
    name: x.product.name,
    sku: x.product.sku,
    category: x.product.category,
    unitPrice: x.product.price,
    quantity: x.quantity,
    lineTotal: Number((x.product.price * x.quantity).toFixed(APP_CONFIG.currencyDecimals))
  }));
}
