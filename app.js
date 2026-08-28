const API_URL="https://script.google.com/macros/s/AKfycbzf-dmyNPFw7VVV6fUIi0Qap9DvdB54UIrsZVy--Ivjii0XvDelPYaC3Rjy-d4KCvE/exec";

let data={
  customers:[],
  vendors:[],
  products:[],
  purchases:[],
  purchaseItems:[],
  sales:[],
  salesItems:[],
  payments:[],
  stock:[],
  settings:[],
  backupLog:[]
};

const $=id=>document.getElementById(id);

const money=n=>Number(n||0).toLocaleString("en-BD",{
  minimumFractionDigits:2,
  maximumFractionDigits:2
});

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
}[m]));

async function api(action,payload={}){

  try{

    $("syncStatus").textContent="Syncing...";

    const r=await fetch(API_URL,{
      method:"POST",
      headers:{
        "Content-Type":"text/plain;charset=utf-8"
      },
      body:JSON.stringify({
        action:action,
        data:payload
      }),
      redirect:"follow"
    });

    const j=await r.json();

    if(!j.success){
      throw new Error(j.message||"Server error");
    }

    return j;

  }catch(e){

    $("syncStatus").textContent="Error";

    alert("Cloud connection error: "+e.message);

    throw e;
  }
}


async function loadAll(){

  try{

    $("syncStatus").textContent="Syncing...";

    const j=await api("getAll");

    data=j.data||{};

    renderAll();

    $("syncStatus").textContent="☁️ Cloud Synced";

  }catch(e){

    console.error(e);

  }
}


function opts(sel,arr,ph){

  const el=$(sel);

  if(!el)return;

  el.innerHTML=
    `<option value="">${ph}</option>`+
    arr.map(x=>
      `<option value="${esc(x.ID)}">${esc(x.Name||x.Code||x.ID)}</option>`
    ).join("");
}


/* =========================
   CUSTOMER
========================= */

async function addCustomer(){

  const name=$("cName").value.trim();

  if(!name){
    return alert("Customer name দিন");
  }

  await api("addCustomer",{
    name:name,
    phone:$("cPhone").value,
    address:$("cAddress").value
  });

  ["cName","cPhone","cAddress"].forEach(x=>{
    $(x).value="";
  });

  await loadAll();
}


async function editCustomer(id){

  const customer=data.customers.find(
    x=>String(x.ID)===String(id)
  );

  if(!customer){
    return alert("Customer পাওয়া যায়নি");
  }

  const name=prompt(
    "Customer Name:",
    customer.Name||""
  );

  if(name===null)return;

  const phone=prompt(
    "Phone:",
    customer.Phone||""
  );

  if(phone===null)return;

  const address=prompt(
    "Address:",
    customer.Address||""
  );

  if(address===null)return;

  if(!name.trim()){
    return alert("Customer name খালি রাখা যাবে না");
  }

  await api("updateCustomer",{
    ID:customer.ID,
    name:name.trim(),
    phone:phone,
    address:address
  });

  alert("Customer updated successfully");

  await loadAll();
}


async function deleteCustomer(id){

  if(!confirm("এই Customer-টি Delete করতে চান?")){
    return;
  }

  await api("deleteCustomer",{id:id});

  alert("Customer deleted successfully");

  await loadAll();
}


/* =========================
   VENDOR
========================= */

async function addVendor(){

  const name=$("vName").value.trim();

  if(!name){
    return alert("Vendor name দিন");
  }

  await api("addVendor",{
    name:name,
    phone:$("vPhone").value,
    address:$("vAddress").value
  });

  ["vName","vPhone","vAddress"].forEach(x=>{
    $(x).value="";
  });

  await loadAll();
}


async function editVendor(id){

  const vendor=data.vendors.find(
    x=>String(x.ID)===String(id)
  );

  if(!vendor){
    return alert("Vendor পাওয়া যায়নি");
  }

  const name=prompt(
    "Vendor Name:",
    vendor.Name||""
  );

  if(name===null)return;

  const phone=prompt(
    "Phone:",
    vendor.Phone||""
  );

  if(phone===null)return;

  const address=prompt(
    "Address:",
    vendor.Address||""
  );

  if(address===null)return;

  if(!name.trim()){
    return alert("Vendor name খালি রাখা যাবে না");
  }

  await api("updateVendor",{
    ID:vendor.ID,
    name:name.trim(),
    phone:phone,
    address:address
  });

  alert("Vendor updated successfully");

  await loadAll();
}


async function deleteVendor(id){

  if(!confirm("এই Vendor-টি Delete করতে চান?")){
    return;
  }

  await api("deleteVendor",{id:id});

  alert("Vendor deleted successfully");

  await loadAll();
}


/* =========================
   PRODUCT
========================= */

async function addProduct(){

  const code=$("pCode").value.trim();
  const name=$("pName").value.trim();

  if(!code||!name){
    return alert("Product code ও name দিন");
  }

  await api("addProduct",{
    code:code,
    name:name,
    category:$("pCat").value,
    unit:$("pUnit").value||"pcs",
    purchasePrice:+$("pBuy").value||0,
    salesPrice:+$("pSell").value||0,
    openingStock:+$("pOpening").value||0,
    minimumStock:+$("pMin").value||0
  });

  [
    "pCode",
    "pName",
    "pCat",
    "pUnit",
    "pBuy",
    "pSell",
    "pOpening",
    "pMin"
  ].forEach(x=>{
    $(x).value="";
  });

  await loadAll();
}


async function editProduct(id){

  const product=data.products.find(
    x=>String(x.ID)===String(id)
  );

  if(!product){
    return alert("Product পাওয়া যায়নি");
  }

  const code=prompt(
    "Product Code:",
    product.Code||""
  );

  if(code===null)return;

  const name=prompt(
    "Product Name:",
    product.Name||""
  );

  if(name===null)return;

  const category=prompt(
    "Category:",
    product.Category||""
  );

  if(category===null)return;

  const unit=prompt(
    "Unit:",
    product.Unit||"pcs"
  );

  if(unit===null)return;

  const purchasePrice=prompt(
    "Purchase Price:",
    product.PurchasePrice||0
  );

  if(purchasePrice===null)return;

  const salesPrice=prompt(
    "Sales Price:",
    product.SalesPrice||0
  );

  if(salesPrice===null)return;

  const minimumStock=prompt(
    "Minimum Stock:",
    product.MinimumStock||0
  );

  if(minimumStock===null)return;

  if(!code.trim()||!name.trim()){
    return alert("Product Code ও Name খালি রাখা যাবে না");
  }

  await api("updateProduct",{
    ID:product.ID,
    code:code.trim(),
    name:name.trim(),
    category:category,
    unit:unit||"pcs",
    purchasePrice:Number(purchasePrice)||0,
    salesPrice:Number(salesPrice)||0,
    minimumStock:Number(minimumStock)||0
  });

  alert("Product updated successfully");

  await loadAll();
}


async function deleteProduct(id){

  if(!confirm("এই Product-টি Delete করতে চান?")){
    return;
  }

  await api("deleteProduct",{id:id});

  alert("Product deleted successfully");

  await loadAll();
}


/* =========================
   PURCHASE
========================= */

async function addPurchase(){

  const vendorId=$("purVendor").value;
  const productId=$("purProduct").value;
  const qty=+$("purQty").value;
  const rate=+$("purRate").value;
  const paid=+$("purPaid").value||0;

  if(!vendorId||!productId||qty<=0){
    return alert("Vendor, Product ও Quantity দিন");
  }

  const j=await api("purchase",{
    vendorId:vendorId,
    productId:productId,
    qty:qty,
    rate:rate,
    paid:paid
  });

  alert("Purchase saved. Total: "+money(j.total));

  await loadAll();
}


async function editPurchase(id){

  const purchase=data.purchases.find(
    x=>String(x.ID)===String(id)
  );

  if(!purchase){
    return alert("Purchase পাওয়া যায়নি");
  }

  const item=data.purchaseItems.find(
    x=>String(x.PurchaseID)===String(id)
  );

  if(!item){
    return alert("Purchase item পাওয়া যায়নি");
  }

  const vendorId=prompt(
    "Vendor ID:",
    purchase.VendorID||""
  );

  if(vendorId===null)return;

  const productId=prompt(
    "Product ID:",
    item.ProductID||""
  );

  if(productId===null)return;

  const qty=prompt(
    "Quantity:",
    item.Quantity||0
  );

  if(qty===null)return;

  const rate=prompt(
    "Rate:",
    item.Rate||0
  );

  if(rate===null)return;

  const paid=prompt(
    "Paid:",
    purchase.Paid||0
  );

  if(paid===null)return;

  if(Number(qty)<=0){
    return alert("Quantity 0-এর বেশি হতে হবে");
  }

  await api("updatePurchase",{
    ID:purchase.ID,
    vendorId:vendorId,
    productId:productId,
    qty:Number(qty),
    rate:Number(rate),
    paid:Number(paid)||0
  });

  alert("Purchase updated successfully");

  await loadAll();
}


async function deletePurchase(id){

  if(!confirm(
    "এই Purchase Delete করতে চান?\n\nStock পুনরায় হিসাব হবে।"
  )){
    return;
  }

  await api("deletePurchase",{id:id});

  alert("Purchase deleted successfully");

  await loadAll();
}


/* =========================
   SALE
========================= */

async function addSale(){

  const customerId=$("saleCustomer").value;
  const productId=$("saleProduct").value;
  const qty=+$("saleQty").value;
  const rate=+$("saleRate").value;
  const paid=+$("salePaid").value||0;

  if(!customerId||!productId||qty<=0){
    return alert("Customer, Product ও Quantity দিন");
  }

  const j=await api("sale",{
    customerId:customerId,
    productId:productId,
    qty:qty,
    rate:rate,
    paid:paid
  });

  alert("Sale saved. Total: "+money(j.total));

  await loadAll();
}


async function editSale(id){

  const sale=data.sales.find(
    x=>String(x.ID)===String(id)
  );

  if(!sale){
    return alert("Sale পাওয়া যায়নি");
  }

  const item=data.salesItems.find(
    x=>String(x.SaleID)===String(id)
  );

  if(!item){
    return alert("Sale item পাওয়া যায়নি");
  }

  const customerId=prompt(
    "Customer ID:",
    sale.CustomerID||""
  );

  if(customerId===null)return;

  const productId=prompt(
    "Product ID:",
    item.ProductID||""
  );

  if(productId===null)return;

  const qty=prompt(
    "Quantity:",
    item.Quantity||0
  );

  if(qty===null)return;

  const rate=prompt(
    "Rate:",
    item.Rate||0
  );

  if(rate===null)return;

  const paid=prompt(
    "Paid:",
    sale.Paid||0
  );

  if(paid===null)return;

  if(Number(qty)<=0){
    return alert("Quantity 0-এর বেশি হতে হবে");
  }

  await api("updateSale",{
    ID:sale.ID,
    customerId:customerId,
    productId:productId,
    qty:Number(qty),
    rate:Number(rate),
    paid:Number(paid)||0
  });

  alert("Sale updated successfully");

  await loadAll();
}


async function deleteSale(id){

  if(!confirm(
    "এই Sale Delete করতে চান?\n\nStock পুনরায় হিসাব হবে।"
  )){
    return;
  }

  await api("deleteSale",{id:id});

  alert("Sale deleted successfully");

  await loadAll();
}


/* =========================
   BACKUP
========================= */

async function backup(){

  const j=await api("backup",{});

  alert(j.message||"Backup created");
}


/* =========================
   RENDER
========================= */

function renderAll(){

  $("dProducts").textContent=data.products.length;

  $("dCustomers").textContent=data.customers.length;

  $("dVendors").textContent=data.vendors.length;

  $("dStock").textContent=data.stock.reduce(
    (a,x)=>a+Number(x.CurrentStock||0),
    0
  );

  $("dPurchase").textContent=money(
    data.purchases.reduce(
      (a,x)=>a+Number(x.Total||0),
      0
    )
  );

  $("dSales").textContent=money(
    data.sales.reduce(
      (a,x)=>a+Number(x.Total||0),
      0
    )
  );


  /* Customers */

  $("customerTable").innerHTML=
    data.customers.map(x=>`
      <tr>
        <td>${esc(x.ID)}</td>
        <td>${esc(x.Name)}</td>
        <td>${esc(x.Phone)}</td>
        <td>${esc(x.Address)}</td>
        <td>
          <button onclick="editCustomer('${esc(x.ID)}')">✏️ Edit</button>
          <button onclick="deleteCustomer('${esc(x.ID)}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join("");


  /* Vendors */

  $("vendorTable").innerHTML=
    data.vendors.map(x=>`
      <tr>
        <td>${esc(x.ID)}</td>
        <td>${esc(x.Name)}</td>
        <td>${esc(x.Phone)}</td>
        <td>${esc(x.Address)}</td>
        <td>
          <button onclick="editVendor('${esc(x.ID)}')">✏️ Edit</button>
          <button onclick="deleteVendor('${esc(x.ID)}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join("");


  /* Products */

  $("productTable").innerHTML=
    data.products.map(x=>{

      const s=data.stock.find(
        y=>y.ProductID==x.ID
      );

      return `
        <tr>
          <td>${esc(x.Code)}</td>
          <td>${esc(x.Name)}</td>
          <td>${esc(x.Category)}</td>
          <td>${esc(x.Unit)}</td>
          <td>${money(x.PurchasePrice)}</td>
          <td>${money(x.SalesPrice)}</td>
          <td>${s?.CurrentStock||0}</td>
          <td>${x.MinimumStock||0}</td>
          <td>
            <button onclick="editProduct('${esc(x.ID)}')">✏️ Edit</button>
            <button onclick="deleteProduct('${esc(x.ID)}')">🗑️ Delete</button>
          </td>
        </tr>
      `;
    }).join("");


  /* Inventory */

  $("inventoryTable").innerHTML=
    data.products.map(x=>{

      const s=data.stock.find(
        y=>y.ProductID==x.ID
      );

      const st=Number(s?.CurrentStock||0);

      return `
        <tr>
          <td>${esc(x.Code)}</td>
          <td>${esc(x.Name)}</td>
          <td>${esc(x.Unit)}</td>
          <td>${st}</td>
          <td>${x.MinimumStock||0}</td>
          <td class="${st<=Number(x.MinimumStock||0)?"low":""}">
            ${st<=Number(x.MinimumStock||0)?"LOW STOCK":"OK"}
          </td>
          <td>${money(
            st*Number(x.PurchasePrice||0)
          )}</td>
        </tr>
      `;
    }).join("");


  /* Low Stock */

  $("lowStock").innerHTML=
    data.products
      .filter(x=>{

        const s=data.stock.find(
          y=>y.ProductID==x.ID
        );

        return Number(s?.CurrentStock||0)
          <=Number(x.MinimumStock||0);

      })
      .map(x=>{

        const s=data.stock.find(
          y=>y.ProductID==x.ID
        );

        return `
          <div class="low">
            ${esc(x.Name)} —
            ${s?.CurrentStock||0}
            ${esc(x.Unit)}
          </div>
        `;

      }).join("")||"No low-stock items";


  /* Select options */

  opts(
    "purVendor",
    data.vendors,
    "Select Vendor"
  );

  opts(
    "purProduct",
    data.products,
    "Select Product"
  );

  opts(
    "saleCustomer",
    data.customers,
    "Select Customer"
  );

  opts(
    "saleProduct",
    data.products,
    "Select Product"
  );


  /* Purchase price */

  $("purProduct").onchange=()=>{

    const p=data.products.find(
      x=>x.ID===$("purProduct").value
    );

    if(p){
      $("purRate").value=p.PurchasePrice||0;
    }
  };


  /* Sale price */

  $("saleProduct").onchange=()=>{

    const p=data.products.find(
      x=>x.ID===$("saleProduct").value
    );

    if(p){
      $("saleRate").value=p.SalesPrice||0;
    }
  };


  /* Purchases */

  $("purchaseTable").innerHTML=
    data.purchases.slice().reverse().map(x=>

      data.purchaseItems
        .filter(i=>i.PurchaseID===x.ID)
        .map(i=>{

          const v=data.vendors.find(
            y=>y.ID===x.VendorID
          );

          const p=data.products.find(
            y=>y.ID===i.ProductID
          );

          return `
            <tr>
              <td>${new Date(x.Date).toLocaleDateString("en-CA")}</td>
              <td>${esc(v?.Name||"")}</td>
              <td>${esc(p?.Name||"")}</td>
              <td>${i.Quantity}</td>
              <td>${money(i.Rate)}</td>
              <td>${money(i.Total)}</td>
              <td>${money(x.Paid)}</td>
              <td>${money(x.Due)}</td>
              <td>
                <button onclick="editPurchase('${esc(x.ID)}')">✏️ Edit</button>
                <button onclick="deletePurchase('${esc(x.ID)}')">🗑️ Delete</button>
              </td>
            </tr>
          `;

        }).join("")

    ).join("");


  /* Sales */

  $("salesTable").innerHTML=
    data.sales.slice().reverse().map(x=>

      data.salesItems
        .filter(i=>i.SaleID===x.ID)
        .map(i=>{

          const c=data.customers.find(
            y=>y.ID===x.CustomerID
          );

          const p=data.products.find(
            y=>y.ID===i.ProductID
          );

          return `
            <tr>
              <td>${new Date(x.Date).toLocaleDateString("en-CA")}</td>
              <td>${esc(c?.Name||"")}</td>
              <td>${esc(p?.Name||"")}</td>
              <td>${i.Quantity}</td>
              <td>${money(i.Rate)}</td>
              <td>${money(i.Total)}</td>
              <td>${money(x.Paid)}</td>
              <td>${money(x.Due)}</td>
              <td>
                <button onclick="editSale('${esc(x.ID)}')">✏️ Edit</button>
                <button onclick="deleteSale('${esc(x.ID)}')">🗑️ Delete</button>
              </td>
            </tr>
          `;

        }).join("")

    ).join("");
}


/* =========================
   REPORT
========================= */

function renderPivot(){

  const f=$("fromDate").value;
  const t=$("toDate").value;

  const ps=data.purchases
    .filter(x=>
      !f||
      new Date(x.Date)
        .toLocaleDateString("en-CA")>=f
    )
    .filter(x=>
      !t||
      new Date(x.Date)
        .toLocaleDateString("en-CA")<=t
    );

  const ss=data.sales
    .filter(x=>
      !f||
      new Date(x.Date)
        .toLocaleDateString("en-CA")>=f
    )
    .filter(x=>
      !t||
      new Date(x.Date)
        .toLocaleDateString("en-CA")<=t
    );

  const pt=ps.reduce(
    (a,x)=>a+Number(x.Total||0),
    0
  );

  const st=ss.reduce(
    (a,x)=>a+Number(x.Total||0),
    0
  );

  $("pivotReport").innerHTML=`
    <div class="cards">

      <div class="card">
        Purchase Total
        <div class="num">${money(pt)}</div>
      </div>

      <div class="card">
        Sales Total
        <div class="num">${money(st)}</div>
      </div>

      <div class="card">
        Difference
        <div class="num">${money(st-pt)}</div>
      </div>

    </div>
  `;
}


/* =========================
   CSV
========================= */

function exportCSV(){

  const rows=[
    [
      "Type",
      "Date",
      "Party",
      "Product",
      "Qty",
      "Rate",
      "Total",
      "Paid",
      "Due"
    ]
  ];

  data.purchases.forEach(x=>{

    data.purchaseItems
      .filter(i=>i.PurchaseID===x.ID)
      .forEach(i=>{

        const v=data.vendors.find(
          y=>y.ID===x.VendorID
        );

        const p=data.products.find(
          y=>y.ID===i.ProductID
        );

        rows.push([
          "Purchase",
          x.Date,
          v?.Name||"",
          p?.Name||"",
          i.Quantity,
          i.Rate,
          i.Total,
          x.Paid,
          x.Due
        ]);
      });
  });


  data.sales.forEach(x=>{

    data.salesItems
      .filter(i=>i.SaleID===x.ID)
      .forEach(i=>{

        const c=data.customers.find(
          y=>y.ID===x.CustomerID
        );

        const p=data.products.find(
          y=>y.ID===i.ProductID
        );

        rows.push([
          "Sales",
          x.Date,
          c?.Name||"",
          p?.Name||"",
          i.Quantity,
          i.Rate,
          i.Total,
          x.Paid,
          x.Due
        ]);
      });
  });


  const csv=rows.map(r=>
    r.map(v=>
      `"${String(v).replaceAll('"','""')}"`
    ).join(",")
  ).join("\n");


  const a=document.createElement("a");

  a.href=URL.createObjectURL(
    new Blob(
      ["\ufeff"+csv],
      {type:"text/csv"}
    )
  );

  a.download="inventory-report.csv";

  a.click();
}


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".navbtn")
.forEach(b=>{

  b.onclick=()=>{

    document.querySelectorAll(".navbtn")
      .forEach(x=>x.classList.remove("active"));

    b.classList.add("active");

    document.querySelectorAll(".page")
      .forEach(x=>x.classList.remove("active"));

    const page=$(b.dataset.page);

    if(page){
      page.classList.add("active");
    }
  };

});


/* =========================
   START
========================= */

loadAll();
