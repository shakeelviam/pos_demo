import { Backend } from "./backend.js";
import { Store } from "./storage.js";

/*
 * Shared-backend reliability layer.
 *
 * app.js was originally written for a synchronous local store. The Google
 * Sheets adapter is asynchronous, so the few hand-off actions below are
 * delegated here and the original local-only handlers are stopped.
 */

const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));

function toast(message, type = "success") {
  const root = document.querySelector("#toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function setBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.originalText = button.innerHTML;
    button.textContent = label;
  } else if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

function getSession() {
  return Store.get().session || {};
}

function showError(error) {
  console.error(error);
  toast(error?.message || "Something went wrong. Please try again.", "error");
}

/* Prevent the old app.js submit handler from creating a second order. */
document.addEventListener("submit", async event => {
  const form = event.target;
  if (!form || form.id !== "sales-order-form") return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const button = form.querySelector('button[type="submit"]');
  setBusy(button, true, "Creating Sales Order…");

  try {
    const fd = new FormData(form);
    const customer = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      company: String(fd.get("company") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      address: String(fd.get("address") || "").trim(),
      notes: String(fd.get("notes") || "").trim()
    };

    if (!customer.name) throw new Error("Customer name is required.");
    if (!customer.phone) throw new Error("Customer mobile number is required.");

    const cart = Store.getCart();
    const entries = Object.values(cart || {}).filter(x => Number(x.quantity) > 0);
    if (!entries.length) throw new Error("Add at least one product before creating a Sales Order.");

    const order = {
      customer,
      items: entries.map(x => ({
        productId: x.product?.id || x.productId || x.id,
        quantity: Number(x.quantity || 0),
        unitPrice: Number(x.product?.price ?? x.unitPrice ?? 0)
      })),
      discount: Number(window.__timehouseDiscount || 0),
      tax: 0,
      notes: customer.notes,
      createdBy: getSession()
    };

    const created = await Backend.createSalesOrder(order);
    if (!created?.id || !created?.number) throw new Error("The backend did not return a valid Sales Order.");

    Store.clearCart();
    window.__timehouseDiscount = 0;

    /* app.js owns the view state; navigate through its existing controls. */
    window.__timehouseLastOrder = created;
    window.__timehouseShowSalesSuccess = created;
    window.dispatchEvent(new CustomEvent("timehouse:sales-order-created", { detail: created }));
  } catch (error) {
    showError(error);
  } finally {
    setBusy(button, false);
  }
}, true);

/*
 * Intercept invoice creation before app.js. This prevents duplicate invoices
 * and ensures the invoice displayed to the cashier uses the backend's real
 * invoice number, totals and status.
 */
document.addEventListener("click", async event => {
  const button = event.target.closest?.("[data-make-invoice]");
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const orderId = button.dataset.makeInvoice;
  setBusy(button, true, "Creating Invoice…");

  try {
    const order = await Backend.getSalesOrder(orderId);
    if (!order) throw new Error("Sales Order not found.");
    if (String(order.status).toUpperCase() === "INVOICED") {
      throw new Error("This Sales Order has already been invoiced.");
    }

    const paymentMethod = prompt("Payment method: Cash, KNET, Card, or Bank Transfer", "Cash");
    if (!paymentMethod) return;

    const invoice = await Backend.createInvoice({
      salesOrderId: order.id,
      paymentMethod,
      createdBy: getSession()
    });

    if (!invoice?.number) throw new Error("The backend did not return a valid invoice.");

    window.__timehouseLastInvoice = invoice;
    window.dispatchEvent(new CustomEvent("timehouse:invoice-created", { detail: invoice }));
  } catch (error) {
    showError(error);
  } finally {
    setBusy(button, false);
  }
}, true);

/*
 * app.js renders the cashier screen asynchronously. A small observer makes
 * sure its Fetch & Review buttons are always interactive without relying on
 * synchronous bind() timing.
 */
const observer = new MutationObserver(() => {
  const app = document.querySelector("#app");
  if (!app) return;
  app.querySelectorAll("[data-fetch-order]").forEach(button => {
    if (button.dataset.timehouseBound) return;
    button.dataset.timehouseBound = "1";
    button.addEventListener("click", async event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        const order = await Backend.getSalesOrder(button.dataset.fetchOrder);
        if (!order) throw new Error("Sales Order not found.");
        window.__timehouseLastOrder = order;
        window.dispatchEvent(new CustomEvent("timehouse:order-fetched", { detail: order }));
      } catch (error) {
        showError(error);
      }
    }, true);
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

/* These events are consumed by the small navigation bridge below. */
window.addEventListener("timehouse:sales-order-created", event => {
  const order = event.detail;
  /* app.js has no public router, so reload into the success screen by using
     its existing DOM only when its globals are available. */
  if (typeof window.__timehouseRenderSalesSuccess === "function") {
    window.__timehouseRenderSalesSuccess(order);
    return;
  }
  /* Fallback: keep the authoritative result visible even if the app changes. */
  const app = document.querySelector("#app");
  if (app) {
    app.innerHTML = `<div class="success-page"><div class="success-icon">✓</div><div class="eyebrow">SALES ORDER CREATED</div><h1>${esc(order.number)}</h1><p>Tell the customer to go to the cashier and provide their mobile number.</p><div class="handoff-card"><div><span>Customer</span><strong>${esc(order.customer?.name)}</strong></div><div><span>Mobile</span><strong>${esc(order.customer?.phone)}</strong></div><div><span>Order total</span><strong>${Number(order.total?.grandTotal || 0).toFixed(3)} KWD</strong></div></div></div>`;
  }
});

window.addEventListener("timehouse:order-fetched", event => {
  const order = event.detail;
  window.__timehouseLastOrder = order;
  if (typeof window.__timehouseRenderCashierOrder === "function") {
    window.__timehouseRenderCashierOrder(order);
  }
});

window.addEventListener("timehouse:invoice-created", event => {
  const invoice = event.detail;
  window.__timehouseLastInvoice = invoice;
  if (typeof window.__timehouseRenderInvoice === "function") {
    window.__timehouseRenderInvoice(invoice);
    return;
  }
  toast(`Invoice ${invoice.number} created successfully.`);
});
