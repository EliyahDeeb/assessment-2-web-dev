document.addEventListener("DOMContentLoaded", () => {
    // Existing code for mobile menu toggle
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');

    if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        });
    }

    if (close) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    }

    // Proceed to checkout functionality
    const checkoutButton = document.getElementById('checkout-btn'); // Get the checkout button by ID
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            // Show an alert when the button is clicked
            alert("None of these products are available, this is just a test website.");
        });
    } else {
        console.log("Checkout button not found!"); // Debugging log in case the button isn't found
    }

    // New code for cart functionality
    const removeButtons = document.querySelectorAll('.bx-x-square');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', removeItem);
    });

    // Handle updating quantities in cart
    const quantityInputs = document.querySelectorAll('input[type="number"]');
    
    quantityInputs.forEach(input => {
        input.addEventListener('input', updateSubtotal);
    });

    // Apply coupon functionality
    const couponInput = document.querySelector('#coupon input');
    const applyCouponButton = document.querySelector('#coupon button');
    
    if (couponInput && applyCouponButton) {
        applyCouponButton.addEventListener('click', applyCoupon);
    }

    // Update total whenever quantity changes
    function updateSubtotal(event) {
        const row = event.target.closest('tr');
        const priceCell = row.querySelector('td:nth-child(4)');
        const quantityInput = row.querySelector('input[type="number"]');
        
        const price = parseFloat(priceCell.textContent.replace(' AED', ''));
        const quantity = parseInt(quantityInput.value, 10);
        const subtotalCell = row.querySelector('td:nth-child(6)');
        
        const subtotal = price * quantity;
        subtotalCell.textContent = `${subtotal.toFixed(2)} AED`;

        updateCartTotal();
    }

    // Remove item from cart
    function removeItem(event) {
        const row = event.target.closest('tr');
        const productId = row.dataset.productId; // Use data attribute for product identification
        
        // Remove from cart in localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId); // Remove the product by its ID
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Remove the item from the cart table
        row.remove();

        // Update the total cost
        updateCartTotal();
    }

    // Update cart total
    function updateCartTotal() {
        const rows = document.querySelectorAll('#cart table tbody tr');
        let subtotal = 0;

        rows.forEach(row => {
            const subtotalCell = row.querySelector('td:nth-child(6)');
            subtotal += parseFloat(subtotalCell.textContent.replace(' AED', ''));
        });

        const subtotalElement = document.querySelector('#subtotal td:nth-child(2)');
        const totalElement = document.querySelector('#subtotal td:nth-child(2) strong');
        
        subtotalElement.textContent = `${subtotal.toFixed(2)} AED`;
        totalElement.textContent = `${subtotal.toFixed(2)} AED`;
    }

    // Apply coupon (simple mock for now)
    function applyCoupon() {
        const couponCode = couponInput.value.trim();
        const validCoupon = "DISCOUNT10"; // example coupon code
        const totalElement = document.querySelector('#subtotal td:nth-child(2) strong');
        
        if (couponCode === validCoupon) {
            let currentTotal = parseFloat(totalElement.textContent.replace(' AED', ''));
            let discount = currentTotal * 0.1; // 10% discount
            currentTotal -= discount;
            totalElement.textContent = `${currentTotal.toFixed(2)} AED`;
            alert("Coupon applied successfully!");
        } else {
            alert("Invalid coupon code.");
        }
    }

    // New functionality: Handle adding items to the cart
    const addToCartButtons = document.querySelectorAll('.normal'); // Buttons with class 'normal'

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopImmediatePropagation(); // Stop any other event handlers
            addToCart(event);
        });
    });

    function addToCart(event) {
        const productContainer = event.target.closest('.single-pro-details');
        
        if (!productContainer) {
            console.error("Product container not found!");
            return;
        }
    
        // Get product details from the product page
        const productName = productContainer.querySelector('h4').innerText;
        const productPrice = parseFloat(productContainer.querySelector('h2').innerText.replace(' AED', ''));
        const productSize = productContainer.querySelector('select').value;
        const productQuantity = parseInt(productContainer.querySelector('input[type="number"]').value, 10);
        
        // Dynamically get the product image
        const productImage = productContainer.querySelector('img') ? productContainer.querySelector('img').src : '';
        
        if (!productImage) {
            console.error("Product image not found!");
            return;
        }
    
        // Validate size selection
        if (productSize === "Select Size") {
            alert("Please select a size!");
            return;
        }
    
        // Validate quantity
        if (isNaN(productQuantity) || productQuantity < 1) {
            alert("Please select a valid quantity (at least 1).");
            return;
        }
    
        // Create product object with dynamic image and other details
        const product = {
            name: productName,
            price: productPrice,
            size: productSize,
            quantity: productQuantity,
            img: productImage, // Store the product image here
            id: productName + productSize // Unique ID based on name and size
        };
    
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
        // Check if the product already exists in the cart
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
        if (existingProductIndex !== -1) {
            // If the product already exists, update its quantity
            cart[existingProductIndex].quantity += product.quantity;
        } else {
            // Otherwise, add the new product to the cart
            cart.push(product);
        }
    
        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    
        // Optionally, show a success message
        alert(`${product.name} added to cart!`);
        
        // Optionally, render the updated cart
        renderCart();
    }    

    // Function to render cart from localStorage
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartTableBody = document.querySelector('#cart table tbody');

        // Ensure the cart table body exists before trying to modify it
        if (!cartTableBody) {
            console.error("Cart table body not found in the DOM!");
            return; // Exit if the cart body is not found
        }

        // Clear current cart table
        cartTableBody.innerHTML = '';

        cart.forEach(product => {
            const row = document.createElement('tr');
            row.dataset.productId = product.id; // Add data attribute for product identification
            row.innerHTML = `
                <td><img src="${product.img}" alt="${product.name}" width="50" height="50"></td>
                <td>${product.name}</td>
                <td>${product.size}</td>
                <td>${product.price.toFixed(2)} AED</td>
                <td><input type="number" value="${product.quantity}" min="1"></td>
                <td>${(product.price * product.quantity).toFixed(2)} AED</td>
                <td><button class="bx-x-square">Remove</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        // Re-add event listeners for remove buttons and quantity inputs
        const removeButtons = document.querySelectorAll('.bx-x-square');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeItem);
        });

        const quantityInputs = document.querySelectorAll('input[type="number"]');
        quantityInputs.forEach(input => {
            input.addEventListener('input', updateSubtotal);
        });

        // Update the total cost
        updateCartTotal();
    }

    // Initially render the cart
    renderCart();

    // Countdown timer functionality
    const countdownElement = document.getElementById("countdown");

    // Check if countdownElement exists
    if (countdownElement) {
        // Set the date we're counting down to
        const saleEndDate = new Date("Dec 31, 2025 23:59:59").getTime();

        // Update the countdown every 1 second
        const countdownInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = saleEndDate - now;

            // Calculate days, hours, minutes, and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the countdown
            countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            // If the countdown is finished, display a message
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = "Sale Ended!";
            }
        }, 1000);
    } else {
        console.error("Countdown element not found!");
    }
});
