const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "docedindingourmet_cart_v1";

// ✅ Troque para o seu WhatsApp: ex BR = 55, Fortaleza DDD 85, número 9xxxx...
// Exemplo: "5585999999999"
const WHATSAPP_PHONE = "5585989326734";

// Catálogo (edite preços e sabores)
const products = [
  { id:"p1", name:"Morango com Leite Ninho", price: 6.50, cat:"Premium", desc:"Cremoso e docinho na medida." },
  { id:"p2", name:"Oreo", price: 7.00, cat:"Premium", desc:"Chocolate + pedacinhos de Oreo." },
  { id:"p3", name:"Brigadeiro", price: 6.00, cat:"Clássicos", desc:"Sabor chocolate tradicional." },
  { id:"p4", name:"Coco", price: 5.50, cat:"Clássicos", desc:"Levinho e bem geladinho." },
  { id:"p5", name:"Maracujá", price: 6.00, cat:"Frutas", desc:"Azulzinho? não — aqui é azedinho e cremoso 😄" },
  { id:"p6", name:"Limão", price: 5.50, cat:"Frutas", desc:"Refrescante e perfeito pro calor." },
  { id:"p7", name:"Chocolate Trufado", price: 7.50, cat:"Premium", desc:"Mais intenso, mais cremoso." },
  { id:"p8", name:"Paçoca", price: 6.50, cat:"Clássicos", desc:"Sabor Brasil! Bem amendoim." },
  { id:"p9", name:"Uva", price: 5.50, cat:"Frutas", desc:"Docinho e refrescante." }
];

// ===== Cart =====
function loadCart(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveCart(cart){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function cartCount(cart){
  return Object.values(cart).reduce((acc, n) => acc + n, 0);
}
function brl(v){
  return v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}
function getProduct(id){
  return products.find(p => p.id === id);
}
function calcSubtotal(cart){
  let sum = 0;
  for(const [id, qty] of Object.entries(cart)){
    const p = getProduct(id);
    if(p) sum += p.price * qty;
  }
  return sum;
}

// ===== Render catálogo =====
const grid = $("grid");
const q = $("q");
const chips = $("chips");

let currentCat = "Todos";

function renderProducts(){
  const term = (q.value || "").trim().toLowerCase();
  grid.innerHTML = "";

  const filtered = products.filter(p => {
    const matchCat = currentCat === "Todos" ? true : p.cat === currentCat;
    const matchTerm = !term ? true : (p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term));
    return matchCat && matchTerm;
  });

  if(filtered.length === 0){
    grid.innerHTML = `<div class="card" style="grid-column: 1 / -1;">
      <h4>Nenhum sabor encontrado</h4>
      <p class="desc">Tente outro termo de busca.</p>
    </div>`;
    return;
  }

  for(const p of filtered){
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="cardTop">
        <div>
          <h4>${escapeHtml(p.name)}</h4>
          <p class="desc">${escapeHtml(p.desc)}</p>
        </div>
        <span class="badge">${escapeHtml(p.cat)}</span>
      </div>

      <div class="priceRow">
        <div class="price">${brl(p.price)}</div>
        <div class="muted small">unidade</div>
      </div>

      <div class="cardActions">
        <button class="qtyBtn" type="button" data-act="minus" data-id="${p.id}" aria-label="Diminuir">−</button>
        <button class="btn primary addBtn" type="button" data-act="add" data-id="${p.id}">Adicionar</button>
        <button class="qtyBtn" type="button" data-act="plus" data-id="${p.id}" aria-label="Aumentar">+</button>
      </div>
    `;
    grid.appendChild(el);
  }
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

// ===== Drawer carrinho =====
const drawer = $("drawer");
const drawerOverlay = $("drawerOverlay");
const btnOpenCart = $("btnOpenCart");
const btnCloseCart = $("btnCloseCart");

const cartCountEl = $("cartCount");
const cartSubtitle = $("cartSubtitle");
const cartEmpty = $("cartEmpty");
const cartList = $("cartList");
const subtotalEl = $("subtotal");
const totalEl = $("total");

const customerName = $("customerName");
const address = $("address");
const notes = $("notes");

const btnWhats = $("btnWhats");
const btnWhatsTop = $("btnWhatsTop");
const btnClear = $("btnClear");

function openCart(){
  drawer.classList.add("show");
  drawer.setAttribute("aria-hidden","false");
  renderCart();
}
function closeCart(){
  drawer.classList.remove("show");
  drawer.setAttribute("aria-hidden","true");
}

btnOpenCart.addEventListener("click", openCart);
btnCloseCart.addEventListener("click", closeCart);
drawerOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeCart();
});

function renderCart(){
  const cart = loadCart();
  const count = cartCount(cart);
  cartCountEl.textContent = String(count);
  cartSubtitle.textContent = `${count} item(ns)`;

  const sub = calcSubtotal(cart);
  subtotalEl.textContent = brl(sub);
  totalEl.textContent = brl(sub);

  cartList.innerHTML = "";
  const entries = Object.entries(cart);

  if(entries.length === 0){
    cartEmpty.style.display = "block";
    cartList.style.display = "none";
    return;
  }
  cartEmpty.style.display = "none";
  cartList.style.display = "flex";

  for(const [id, qty] of entries){
    const p = getProduct(id);
    if(!p) continue;

    const item = document.createElement("div");
    item.className = "cartItem";
    item.innerHTML = `
      <div class="cartRow">
        <div>
          <h5>${escapeHtml(p.name)}</h5>
          <div class="cartMeta">${escapeHtml(p.cat)} • ${brl(p.price)} un</div>
        </div>
        <strong>${brl(p.price * qty)}</strong>
      </div>

      <div class="cartControls">
        <div class="qty">
          <button class="qtyBtn" type="button" data-cact="dec" data-id="${p.id}">−</button>
          <span>${qty}</span>
          <button class="qtyBtn" type="button" data-cact="inc" data-id="${p.id}">+</button>
        </div>

        <button class="linkBtn" type="button" data-cact="rm" data-id="${p.id}">Remover</button>
      </div>
    `;
    cartList.appendChild(item);
  }
}

function changeQty(id, delta){
  const cart = loadCart();
  const cur = cart[id] || 0;
  const next = cur + delta;
  if(next <= 0) delete cart[id];
  else cart[id] = next;
  saveCart(cart);
  renderCart();
}

function addOne(id){
  changeQty(id, +1);
}
function removeOne(id){
  changeQty(id, -1);
}

// Clicks no catálogo
grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.getAttribute("data-act");
  const id = btn.getAttribute("data-id");
  if(!act || !id) return;

  if(act === "add" || act === "plus") addOne(id);
  if(act === "minus") removeOne(id);

  // feedback visual rápido
  cartCountEl.textContent = String(cartCount(loadCart()));
});

// Clicks no carrinho
cartList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.getAttribute("data-cact");
  const id = btn.getAttribute("data-id");
  if(!act || !id) return;

  if(act === "inc") addOne(id);
  if(act === "dec") removeOne(id);
  if(act === "rm") {
    const cart = loadCart();
    delete cart[id];
    saveCart(cart);
    renderCart();
  }
});

// Chips filtro
chips.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if(!b) return;
  const cat = b.getAttribute("data-cat");
  if(!cat) return;

  currentCat = cat;
  for(const x of chips.querySelectorAll(".chip")) x.classList.remove("active");
  b.classList.add("active");
  renderProducts();
});

q.addEventListener("input", renderProducts);

// Botões extras
$("btnAddPopular").addEventListener("click", () => {
  // Kit Popular: 1 Morango Ninho + 1 Brigadeiro + 1 Maracujá
  addOne("p1"); addOne("p3"); addOne("p5");
  openCart();
});

// WhatsApp (top - mensagem padrão)
btnWhatsTop.addEventListener("click", (e) => {
  e.preventDefault();
  const url = makeWhatsUrl({ simple:true });
  window.open(url, "_blank", "noopener");
});

btnWhats.addEventListener("click", () => {
  const cart = loadCart();
  if(Object.keys(cart).length === 0){
    alert("Seu carrinho está vazio. Adicione pelo menos 1 item 😊");
    return;
  }
  const url = makeWhatsUrl({ simple:false });
  window.open(url, "_blank", "noopener");
});

btnClear.addEventListener("click", () => {
  if(!confirm("Deseja limpar o carrinho?")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderCart();
  cartCountEl.textContent = "0";
});

function makeWhatsUrl({ simple }){
  const cart = loadCart();
  const sub = calcSubtotal(cart);

  let lines = [];
  lines.push("Olá! Quero fazer um pedido da docedindingourmet 💗");
  lines.push("");

  if(simple){
    lines.push("Quero saber os sabores e valores disponíveis 😊");
  }else{
    lines.push("🧾 *Itens do pedido:*");
    for(const [id, qty] of Object.entries(cart)){
      const p = getProduct(id);
      if(!p) continue;
      lines.push(`- ${qty}x ${p.name} (${brl(p.price)}): ${brl(p.price*qty)}`);
    }
    lines.push("");
    lines.push(`💰 *Subtotal:* ${brl(sub)}`);
    lines.push("🚚 *Entrega:* a combinar");
    lines.push("");

    const name = (customerName.value || "").trim();
    const addr = (address.value || "").trim();
    const obs  = (notes.value || "").trim();

    if(name) lines.push(`👤 *Nome:* ${name}`);
    if(addr) lines.push(`📍 *Endereço:* ${addr}`);
    if(obs)  lines.push(`📝 *Obs:* ${obs}`);

    lines.push("");
    lines.push("Pode confirmar disponibilidade e o valor da entrega? 😊");
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
}

// Inicial
$("year").textContent = String(new Date().getFullYear());
renderProducts();
renderCart();
cartCountEl.textContent = String(cartCount(loadCart()));
