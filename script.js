let menuItems = [];
let cart = [];

window.onload = function() {
  const savedData = localStorage.getItem("menuItems");
  if (savedData) {
    menuItems = JSON.parse(savedData);
    displayMenu(menuItems);
  } else {
    loadMenuFromJSON();
  }
};

function loadMenuFromJSON() {
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      menuItems = data;
      saveToLocal();
      displayMenu(menuItems);
    });
}

function displayMenu(items) {
  const menuContainer = document.getElementById("menuContainer");
  menuContainer.innerHTML = "";
  if (items.length === 0) {
    menuContainer.innerHTML = "<p>No coffee found ☕</p>";
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
      <div class="menu-item">
        <h4>${item.name}</h4>
        <p class="price">Rs ${item.price}</p>
        <p>${item.description}</p>
        <button onclick="addToCart(${index})"><i class="fa fa-plus"></i> Add to Cart</button>
      </div>`;
    menuContainer.appendChild(card);
  });
}

document.getElementById("searchInput").addEventListener("keyup", function() {
  const searchText = this.value.toLowerCase();
  const filtered = menuItems.filter(item => item.name.toLowerCase().includes(searchText));
  displayMenu(filtered);
});

document.getElementById("addForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const desc = document.getElementById("desc").value.trim();

  if (!name || !price || !desc) return alert("⚠️ Please fill all fields!");
  const newItem = { name, price: Number(price), description: desc };
  menuItems.push(newItem);
  saveToLocal();
  displayMenu(menuItems);
  this.reset();
  alert("☕ Coffee added successfully!");
});

function saveToLocal() {
  localStorage.setItem("menuItems", JSON.stringify(menuItems));
}

function addToCart(index) {
  const item = menuItems[index];
  const found = cart.find(c => c.name === item.name);
  if (found) found.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCart();
}

function updateCart() {
  const cartContainer = document.getElementById("cartContainer");
  cartContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center mb-3";
    div.innerHTML = `
      <strong>${item.name}</strong>
      <div>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${i}, -1)">-</button>
        <span class="mx-2">${item.qty}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${i}, 1)">+</button>
      </div>
      <span>Rs ${item.price * item.qty}</span>
    `;
    cartContainer.appendChild(div);
  });

  document.getElementById("totalAmount").textContent = total;
}

function changeQty(i, change) {
  cart[i].qty += change;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCart();
}

document.getElementById("payBtn").addEventListener("click", function() {
  if (cart.length === 0) return alert("Your cart is empty!");
  generateReceipt();
});

function generateReceipt() {
  const receipt = document.getElementById("receiptContainer");
  receipt.innerHTML = "<h6>🧾 Cozy Coffee Receipt</h6><hr>";
  let total = 0;

  cart.forEach(item => {
    const line = document.createElement("p");
    line.textContent = `${item.name} (${item.qty}) - Rs ${item.price * item.qty}`;
    receipt.appendChild(line);
    total += item.price * item.qty;
  });

  receipt.innerHTML += `<hr><strong>Total: Rs ${total}</strong><br><em>Thank you for visiting Cozy Coffee ☕</em>`;
  receipt.style.display = "block";

  cart = [];
  updateCart();
}
