import { Backend } from "./backend.js";
import { Store } from "./storage.js";

const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const money = v => `${Number(v || 0).toFixed(3)} KWD`;

function toast(message, type = "success") {
  const root = document.querySelector("#toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
function busy(button, value, label) {
  if (!button) return;
  button.disabled = value;
  if (value) { button.dataset.original = button.innerHTML; button.textContent = label; }
  else if (button.dataset.original) { button.innerHTML = button.dataset.original; delete button.dataset.original; }
}
function session() { return Store.get().session || {}; }
function fail(error) { console.error(error); toast(error?.message || "Something went wrong.", "error"); }

/* The original app was synchronous. Capture the submit and send the order once to Sheets. */
document.addEventListener("submit", async e => {
  if (e.target?.id !== "sales-order-form") return;
  e.preventDefault(); e.stopImmediatePropagation();
  const form = e.target, button = form.querySelector('[type="submit"]');
  busy(button, true, "Creating Sales Order…");
  try {
    const fd = new FormData(form);
    const customer = {
      name: String(fd.get("name") || "").trim(), phone: String(fd.get("phone") || "").trim(),
      company: String(fd.get("company") || "").trim(), email: String(fd.get("email") || "").trim(),
      address: String(fd.get("address") || "").trim(), notes: String(fd.get("notes") || "").trim()
    };
    if (!customer.name) throw new Error("Customer name is required.");
    if (!customer.phone) throw new Error("Customer mobile number is required.");
    const entries = Object.values(Store.getCart() || {}).filter(x => Number(x.quantity) > 0);
    if (!entries.length) throw new Error("Add at least one product before creating a Sales Order.");
    const discount = Number(document.querySelector("#discount-input")?.value || 0);
    const order = {
      customer,
      items: entries.map(x => ({ productId: x.productId, quantity: Number(x.quantity), unitPrice: 0 })),
      discount,
      tax: 0,
      notes: customer.notes,
      createdBy: session()
    };
    const created = await Backend.createSalesOrder(order);
    if (!created?.id || !created?.number) throw new Error("Backend did not return a valid Sales Order.");
    Store.clearCart();
    renderSuccess(created);
  } catch (error) { fail(error); }
  finally { busy(button, false); }
}, true);

/* Capture invoice creation so only the authoritative backend invoice is created. */
document.addEventListener("click", async e => {
  const button = e.target.closest?.("[data-make-invoice]");
  if (!button) return;
  e.preventDefault(); e.stopImmediatePropagation();
  busy(button, true, "Creating Invoice…");
  try {
    const order = await Backend.getSalesOrder(button.dataset.makeInvoice);
    if (!order) throw new Error("Sales Order not found.");
    if (String(order.status).toUpperCase() === "INVOICED") throw new Error("This Sales Order has already been invoiced.");
    const paymentMethod = prompt("Payment method: Cash, KNET, Card, or Bank Transfer", "Cash");
    if (!paymentMethod) return;
    const invoice = await Backend.createInvoice({ salesOrderId: order.id, paymentMethod, createdBy: session() });
    if (!invoice?.number) throw new Error("Backend did not return a valid invoice.");
    renderInvoice(invoice);
  } catch (error) { fail(error); }
  finally { busy(button, false); }
}, true);

/* Let the original Fetch & Review handler work, but add a safe fallback if it is missed. */
const observer = new MutationObserver(() => {
  document.querySelectorAll("[data-fetch-order]").forEach(button => {
    if (button.dataset.fallbackBound) return;
    button.dataset.fallbackBound = "1";
    button.addEventListener("click", async e => {
      try {
        const order = await Backend.getSalesOrder(button.dataset.fetchOrder);
        if (!order) return;
        window.__timehouseLastOrder = order;
      } catch (error) { fail(error); }
    });
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

function renderSuccess(order) {
  const app = document.querySelector("#app");
  app.innerHTML = `<div class="success-page">
    <div class="success-icon">✓</div><div class="eyebrow">SALES ORDER CREATED</div>
    <h1>${esc(order.number)}</h1><p>The order is now available to the cashier on every device.</p>
    <div class="handoff-card"><div><span>Customer</span><strong>${esc(order.customer?.name)}</strong></div>
    <div><span>Mobile</span><strong>${esc(order.customer?.phone || order.customer?.mobile)}</strong></div>
    <div><span>Order total</span><strong>${money(order.total?.grandTotal)}</strong></div></div>
    <div class="success-actions"><button id="fix-new-order" class="primary-button">Start New Customer →</button><button id="fix-home" class="secondary-button">Browse Brands</button></div>
  </div>`;
  document.querySelector("#fix-new-order")?.addEventListener("click", () => location.reload());
  document.querySelector("#fix-home")?.addEventListener("click", () => location.reload());
}

function renderInvoice(invoice) {
  const app = document.querySelector("#app");
  const items = invoice.items || [];
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand-logo"><span><strong>TimeHouse Watches</strong><small>Watch Wholesale POS</small></span></div><div class="top-actions"><button id="fix-print" class="primary-button">Print Invoice</button><button id="fix-new" class="secondary-button">New Order</button></div></header>
  <main class="page"><article class="invoice-paper" id="fix-invoice"><header class="invoice-header"><div class="invoice-company"><div class="invoice-logo">TimeHouse Watches</div><div>Watch Wholesale POS</div><small>Kuwait City, Kuwait • +965 2222 2222 • info@timehouse-demo.com</small></div><div class="invoice-title"><div>INVOICE</div><strong>${esc(invoice.number)}</strong><span>${new Date(invoice.createdAt).toLocaleDateString()}</span></div></header><div class="invoice-accent"></div>
  <section class="bill-grid"><div><span>BILL TO</span><strong>${esc(invoice.customer?.name)}</strong><p>${esc(invoice.customer?.company || "")}<br>${esc(invoice.customer?.phone || invoice.customer?.mobile || "")}</p></div><div><span>PAYMENT</span><strong>${esc(invoice.paymentMethod || "CASH")}</strong><p>Sales Order: ${esc(invoice.salesOrderNumber || "—")}</p></div></section>
  <section class="invoice-brand"><table><thead><tr><th>Model</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${items.map(x => `<tr><td><strong>${esc(x.model)}</strong><small>${esc(x.name)}</small></td><td>${esc(x.sku)}</td><td>${x.quantity}</td><td>${money(x.unitPrice)}</td><td>${money(x.lineTotal)}</td></tr>`).join("")}</tbody></table></section>
  <section class="invoice-bottom"><div class="invoice-note"><span>NOTE</span><p>Thank you for your business.</p></div><div class="invoice-total"><div><span>Subtotal</span><strong>${money(invoice.total?.subtotal)}</strong></div><div><span>Discount</span><strong>${money(invoice.total?.discount)}</strong></div><div><span>Tax</span><strong>${money(invoice.total?.tax)}</strong></div><div class="final"><span>Total</span><strong>${money(invoice.total?.grandTotal)}</strong></div></div></section></article></main></div>`;
  document.querySelector("#fix-print")?.addEventListener("click", () => window.print());
  document.querySelector("#fix-new")?.addEventListener("click", () => location.reload());
}
