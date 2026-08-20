export const APP_CONFIG = {
  companyName: "TIMEHOUSE",
  companySubtitle: "WATCH WHOLESALE",
  companyPhone: "+965 0000 0000",
  companyEmail: "sales@timehouse.example",
  companyAddress: "Kuwait",
  currency: "KWD",
  currencySymbol: "د.ك",
  currencyDecimals: 3,
  taxEnabled: false,
  taxRate: 0,
  invoicePrefix: "INV",
  salesOrderPrefix: "SO",
  storageKey: "timehouse_pos_v1",
  sharedBackend: "local", // Change to "supabase" after configuring supabase.js
  demoUsers: [
    { username: "sales", password: "sales123", name: "Sales Person", role: "sales" },
    { username: "cashier", password: "cashier123", name: "Cashier", role: "cashier" },
    { username: "admin", password: "admin123", name: "Administrator", role: "admin" }
  ]
};

export function formatCurrency(value) {
  const n = Number(value || 0);
  return `${n.toFixed(APP_CONFIG.currencyDecimals)} ${APP_CONFIG.currencySymbol}`;
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export function todayISO() {
  return new Date().toISOString();
}
