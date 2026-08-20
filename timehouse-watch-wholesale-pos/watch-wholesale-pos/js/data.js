const product = (id, brandId, model, name, sku, category, price, stock, color = "Mixed") => ({
  id, brandId, model, name, sku, category, price, stock, color,
  image: `assets/products/${brandId}/${id}.jpg`
});

export const BRANDS = [
  { id:"casio", name:"CASIO", description:"Digital • Classic • Everyday", accent:"blue", products:[
    product("casio-ae1200","casio","AE-1200WH","Digital World Time","CAS-AE1200","Digital",8.500,120,"Black"),
    product("casio-f91w","casio","F-91W","Classic Digital","CAS-F91W","Digital",4.500,200,"Black"),
    product("casio-a158wa","casio","A158WA","Vintage Digital","CAS-A158","Digital",5.500,85,"Silver"),
    product("casio-w800h","casio","W-800H","Sport Digital","CAS-W800","Sports",7.500,62,"Black"),
    product("casio-mtp1302","casio","MTP-1302D","Classic Analog","CAS-MTP1302","Analog",9.750,44,"Silver"),
    product("casio-mdv106","casio","MDV-106","Diver Style","CAS-MDV106","Diver",18.500,24,"Black")
  ]},
  { id:"citizen", name:"CITIZEN", description:"Precision • Eco-Drive • Dress", accent:"cyan", products:[
    product("citizen-bi5000","citizen","BI5000","Classic Quartz","CIT-BI5000","Analog",12.000,55,"Blue"),
    product("citizen-bf500","citizen","BF500","Dress Quartz","CIT-BF500","Dress",14.000,38,"Silver"),
    product("citizen-ew3260","citizen","EW3260","Eco-Drive Classic","CIT-EW3260","Analog",28.500,20,"Silver"),
    product("citizen-ny0040","citizen","NY0040","Automatic Diver","CIT-NY0040","Automatic",42.000,12,"Blue")
  ]},
  { id:"seiko", name:"SEIKO", description:"Japanese • Automatic • Heritage", accent:"indigo", products:[
    product("seiko-snk809","seiko","SNK809","Automatic Field","SEI-SNK809","Automatic",35.000,16,"Black"),
    product("seiko-sur309","seiko","SUR309","Classic Quartz","SEI-SUR309","Analog",27.500,18,"Blue"),
    product("seiko-5-srpd","seiko","SRPD55","5 Sports Automatic","SEI-SRPD55","Sports",48.000,9,"Black"),
    product("seiko-srpe55","seiko","SRPE55","Dress Automatic","SEI-SRPE55","Automatic",52.000,8,"Blue")
  ]},
  { id:"orient", name:"ORIENT", description:"Automatic • Japanese Craft", accent:"violet", products:[
    product("orient-raaa000","orient","RA-AA000","Diver Automatic","ORI-RAAA000","Automatic",22.000,17,"Blue"),
    product("orient-bambino","orient","FAC00009","Classic Bambino","ORI-FAC000","Dress",31.000,11,"Cream"),
    product("orient-kamasu","orient","RA-AA0003","Kamasu Automatic","ORI-KAMASU","Diver",38.500,7,"Red")
  ]},
  { id:"timex", name:"TIMEX", description:"American • Casual • Heritage", accent:"orange", products:[
    product("timex-weekender","timex","TW2R42500","Weekender","TIM-WEEK","Casual",15.000,35,"Cream"),
    product("timex-expedition","timex","TW4B13900","Expedition","TIM-EXP","Sports",18.000,24,"Green"),
    product("timex-easyreader","timex","TW2V30100","Easy Reader","TIM-EASY","Dress",19.500,19,"Silver")
  ]},
  { id:"qq", name:"Q&Q", description:"Affordable • Everyday • Reliable", accent:"pink", products:[
    product("qq-vr52","qq","VR52J001Y","Classic Analog","QQ-VR52","Analog",5.500,90,"Black"),
    product("qq-m173","qq","M173J001Y","Everyday Analog","QQ-M173","Analog",6.250,72,"Silver"),
    product("qq-digital","qq","M199J002Y","Digital Sport","QQ-M199","Digital",7.000,58,"Black")
  ]},
  { id:"alba", name:"ALBA", description:"Japanese • Contemporary • Value", accent:"teal", products:[
    product("alba-vj42","alba","VJ42-X179","Classic Quartz","ALB-VJ42","Analog",13.500,30,"Blue"),
    product("alba-automatic","alba","AL4247X1","Automatic","ALB-AL4247","Automatic",26.000,14,"Black"),
    product("alba-active","alba","AH7J17X1","Active Chronograph","ALB-AH7","Chronograph",24.000,12,"Blue")
  ]},
  { id:"edifice", name:"EDIFICE", description:"Motorsport • Chronograph • Sport", accent:"sky", products:[
    product("edifice-efv100","edifice","EFV-100D","Classic Chronograph","EDI-EFV100","Chronograph",18.500,25,"Silver"),
    product("edifice-efr571","edifice","EFR-571","Sport Chronograph","EDI-EFR571","Chronograph",29.500,16,"Black"),
    product("edifice-ecb40","edifice","ECB-40","Connected Sport","EDI-ECB40","Sports",45.000,8,"Black")
  ]},
  { id:"gshock", name:"G-SHOCK", description:"Tough • Sport • Iconic", accent:"electric", products:[
    product("gshock-dw5600","gshock","DW-5600","Classic Tough","GSH-DW5600","Sports",32.000,20,"Black"),
    product("gshock-ga2100","gshock","GA-2100","CasiOak","GSH-GA2100","Sports",38.000,14,"Black"),
    product("gshock-gba900","gshock","GBA-900","Sport Bluetooth","GSH-GBA900","Sports",44.000,8,"Blue")
  ]},
  { id:"titan", name:"TITAN", description:"Indian • Modern • Elegant", accent:"gold", products:[
    product("titan-1805","titan","1805SL02","Classic Analog","TIT-1805","Dress",21.000,18,"Silver"),
    product("titan-workwear","titan","1802YM01","Workwear Classic","TIT-1802","Dress",23.500,14,"Gold"),
    product("titan-edge","titan","1696NM01","Edge Ultra Slim","TIT-1696","Dress",35.000,8,"Blue")
  ]},
  { id:"fossil", name:"FOSSIL", description:"Fashion • Leather • Lifestyle", accent:"coral", products:[
    product("fossil-grant","fossil","FS5151","Grant Chronograph","FOS-FS5151","Chronograph",29.000,16,"Brown"),
    product("fossil-machine","fossil","FS4656","Machine","FOS-FS4656","Sports",31.500,13,"Black"),
    product("fossil-caroline","fossil","ES5167","Caroline","FOS-ES5167","Dress",34.000,9,"Silver")
  ]},
  { id:"naviforce", name:"NAVIFORCE", description:"Bold • Sport • Value", accent:"lime", products:[
    product("naviforce-9233","naviforce","NF9233","Sport Chronograph","NAV-9233","Chronograph",8.500,42,"Black"),
    product("naviforce-9163","naviforce","NF9163","Classic Sport","NAV-9163","Sports",7.500,55,"Blue"),
    product("naviforce-8028","naviforce","NF8028","Everyday Analog","NAV-8028","Analog",6.750,61,"Black")
  ]}
];

export const PRODUCTS = BRANDS.flatMap(b => b.products);

export function getBrand(id) { return BRANDS.find(b => b.id === id); }
export function getProduct(id) { return PRODUCTS.find(p => p.id === id); }
