import { CONFIG, todayISO } from "./config.js";

const STORAGE_KEY = CONFIG.STORAGE.session || "timehouse_pos_session";
const SALES_ORDER_PREFIX = CONFIG.INVOICE?.salesOrderPrefix || "SO";
const INVOICE_PREFIX = CONFIG.INVOICE?.prefix || "INV";

const defaultState = {
  session: null,
  cart: {},
  customer: {},
  settings: {},
  salesOrders: [],
  invoices: [],
  counters: { salesOrder: 1, invoice: 1 }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

let db = load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Storage unavailable", e);
  }
}

export const Store = {
  get() { return db; },
  setSession(session) { db.session = session; save(); },
  clearSession() { db.session = null; save(); },
  getCart() { return db.cart; },
  setCart(cart) { db.cart = cart; save(); },
  clearCart() { db.cart = {}; save(); },
  getCustomer() { return db.customer || {}; },
  setCustomer(customer) { db.customer = customer; save(); },
  getSalesOrders() { return db.salesOrders || []; },
  getInvoices() { return db.invoices || []; },

  nextSalesOrderNumber() {
    const year = new Date().getFullYear();
    const n = db.counters.salesOrder++;
    save();
    return `${SALES_ORDER_PREFIX}-${year}-${String(n).padStart(6,"0")}`;
  },

  nextInvoiceNumber() {
    const year = new Date().getFullYear();
    const n = db.counters.invoice++;
    save();
    return `${INVOICE_PREFIX}-${year}-${String(n).padStart(6,"0")}`;
  },

  createSalesOrder(order) {
    db.salesOrders.unshift({ ...order, createdAt: order.createdAt || todayISO() });
    save();
    return order;
  },

  updateSalesOrder(id, patch) {
    const idx = db.salesOrders.findIndex(o => o.id === id);
    if (idx >= 0) db.salesOrders[idx] = { ...db.salesOrders[idx], ...patch };
    save();
  },

  createInvoice(invoice) {
    db.invoices.unshift({ ...invoice, createdAt: invoice.createdAt || todayISO() });
    save();
    return invoice;
  },

  replaceAllSalesOrders(orders) {
    db.salesOrders = orders;
    save();
  }
};

export function makeId(prefix="id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}
