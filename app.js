const API_URL="https://script.google.com/macros/s/AKfycbzf-dmyNPFw7VVV6fUIi0Qap9DvdB54UIrsZVy--Ivjii0XvDelPYaC3Rjy-d4KCvE/exec";
let data={customers:[],vendors:[],products:[],purchases:[],purchaseItems:[],sales:[],salesItems:[],payments:[],stock:[],settings:[],backupLog:[]};
const $=id=>document.getElementById(id), money=n=>Number(n||0).toLocaleString("en-BD",{minimumFractionDigits:2,maximumFractionDigits:2}), esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
async function api(action,payload={}){
  try{
    const r=await fetch(API_URL,{
      method:"POST",
      headers:{
        "Content-Type":"text/plain;charset=utf-8"
      },
      body:JSON.stringify({
        action,
        data:payload
      }),
      redirect:"follow"
    });

    const j=await r.json();

    if(!j.success){
      throw Error(j.message||"Server error");
    }

    return j;

  }catch(e){
    $("syncStatus").textContent="Error";
    alert("Cloud connection error: "+e.message);
    throw e;
  }
}
async function loadAll(){try{$("syncStatus").textContent="Syncing...";const j=await api("getAll");data=j.data;renderAll();$("syncStatus").textContent="☁️ Cloud Synced"}catch(e){}}
function opts(sel,arr,ph){$(sel).innerHTML=`<option value="">${ph}</option>`+arr.map(x=>`<option value="${esc(x.ID)}">${esc(x.Name||x.Code||x.ID)}</option>`).join("")}
async function addCustomer(){let name=$("cName").value.trim();if(!name)return alert("Customer name দিন");await api("addCustomer",{name,phone:$("cPhone").value,address:$("cAddress").value});["cName","cPhone","cAddress"].forEach(x=>$(x).value="");loadAll()}
async function addVendor(){let name=$("vName").value.trim();if(!name)return alert("Vendor name দিন");await api("addVendor",{name,phone:$("vPhone").value,address:$("vAddress").value});["vName","vPhone","vAddress"].forEach(x=>$(x).value="");loadAll()}
async function addProduct(){let code=$("pCode").value.trim(),name=$("pName").value.trim();if(!code||!name)return alert("Product code ও name দিন");await api("addProduct",{code,name,category:$("pCat").value,unit:$("pUnit").value||"pcs",purchasePrice:+$("pBuy").value||0,salesPrice:+$("pSell").value||0,openingStock:+$("pOpening").value||0,minimumStock:+$("pMin").value||0});["pCode","pName","pCat","pUnit","pBuy","pSell","pOpening","pMin"].forEach(x=>$(x).value="");loadAll()}
async function addPurchase(){let vendorId=$("purVendor").value,productId=$("purProduct").value,qty=+$("purQty").value,rate=+$("purRate").value,paid=+$("purPaid").value||0;if(!vendorId||!productId||qty<=0)return alert("Vendor, Product ও Quantity দিন");let j=await api("purchase",{vendorId,productId,qty,rate,paid});alert("Purchase saved. Total: "+money(j.total));loadAll()}
async function addSale(){let customerId=$("saleCustomer").value,productId=$("saleProduct").value,qty=+$("saleQty").value,rate=+$("saleRate").value,paid=+$("salePaid").value||0;if(!customerId||!productId||qty<=0)return alert("Customer, Product ও Quantity দিন");let j=await api("sale",{customerId,productId,qty,rate,paid});alert("Sale saved. Total: "+money(j.total));loadAll()}
async function backup(){let j=await api("backup",{});alert(j.message||"Backup created")}
function renderAll(){ $("dProducts").textContent=data.products.length;$("dCustomers").textContent=data.customers.length;$("dVendors").textContent=data.vendors.length;$("dStock").textContent=data.stock.reduce((a,x)=>a+Number(x.CurrentStock||0),0);$("dPurchase").textContent=money(data.purchases.reduce((a,x)=>a+Number(x.Total||0),0));$("dSales").textContent=money(data.sales.reduce((a,x)=>a+Number(x.Total||0),0));
$($("customerTable").innerHTML=data.customers.map(x=>`<tr><td>${esc(x.ID)}</td><td>${esc(x.Name)}</td><td>${esc(x.Phone)}</td><td>${esc(x.Address)}</td><td><button onclick="editCustomer('${esc(x.ID)}')">✏️ Edit</button><button onclick="deleteCustomer('${esc(x.ID)}')">🗑️ Delete</button></td></tr>`).join("");"customerTable").innerHTML=data.customers.map(x=>`<tr><td>${esc(x.ID)}</td><td>${esc(x.Name)}</td><td>${esc(x.Phone)}</td><td>${esc(x.Address)}</td></tr>`).join("");$("vendorTable").innerHTML=data.vendors.map(x=>`<tr><td>${esc(x.ID)}</td><td>${esc(x.Name)}</td><td>${esc(x.Phone)}</td><td>${esc(x.Address)}</td></tr>`).join("");
$("productTable").innerHTML=data.products.map(x=>{let s=data.stock.find(y=>y.ProductID==x.ID);return `<tr><td>${esc(x.Code)}</td><td>${esc(x.Name)}</td><td>${esc(x.Category)}</td><td>${esc(x.Unit)}</td><td>${money(x.PurchasePrice)}</td><td>${money(x.SalesPrice)}</td><td>${s?.CurrentStock||0}</td><td>${x.MinimumStock||0}</td></tr>`}).join("");
$("inventoryTable").innerHTML=data.products.map(x=>{let s=data.stock.find(y=>y.ProductID==x.ID),st=Number(s?.CurrentStock||0);return `<tr><td>${esc(x.Code)}</td><td>${esc(x.Name)}</td><td>${esc(x.Unit)}</td><td>${st}</td><td>${x.MinimumStock||0}</td><td class="${st<=Number(x.MinimumStock||0)?'low':''}">${st<=Number(x.MinimumStock||0)?'LOW STOCK':'OK'}</td><td>${money(st*Number(x.PurchasePrice||0))}</td></tr>`}).join("");
$("lowStock").innerHTML=data.products.filter(x=>{let s=data.stock.find(y=>y.ProductID==x.ID);return Number(s?.CurrentStock||0)<=Number(x.MinimumStock||0)}).map(x=>{let s=data.stock.find(y=>y.ProductID==x.ID);return `<div class="low">${esc(x.Name)} — ${s?.CurrentStock||0} ${esc(x.Unit)}</div>`}).join("")||"No low-stock items";
opts("purVendor",data.vendors,"Select Vendor");opts("purProduct",data.products,"Select Product");opts("saleCustomer",data.customers,"Select Customer");opts("saleProduct",data.products,"Select Product");
$("purProduct").onchange=()=>{let p=data.products.find(x=>x.ID==$("purProduct").value);if(p)$("purRate").value=p.PurchasePrice||0};$("saleProduct").onchange=()=>{let p=data.products.find(x=>x.ID==$("saleProduct").value);if(p)$("saleRate").value=p.SalesPrice||0};
$("purchaseTable").innerHTML=data.purchases.slice().reverse().map(x=>data.purchaseItems.filter(i=>i.PurchaseID===x.ID).map(i=>{let v=data.vendors.find(y=>y.ID===x.VendorID),p=data.products.find(y=>y.ID===i.ProductID);return `<tr><td>${new Date(x.Date).toLocaleDateString("en-CA")}</td><td>${esc(v?.Name)}</td><td>${esc(p?.Name)}</td><td>${i.Quantity}</td><td>${money(i.Rate)}</td><td>${money(i.Total)}</td><td>${money(x.Paid)}</td><td>${money(x.Due)}</td></tr>`}).join("")).join("");
$("salesTable").innerHTML=data.sales.slice().reverse().map(x=>data.salesItems.filter(i=>i.SaleID===x.ID).map(i=>{let c=data.customers.find(y=>y.ID===x.CustomerID),p=data.products.find(y=>y.ID===i.ProductID);return `<tr><td>${new Date(x.Date).toLocaleDateString("en-CA")}</td><td>${esc(c?.Name)}</td><td>${esc(p?.Name)}</td><td>${i.Quantity}</td><td>${money(i.Rate)}</td><td>${money(i.Total)}</td><td>${money(x.Paid)}</td><td>${money(x.Due)}</td></tr>`}).join("")).join("")}
function renderPivot(){let f=$("fromDate").value,t=$("toDate").value,ps=data.purchases.filter(x=>!f||new Date(x.Date).toLocaleDateString("en-CA")>=f).filter(x=>!t||new Date(x.Date).toLocaleDateString("en-CA")<=t),ss=data.sales.filter(x=>!f||new Date(x.Date).toLocaleDateString("en-CA")>=f).filter(x=>!t||new Date(x.Date).toLocaleDateString("en-CA")<=t),pt=ps.reduce((a,x)=>a+Number(x.Total||0),0),st=ss.reduce((a,x)=>a+Number(x.Total||0),0);$("pivotReport").innerHTML=`<div class="cards"><div class="card">Purchase Total<div class="num">${money(pt)}</div></div><div class="card">Sales Total<div class="num">${money(st)}</div></div><div class="card">Difference<div class="num">${money(st-pt)}</div></div></div>`}
function exportCSV(){let rows=[["Type","Date","Party","Product","Qty","Rate","Total","Paid","Due"]];data.purchases.forEach(x=>data.purchaseItems.filter(i=>i.PurchaseID===x.ID).forEach(i=>{let v=data.vendors.find(y=>y.ID===x.VendorID),p=data.products.find(y=>y.ID===i.ProductID);rows.push(["Purchase",x.Date,v?.Name||"",p?.Name||"",i.Quantity,i.Rate,i.Total,x.Paid,x.Due])}));data.sales.forEach(x=>data.salesItems.filter(i=>i.SaleID===x.ID).forEach(i=>{let c=data.customers.find(y=>y.ID===x.CustomerID),p=data.products.find(y=>y.ID===i.ProductID);rows.push(["Sales",x.Date,c?.Name||"",p?.Name||"",i.Quantity,i.Rate,i.Total,x.Paid,x.Due])}));let csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv"}));a.download="inventory-report.csv";a.click()}
document.querySelectorAll(".navbtn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".navbtn").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(b.dataset.page).classList.add("active")});loadAll();
async function deleteCustomer(id){
  if(!confirm("এই Customer-টি Delete করতে চান?")) return;

  await api("deleteCustomer", {id});

  alert("Customer deleted successfully");

  await loadAll();
}

async function editCustomer(id){

  const customer = data.customers.find(x => String(x.ID) === String(id));

  if(!customer) return alert("Customer পাওয়া যায়নি");

  const name = prompt("Customer Name:", customer.Name || "");
  if(name === null) return;

  const phone = prompt("Phone:", customer.Phone || "");
  if(phone === null) return;

  const address = prompt("Address:", customer.Address || "");
  if(address === null) return;

  if(!name.trim()){
    return alert("Customer name খালি রাখা যাবে না");
  }

  await api("updateCustomer", {
    ID: customer.ID,
    name: name.trim(),
    phone: phone,
    address: address
  });

  alert("Customer updated successfully");

  await loadAll();
}
