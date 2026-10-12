/* Demo Store behavior only. Analytics tracking is configured separately in Adobe Data Collection Tags. */
(function () {
  "use strict";

  const PRODUCTS = {
    Product_A: {
      id: "Product_A",
      name: "Wireless Headphones",
      category: "Electronics",
      price: 2499,
      description: "Comfortable everyday headphones for work, travel, and listening.",
      art: "A",
      artClass: "art-blue"
    },
    Product_B: {
      id: "Product_B",
      name: "Everyday Hoodie",
      category: "Clothing",
      price: 1499,
      description: "A soft, versatile hoodie for everyday comfort.",
      art: "B",
      artClass: "art-orange"
    },
    Product_C: {
      id: "Product_C",
      name: "Everyday Backpack",
      category: "Accessories",
      price: 1999,
      description: "A practical backpack for daily essentials.",
      art: "C",
      artClass: "art-green"
    }
  };

  const CART_KEY = "demoStoreCart";
  const ORDER_KEY = "demoStoreLastOrder";

  function getCart() {
    try {
      const value = JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
      // Migrate the earlier single-product cart format, if one exists.
      if (value && !Array.isArray(value) && value.productId) {
        const migrated = [{ productId: value.productId }];
        sessionStorage.setItem(CART_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function saveCart(cart) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = String(getCart().length);
  }

  function currentProductId() {
    const requested = new URLSearchParams(window.location.search).get("product");
    return PRODUCTS[requested] ? requested : "Product_A";
  }

  function addProductToCart(productId) {
    const cart = getCart();
    if (!cart.some(item => item.productId === productId)) {
      cart.push({ productId: productId });
      saveCart(cart);
      return true;
    }
    return false;
  }

  function renderProductPage() {
    const id = currentProductId();
    const product = PRODUCTS[id];
    const name = document.getElementById("product-name");
    if (!name) return;

    document.title = "Demo Store | " + product.name;
    name.textContent = product.name;
    document.getElementById("product-category").textContent = product.category;
    document.getElementById("product-price").textContent = formatPrice(product.price);
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-id-display").textContent = product.id;

    const art = document.getElementById("product-art");
    art.textContent = product.art;
    art.classList.remove("art-blue", "art-orange", "art-green");
    art.classList.add(product.artClass);
    art.setAttribute("data-product-id", product.id);

    const addButton = document.getElementById("add-to-cart-button");
    addButton.dataset.productId = product.id;
    addButton.dataset.productCategory = product.category;
    addButton.dataset.productPrice = String(product.price);

    addButton.addEventListener("click", function () {
      const wasAdded = addProductToCart(product.id);
      const message = document.getElementById("product-message");
      message.textContent = wasAdded
        ? product.name + " was added to your cart."
        : product.name + " is already in your cart. You can add Products A, B, and C, but only one of each.";
      addButton.textContent = wasAdded ? "Added to Cart" : "Already in Cart";
      addButton.dataset.cartActionResult = wasAdded ? "success" : "already-added";
    });
  }

  function renderCartPage() {
    const container = document.getElementById("cart-content");
    const itemsElement = document.getElementById("cart-items");
    if (!container || !itemsElement) return;

    const cart = getCart().filter(item => PRODUCTS[item.productId]);
    if (cart.length === 0) {
      itemsElement.innerHTML =
        '<div class="empty-cart"><h2>Your cart is empty</h2><p>Add one or more different products before checkout.</p><a class="button" href="index.html#products" id="empty-cart-browse-button">Browse products</a></div>';
      document.getElementById("cart-total").textContent = formatPrice(0);
      document.getElementById("proceed-to-pay-button").disabled = true;
      document.getElementById("proceed-to-pay-button").classList.add("button-disabled");
      return;
    }

    itemsElement.innerHTML = "";
    let total = 0;

    cart.forEach(function (item) {
      const product = PRODUCTS[item.productId];
      total += product.price;

      const row = document.createElement("article");
      row.className = "cart-item";
      row.dataset.productId = product.id;

      const art = document.createElement("div");
      art.className = "product-art " + product.artClass;
      art.setAttribute("aria-hidden", "true");
      art.textContent = product.art;

      const copy = document.createElement("div");
      copy.className = "cart-item-copy";

      const category = document.createElement("p");
      category.className = "category-label";
      category.textContent = product.category;

      const name = document.createElement("h2");
      name.textContent = product.name;

      const id = document.createElement("p");
      id.textContent = "Product ID: " + product.id;

      copy.append(category, name, id);

      const actions = document.createElement("div");
      actions.className = "cart-item-actions";

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = formatPrice(product.price);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button button-secondary remove-cart-item-button";
      remove.id = "remove-" + product.id.toLowerCase().replace(/_/g, "-") + "-button";
      remove.dataset.action = "remove-from-cart";
      remove.dataset.productId = product.id;
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        saveCart(getCart().filter(cartItem => cartItem.productId !== product.id));
        renderCartPage();
      });

      actions.append(price, remove);
      row.append(art, copy, actions);
      itemsElement.appendChild(row);
    });

    document.getElementById("cart-total").textContent = formatPrice(total);

    const proceed = document.getElementById("proceed-to-pay-button");
    proceed.disabled = false;
    proceed.classList.remove("button-disabled");

    // Replacing the button removes any old handler if this function is called again.
    const replacement = proceed.cloneNode(true);
    proceed.parentNode.replaceChild(replacement, proceed);
    replacement.addEventListener("click", function () {
      const selected = document.querySelector('input[name="checkout-method"]:checked');
      const checkoutMethod = selected ? selected.value : "Standard";
      const currentCart = getCart().filter(item => PRODUCTS[item.productId]);
      if (currentCart.length === 0) {
        renderCartPage();
        return;
      }

      const orderItems = currentCart.map(item => {
        const product = PRODUCTS[item.productId];
        return {
          productId: product.id,
          productName: product.name,
          productCategory: product.category,
          price: product.price
        };
      });

      const order = {
        purchaseId: "DEMO-" + Date.now() + "-" + Math.floor(Math.random() * 900 + 100),
        items: orderItems,
        total: orderItems.reduce((sum, item) => sum + item.price, 0),
        checkoutMethod: checkoutMethod,
        campaign: new URLSearchParams(window.location.search).get("utm_campaign") || null,
        createdAt: new Date().toISOString()
      };
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
      window.location.href = "confirmation.html";
    });
  }

  function renderConfirmationPage() {
    const heading = document.getElementById("confirmation-heading");
    if (!heading) return;

    let order = null;
    try { order = JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null"); }
    catch (_) { order = null; }

    if (!order) {
      document.getElementById("confirmation-message").textContent =
        "No demo order was found. Start from the home page and complete the checkout flow first.";
      return;
    }

    document.getElementById("purchase-id").textContent = order.purchaseId;
    const items = Array.isArray(order.items) ? order.items : [];
    document.getElementById("confirmation-product-name").textContent =
      items.map(item => item.productName).join(", ") || "Not available";
    document.getElementById("confirmation-product-id").textContent =
      items.map(item => item.productId).join(", ") || "Not available";
    document.getElementById("confirmation-product-category").textContent =
      [...new Set(items.map(item => item.productCategory))].join(", ") || "Not available";
    document.getElementById("confirmation-checkout-method").textContent = order.checkoutMethod || "Not available";
    document.getElementById("confirmation-total").textContent = formatPrice(order.total || 0);

    // Expose order details for Launch Data Elements.
    document.body.dataset.productId = items.map(item => item.productId).join(",");
    document.body.dataset.productCategory = [...new Set(items.map(item => item.productCategory))].join(",");
    document.body.dataset.checkoutMethod = order.checkoutMethod || "";
    document.body.dataset.purchaseId = order.purchaseId;
    document.body.dataset.purchaseAmount = String(order.total || 0);
    document.body.dataset.purchaseProducts = JSON.stringify(items);

    // Clear the cart after the order is shown. Keep the order separately so refreshes
    // still display the same confirmation and purchaseID for Adobe purchase deduplication.
    saveCart([]);
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    renderProductPage();
    renderCartPage();
    renderConfirmationPage();
  });
})();
