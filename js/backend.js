import { CONFIG } from "./config.js";
import { PRODUCTS } from "./data.js";

const API_URL = CONFIG.API_URL;
const num = value => Number(value || 0);
const mobile = value => String(value || "").replace(/[\s\-()]/g, "");

async function request(action, payload = {}, method = "GET") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.API.timeout || 15000);
  try {
    let url = `${API_URL}?action=${encodeURIComponent(action)}`;
    const options = { method, signal: controller.signal };
    if (method === "GET") Object.entries(payload).forEach(([key,value]) => { if(value!==undefined&&value!==null&&value!=="") url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`; });
    else { options.headers={"Content-Type":"text/plain;charset=utf-8"}; options.body=JSON.stringify({action,...payload}); }
    const response=await fetch(url,options); if(!response.ok)throw new Error(`Backend request failed (${response.status}).`);
    const result=await response.json(); if(!result.success)throw new Error(result.error||"Backend request failed."); return result;
  } finally { clearTimeout(timer); }
}
function totalsObject(row){return{subtotal:num(row.subtotal),discount:num(row.discount),tax:num(row.tax),grandTotal:num(row.total),totalQuantity:num(row.totalQuantity)};}
function normalizeOrder(row,items=[]){if(!row)return null;return{id:row.salesOrderId,number:row.salesOrderNumber,status:row.status,customer:{id:row.customerId,mobile:row.customerMobile,phone:row.customerMobile,name:row.customerName||"Walk-in Customer",company:row.customerCompany||"",email:row.customerEmail||"",address:row.customerAddress||"",notes:row.notes||""},items:items.map(item=>({productId:item.productId,brandId:item.brandId,brandName:item.brandName,model:item.model,name:item.productName,sku:item.sku,category:item.category||"",quantity:num(item.quantity),unitPrice:num(item.unitPrice),lineTotal:num(item.total)})),total:totalsObject(row),subtotal:num(row.subtotal),discount:num(row.discount),tax:num(row.tax),totalQuantity:num(row.totalQuantity),itemCount:num(row.itemCount),notes:row.notes||"",createdBy:{id:row.salespersonId,name:row.salespersonName,role:"salesperson"},createdAt:row.createdAt,updatedAt:row.updatedAt};}
function normalizeInvoice(row,items=[]){if(!row)return null;return{id:row.invoiceId,number:row.invoiceNumber,salesOrderId:row.salesOrderId,salesOrderNumber:row.salesOrderNumber,customer:{id:row.customerId,mobile:row.customerMobile,phone:row.customerMobile,name:row.customerName||"Walk-in Customer",company:row.customerCompany||"",email:row.customerEmail||"",address:row.customerAddress||"",notes:row.notes||""},cashier:{id:row.cashierId,name:row.cashierName},paymentMethod:row.paymentMethod,status:row.status,items:items.map(item=>({productId:item.productId,brandId:item.brandId,brandName:item.brandName,model:item.model,name:item.productName,sku:item.sku,category:item.category||"",quantity:num(item.quantity),unitPrice:num(item.unitPrice),lineTotal:num(item.total)})),total:totalsObject(row),subtotal:num(row.subtotal),discount:num(row.discount),tax:num(row.tax),totalQuantity:num(row.totalQuantity),itemCount:num(row.itemCount),notes:row.notes||"",createdAt:row.createdAt};}
async function getOrder(idOrNumber){const result=await request("salesOrder",{salesOrderId:idOrNumber,salesOrderNumber:idOrNumber});return normalizeOrder(result.salesOrder,result.items||[]);}

export const Backend={
  async health(){return request("health");},
  async listBrands(){const result=await request("brands");return result.brands||[];},
  async listProducts(params={}){const result=await request("products",params);return result.products||[];},
  async listCustomers(params={}){const result=await request("customers",params);return result.customers||[];},
  async listSalesOrders(params={}){const result=await request("salesOrders",params);return Promise.all((result.salesOrders||[]).map(row=>getOrder(row.salesOrderId||row.salesOrderNumber)));},
  async findSalesOrders(query){const q=String(query||"").trim();if(!q)return this.listSalesOrders();const normalized=mobile(q);const numeric=/^\+?\d+$/.test(normalized);const result=await request("salesOrders",numeric?{mobile:normalized}:{salesOrderNumber:q});let rows=result.salesOrders||[];if(!rows.length&&!numeric){const all=await request("salesOrders");const needle=q.toLowerCase();rows=(all.salesOrders||[]).filter(row=>[row.salesOrderNumber,row.customerName,row.customerMobile].some(v=>String(v||"").toLowerCase().includes(needle)));}return Promise.all(rows.map(row=>getOrder(row.salesOrderId||row.salesOrderNumber)));},
  async getSalesOrder(id){try{return await getOrder(id);}catch{return null;}},
  async createSalesOrder(order){
    let backendProducts=await this.listProducts();
    const localItems=(order.items||[]).map(item=>{const local=PRODUCTS.find(p=>p.id===item.productId)||item;return{item,local};});
    const items=[];
    for(const {item,local} of localItems){
      const model=String(local.model||item.model||"").toLowerCase(),sku=String(local.sku||item.sku||"").toLowerCase(),name=String(local.name||item.name||"").toLowerCase();
      let product=backendProducts.find(p=>String(p.model||"").toLowerCase()===model||String(p.sku||"").toLowerCase()===sku||String(p.name||"").toLowerCase()===name);
      if(!product){
        const synced=await request("syncProduct",{brandId:local.brandId,brandName:local.brandName||"",model:local.model,name:local.name,sku:local.sku,category:local.category,unitPrice:num(item.unitPrice??local.price),stock:num(local.stock),image:local.image||"",active:true},"POST");
        product=synced.product;
        if(!product)throw new Error(`Could not sync product ${local.model||local.name||item.productId} to Google Sheets.`);
        backendProducts.push(product);
      }
      items.push({productId:product.productId,quantity:num(item.quantity),unitPrice:num(item.unitPrice??local.price),discount:0,tax:0});
    }
    const customer=order.customer||{};
    const result=await request("createSalesOrder",{customerMobile:mobile(customer.mobile||customer.phone),customerName:customer.name||"Walk-in Customer",customerCompany:customer.company||"",customerEmail:customer.email||"",customerAddress:customer.address||"",salespersonId:order.createdBy?.id||"",salespersonName:order.createdBy?.name||"Salesperson",notes:order.notes||"",discount:num(order.discount),tax:num(order.tax),items},"POST");
    return normalizeOrder(result.salesOrder,result.items||[]);
  },
  async updateSalesOrder(id,patch){return request("updateSalesOrder",{salesOrderId:id,...patch},"POST");},
  async createInvoice(invoice){const s=invoice.createdBy||invoice.cashier||{};const result=await request("createInvoice",{salesOrderId:invoice.salesOrderId||invoice.orderId||invoice.id,paymentMethod:String(invoice.paymentMethod||"CASH").toUpperCase().replace(/\s+/g,"_"),cashierId:s.id||s.userId||"",cashierName:s.name||"Cashier",notes:invoice.notes||""},"POST");return normalizeInvoice(result.invoice,result.items||[]);},
  async getInvoice(id){const result=await request("invoice",{invoiceId:id});return normalizeInvoice(result.invoice,result.items||[]);},
  async dashboard(){return request("dashboard");}
};
