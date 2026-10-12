# Adobe Analytics e-commerce practice site

## Files
- `index.html`: Home page with links to Products A, B, and C.
- `product.html`: Reusable product detail page; product is selected by `?product=Product_A`, `Product_B`, or `Product_C`.
- `cart.html`: Cart, checkout method selection, and Proceed to Pay.
- `confirmation.html`: Simulated confirmation page; displays a stable `purchaseID` for the simulated order.
- `site.js`: UI/cart behavior only. Supports Products A, B, and C together in the cart (one of each), and clears the cart after a completed simulated purchase. Analytics rules are intended to be configured in Adobe Data Collection Tags.
- `styles.css`: Layout and visual styles.

## Before testing
1. Paste the same Tags embed code supplied by Adobe Data Collection into the `<head>` of all four HTML pages, replacing each TODO comment.
2. Host the folder on a local web server or a test site. Some browser features and analytics testing are more reliable over HTTP than by opening files directly with `file://`.
3. Open `index.html`, choose a product, add it to the cart, select a checkout method, proceed to pay, and verify the confirmation page.
4. Use Adobe Experience Platform Data Collection / Tags to create data elements and rules. This site's JavaScript intentionally does not send analytics beacons.

## Stable IDs for Launch selectors

### Page identification
- `body[data-page-type="home"]`
- `body[data-page-type="product"]`
- `body[data-page-type="cart"]`
- `body[data-page-type="confirmation"]`

### Product selection links (home)
- `#product-a-link` (data-product-id=`Product_A`)
- `#product-b-link` (data-product-id=`Product_B`)
- `#product-c-link` (data-product-id=`Product_C`)
- `#promo-product-link` (data-promo-type=`Summer_Sale`)

### Product page
- `#add-to-cart-button` (data-action=`add-to-cart`; runtime data attributes include `data-product-id`, `data-product-category`, `data-product-price`)
- `#product-id-display`
- `#product-category`
- `#product-name`
- `#product-price`

### Cart page
- `#checkout-standard` (radio value `Standard`)
- `#checkout-express` (radio value `Express`)
- `#proceed-to-pay-button` (data-action=`checkout-start`; runtime product data attributes added)
- `#cart-items` (container that renders all cart items), `#cart-total`; each rendered item has a Remove button such as `#remove-product-a-button`

### Confirmation page
- `#purchase-id`
- `#confirmation-product-id`
- `#confirmation-product-category`
- `#confirmation-checkout-method`
- `#confirmation-total`; confirmation page body also exposes `data-purchase-id`, `data-purchase-amount`, `data-product-id`, `data-product-category`, `data-checkout-method`, and `data-purchase-products`

## Suggested Launch rule structure
1. **Page View** — use a page-load event (commonly Library Loaded / Page Top or DOM Ready depending on your property setup), set `s.pageName`, `eVar1`, `eVar2`, and props as appropriate, then send the Page View action.
2. **Product View event** — on product page load, send custom `event1` (Product Views) and product context.
3. **Add to Cart** — click `#add-to-cart-button`, send standard `scAdd` with product context.
4. **Checkout Start** — click `#proceed-to-pay-button`, send standard `scCheckout` with product context and `prop1` selected checkout method.
5. **Purchase** — confirmation page load, send standard `purchase` with `purchaseID`, product ID/category, order amount, and selected checkout method. Ensure purchase ID is stable on refresh; this demo stores it in sessionStorage.

Do not fire a second Page View beacon from both a generic Page View rule and a Product View rule. The Product View rule should either be combined with the page-view rule or send only the custom event through a separate link/event call, depending on how your Launch rule is designed.

## Important notes
- Campaign is read from `utm_campaign` in the current URL only if you configure a Data Element/rule to read it. The promo link includes a sample `utm_campaign=Campaign_B`; other URLs may have no campaign parameter.
- Product prices and categories are mock data for practice only.
- No real payment details are collected.
- The UI does not automatically send analytics calls. Configure those in Tags as part of the exercise.


## Multi-product cart behavior
- The cart can contain Product A, Product B, and Product C at the same time.
- Adding the same product again does not create a duplicate line or quantity; this exercise is designed for one of each distinct product.
- Individual products can be removed from the cart using their Remove buttons.
- After reaching the confirmation page, the cart is emptied. The order is kept separately in `sessionStorage` so the confirmation still displays after a refresh and the same `purchaseID` remains available for purchase deduplication.
