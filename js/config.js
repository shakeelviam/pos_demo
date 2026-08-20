/**
 * ============================================================
 * TIMEHOUSE WATCH WHOLESALE POS - CONFIGURATION
 * ============================================================
 *
 * Frontend configuration for the Google Apps Script backend.
 *
 * IMPORTANT:
 * Keep the API URL in this file only.
 * backend.js should read CONFIG.API_URL rather than
 * hard-coding the Google Apps Script URL.
 * ============================================================
 */

const CONFIG = {

  /**
   * ----------------------------------------------------------
   * GOOGLE APPS SCRIPT API
   * ----------------------------------------------------------
   */
  API_URL:
    'https://script.google.com/macros/s/AKfycbwJNGxBU_B9sD1sN_ftOH860uS8vDQSPRvpyQyJ_XPhJ80q6-Wzc7MUrmUQHTazpmoc6w/exec',


  /**
   * ----------------------------------------------------------
   * APPLICATION
   * ----------------------------------------------------------
   */
  APP: {

    name: 'TimeHouse Watch Wholesale POS',

    shortName: 'TimeHouse POS',

    version: '1.0.0',

    environment: 'demo',

    currency: 'KWD',

    currencySymbol: 'د.ك'

  },


  /**
   * ----------------------------------------------------------
   * API SETTINGS
   * ----------------------------------------------------------
   */
  API: {

    timeout: 15000,

    /*
     * Used by backend.js when constructing GET requests.
     */
    endpoints: {

      health: 'health',

      setup: 'setup',

      resetDemo: 'resetDemo',

      brands: 'brands',

      products: 'products',

      product: 'product',

      customers: 'customers',

      customer: 'customer',

      users: 'users',

      salesOrders: 'salesOrders',

      salesOrder: 'salesOrder',

      createSalesOrder: 'createSalesOrder',

      updateSalesOrder: 'updateSalesOrder',

      invoices: 'invoices',

      invoice: 'invoice',

      createInvoice: 'createInvoice',

      dashboard: 'dashboard'

    }

  },


  /**
   * ----------------------------------------------------------
   * USER ROLES
   * ----------------------------------------------------------
   */
  ROLES: {

    SALESPERSON: 'salesperson',

    CASHIER: 'cashier',

    ADMIN: 'admin'

  },


  /**
   * ----------------------------------------------------------
   * SALES ORDER STATUS
   * ----------------------------------------------------------
   */
  SALES_ORDER_STATUS: {

    READY: 'READY',

    INVOICED: 'INVOICED',

    CANCELLED: 'CANCELLED'

  },


  /**
   * ----------------------------------------------------------
   * INVOICE STATUS
   * ----------------------------------------------------------
   */
  INVOICE_STATUS: {

    PAID: 'PAID',

    VOID: 'VOID',

    CANCELLED: 'CANCELLED'

  },


  /**
   * ----------------------------------------------------------
   * PAYMENT METHODS
   * ----------------------------------------------------------
   */
  PAYMENT_METHODS: [

    {
      id: 'CASH',
      name: 'Cash'
    },

    {
      id: 'KNET',
      name: 'KNET'
    },

    {
      id: 'CARD',
      name: 'Card'
    },

    {
      id: 'BANK_TRANSFER',
      name: 'Bank Transfer'
    }

  ],


  /**
   * ----------------------------------------------------------
   * LOCAL STORAGE KEYS
   * ----------------------------------------------------------
   *
   * These are frontend-only values.
   *
   * IMPORTANT:
   * The actual Sales Orders and Invoices are stored in
   * Google Sheets through the Apps Script backend.
   *
   * localStorage is only used for UI/session state.
   * ----------------------------------------------------------
   */
  STORAGE: {

    session: 'timehouse_pos_session',

    currentUser: 'timehouse_pos_current_user',

    cart: 'timehouse_pos_cart',

    currentBrand: 'timehouse_pos_current_brand',

    lastSalesOrder: 'timehouse_pos_last_sales_order',

    lastInvoice: 'timehouse_pos_last_invoice',

    settings: 'timehouse_pos_settings'

  },


  /**
   * ----------------------------------------------------------
   * DEMO SETTINGS
   * ----------------------------------------------------------
   */
  DEMO: {

    enabled: true,

    showDemoBadge: true,

    showConnectionStatus: true,

    allowDemoReset: false,

    defaultSalesperson: 'USR-001',

    defaultCashier: 'USR-004'

  },


  /**
   * ----------------------------------------------------------
   * POS SETTINGS
   * ----------------------------------------------------------
   */
  POS: {

    /**
     * Maximum quantity a salesperson can add to cart
     * for a single product.
     */
    maxQuantityPerProduct: 999,

    /**
     * Whether products with zero stock can be added.
     */
    allowOutOfStock: false,

    /**
     * Whether the salesperson can manually change
     * the selling price.
     */
    allowPriceOverride: false,

    /**
     * Whether discounts are enabled.
     */
    allowDiscounts: true,

    /**
     * Whether tax is enabled.
     *
     * Current demo backend uses 0 tax.
     */
    taxEnabled: false,

    /**
     * Decimal places for KWD.
     */
    decimalPlaces: 3

  },


  /**
   * ----------------------------------------------------------
   * SALES PERSON SETTINGS
   * ----------------------------------------------------------
   */
  SALESPERSON: {

    /**
     * Customer mobile is required before creating
     * a Sales Order.
     */
    requireCustomerMobile: true,

    /**
     * Customer name is optional in the demo.
     */
    requireCustomerName: false,

    /**
     * Salesperson can continue adding products from
     * different brands.
     */
    multiBrandOrders: true,

    /**
     * Cart is global across all brands.
     */
    globalCart: true

  },


  /**
   * ----------------------------------------------------------
   * CASHIER SETTINGS
   * ----------------------------------------------------------
   */
  CASHIER: {

    /**
     * Cashier can search Sales Orders using
     * customer mobile number.
     */
    searchByMobile: true,

    /**
     * Cashier can also search by Sales Order number.
     */
    searchBySalesOrderNumber: true,

    /**
     * Only READY orders should normally appear in
     * the cashier's pending queue.
     */
    showReadyOrdersOnly: false,

    /**
     * Require payment method before invoice creation.
     */
    requirePaymentMethod: true,

    /**
     * Automatically mark Sales Order as INVOICED
     * after successful invoice creation.
     */
    markOrderInvoiced: true,

    /**
     * Automatically reduce stock when invoice is created.
     */
    reduceStockOnInvoice: true

  },


  /**
   * ----------------------------------------------------------
   * INVOICE SETTINGS
   * ----------------------------------------------------------
   */
  INVOICE: {

    prefix: 'INV',

    /**
     * Number of decimal places used for KWD.
     */
    decimalPlaces: 3,

    /**
     * Group invoice items by brand.
     */
    groupByBrand: true,

    /**
     * Show SKU.
     */
    showSKU: true,

    /**
     * Show brand subtotal.
     */
    showBrandSubtotal: true,

    /**
     * Show salesperson.
     */
    showSalesperson: true,

    /**
     * Show cashier.
     */
    showCashier: true,

    /**
     * Print format.
     */
    printFormat: 'A4'

  },


  /**
   * ----------------------------------------------------------
   * UI SETTINGS
   * ----------------------------------------------------------
   */
  UI: {

    /**
     * Number of products displayed per catalog page.
     */
    productsPerPage: 24,

    /**
     * Enable product search.
     */
    productSearch: true,

    /**
     * Enable brand filtering.
     */
    brandFiltering: true,

    /**
     * Enable stock indicators.
     */
    showStock: true,

    /**
     * Show cart count in header.
     */
    showCartIndicator: true,

    /**
     * Show current order total in header.
     */
    showCartTotal: true

  },


  /**
   * ----------------------------------------------------------
   * BRAND DISPLAY
   * ----------------------------------------------------------
   *
   * These can later be replaced with actual image paths.
   * The backend remains the source of truth for brands.
   * ----------------------------------------------------------
   */
  BRAND_IMAGES: {

    CASIO: 'assets/brands/casio.png',

    'G-SHOCK': 'assets/brands/gshock.png',

    CITIZEN: 'assets/brands/citizen.png',

    SEIKO: 'assets/brands/seiko.png',

    ORIENT: 'assets/brands/orient.png',

    TISSOT: 'assets/brands/tissot.png',

    TIMEX: 'assets/brands/timex.png',

    FOSSIL: 'assets/brands/fossil.png'

  },


  /**
   * ----------------------------------------------------------
   * DEFAULT COMPANY INFORMATION
   * ----------------------------------------------------------
   *
   * The authoritative values are also stored in the
   * Google Sheets Settings tab.
   *
   * These values are fallback values for the frontend.
   * ----------------------------------------------------------
   */
  COMPANY: {

    name: 'TimeHouse Watches',

    address: 'Kuwait City, Kuwait',

    phone: '+965 2222 2222',

    email: 'info@timehouse-demo.com',

    country: 'Kuwait'

  }

};


/**
 * ============================================================
 * BACKWARD COMPATIBILITY
 * ============================================================
 *
 * If the existing backend.js expects API_URL directly,
 * this keeps it working without modification.
 * ============================================================
 */

const API_URL = CONFIG.API_URL;


/**
 * ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

/**
 * Build an API URL for a GET request.
 *
 * Example:
 *
 * buildApiUrl('products', { brand: 'CASIO' })
 *
 * becomes:
 *
 * .../exec?action=products&brand=CASIO
 */
function buildApiUrl(action, params = {}) {

  const url = new URL(CONFIG.API_URL);

  url.searchParams.set(
    'action',
    action
  );

  Object.keys(params).forEach(function(key) {

    const value = params[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {

      url.searchParams.set(
        key,
        value
      );

    }

  });

  return url.toString();
}


/**
 * Get the configured API endpoint.
 */
function getApiUrl() {

  return CONFIG.API_URL;

}


/**
 * Format a KWD amount.
 *
 * Example:
 *
 * formatCurrency(42.5)
 *
 * => "42.500 د.ك"
 */
function formatCurrency(amount) {

  const value =
    Number(amount || 0);

  return (
    value.toFixed(
      CONFIG.POS.decimalPlaces
    ) +
    ' ' +
    CONFIG.APP.currencySymbol
  );

}


/**
 * Get the current logged-in user.
 */
function getCurrentUser() {

  try {

    const stored =
      localStorage.getItem(
        CONFIG.STORAGE.currentUser
      );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);

  } catch (error) {

    console.error(
      'Unable to read current user:',
      error
    );

    return null;

  }

}


/**
 * Save the current logged-in user.
 */
function setCurrentUser(user) {

  if (!user) {

    localStorage.removeItem(
      CONFIG.STORAGE.currentUser
    );

    return;

  }

  localStorage.setItem(
    CONFIG.STORAGE.currentUser,
    JSON.stringify(user)
  );

}


/**
 * Clear the current session.
 */
function clearCurrentSession() {

  localStorage.removeItem(
    CONFIG.STORAGE.session
  );

  localStorage.removeItem(
    CONFIG.STORAGE.currentUser
  );

  localStorage.removeItem(
    CONFIG.STORAGE.currentBrand
  );

}


/**
 * Determine whether the user is a salesperson.
 */
function isSalesperson() {

  const user =
    getCurrentUser();

  return (
    user &&
    String(user.role).toLowerCase() ===
    CONFIG.ROLES.SALESPERSON
  );

}


/**
 * Determine whether the user is a cashier.
 */
function isCashier() {

  const user =
    getCurrentUser();

  return (
    user &&
    String(user.role).toLowerCase() ===
    CONFIG.ROLES.CASHIER
  );

}


/**
 * Determine whether the user is an administrator.
 */
function isAdmin() {

  const user =
    getCurrentUser();

  return (
    user &&
    String(user.role).toLowerCase() ===
    CONFIG.ROLES.ADMIN
  );

}


/**
 * ============================================================
 * DEVELOPMENT / DEBUG INFORMATION
 * ============================================================
 */

console.log(
  '%c' +
  CONFIG.APP.name +
  ' v' +
  CONFIG.APP.version,
  'font-weight:bold;'
);

console.log(
  'Environment:',
  CONFIG.APP.environment
);

console.log(
  'API:',
  CONFIG.API_URL
);

export const APP_CONFIG = {
  companyName: CONFIG.COMPANY.name,
  companySubtitle: 'Watch Wholesale POS',
  demoUsers: [
    {
      username: 'sales',
      password: 'sales123',
      name: 'Salesperson',
      role: 'salesperson'
    },
    {
      username: 'cashier',
      password: 'cashier123',
      name: 'Cashier',
      role: 'cashier'
    }
  ]
};

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export { CONFIG, formatCurrency };
