document.addEventListener('DOMContentLoaded', () => {
    const catalogContainer = document.getElementById('catalog-container');
    const cartSummary = document.getElementById('cart-summary');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const closeModalButton = document.querySelector('.close-button');
    const checkoutButton = document.getElementById('checkout-button');

    const whatsappNumber = "529931701376"; // Reemplaza con tu número de WhatsApp

    let cart = [];
    let products = [];

    // Function to render the product catalog from JSON
    const renderCatalog = (catalog) => {
        products = catalog;
        catalogContainer.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">$${product.price} MXN</p>
                    <button class="add-button" data-id="${product.id}">Agregar al carrito</button>
                </div>
            `;
            catalogContainer.appendChild(productCard);
        });
    };

    // Fetch the catalog data
    fetch('catalog.json')
        .then(response => response.json())
        .then(data => renderCatalog(data))
        .catch(error => console.error('Error fetching catalog:', error));

    // Handle add to cart clicks
    catalogContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-button')) {
            const productId = parseInt(e.target.dataset.id);
            const productToAdd = products.find(p => p.id === productId);

            const existingCartItem = cart.find(item => item.id === productId);
            if (existingCartItem) {
                existingCartItem.quantity++;
            } else {
                cart.push({ ...productToAdd, quantity: 1 });
            }
            updateCart();
        }
    });

    // Update cart UI
    const updateCart = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCount.textContent = totalItems;
        renderCartItems();
    };

    // Render cart items in the modal
    const renderCartItems = () => {
        cartItemsList.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="text-align: center; color: #777;">El carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span>${item.name} ($${item.price} MXN)</span>
                    <div class="item-quantity-control">
                        <button class="quantity-button" data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-button" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                `;
                cartItemsList.appendChild(itemElement);
                total += item.quantity * item.price;
            });
        }
        cartTotalSpan.textContent = total;
        // Disable checkout button if cart is empty
        checkoutButton.disabled = cart.length === 0;
        checkoutButton.textContent = cart.length > 0 ? 'Reservar por WhatsApp' : 'Carrito vacío';
    };

    // Handle quantity changes in the cart
    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-button')) {
            const productId = parseInt(target.dataset.id);
            const action = target.dataset.action;
            const cartItem = cart.find(item => item.id === productId);

            if (cartItem) {
                if (action === 'increase') {
                    cartItem.quantity++;
                } else if (action === 'decrease') {
                    cartItem.quantity--;
                    if (cartItem.quantity <= 0) {
                        cart = cart.filter(item => item.id !== productId);
                    }
                }
                updateCart();
            }
        }
    });

    // Show/hide modal
    cartSummary.addEventListener('click', () => {
        cartModal.style.display = 'flex';
        renderCartItems();
    });

    closeModalButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Generate WhatsApp message and redirect
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            // Do nothing if cart is empty, button is disabled
            return;
        }

        const orderDetails = cart.map(item => `${item.quantity} x ${item.name} ($${item.price * item.quantity} MXN)`).join('\n');
        const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
        
        const message = `¡Hola! Me gustaría hacer un pedido:\n\n${orderDetails}\n\nTotal: $${total} MXN\n\nEstoy en la universidad para recoger mi pedido. ¡Gracias!`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Reset cart after checkout
        cart = [];
        updateCart();
        cartModal.style.display = 'none';
    });
});
