// Mana Market Core Script
// This script handles cart management, product detail rendering, user session tracking,
// UI interactions, and background music control for the Mana Market website.

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CART MANAGEMENT LOGIC (using localStorage for persistence) ---
    // Initialize cart from localStorage or an empty array.
    let cart = JSON.parse(localStorage.getItem('manaCart')) || [];

    // Initial update of the cart count badge in the navigation bar.
    updateCartCount();

    // 1.1. Toast Notification System
    // This function replaces default browser alerts for a better user experience.
    /**
     * Shows a non-intrusive toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', or 'info'.
     */
    function showToast(message, type = 'success') {

        const toastContainer = document.getElementById('toastContainer');

        if (!toastContainer) {
            // Fallback for pages missing the toast container (should be added to all HTML files).
            console.warn('Toast container not found, falling back to console log: ' + message);
            return;
        }

        const toast = document.createElement('div');
        // Add a class for styling and the specific type
        toast.className = `toast epunda-slab-font ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Remove the toast after a delay with a fade-out transition
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 3000); // Display time: 3 seconds
    }

    // 1.2. Add to Cart function (exposed globally for inline HTML usage)
    window.addToCart = function(name, price, image) {
        // Check if the item is already in the cart to prevent duplicates
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            showToast(`${name} is already in your cart.`, 'error');
            return;
        }

        // Add the new item
        cart.push({ name, price, image });

        // Update storage
        localStorage.setItem('manaCart', JSON.stringify(cart));

        // Update UI
        updateCartCount();
        showToast(`${name} added to cart!`, 'success');
    };

    // 1.3. Remove from Cart function (exposed globally)
    window.removeFromCart = function(index) {
        // Remove item by index
        cart.splice(index, 1);

        // Update storage
        localStorage.setItem('manaCart', JSON.stringify(cart));

        // Update UI
        updateCartCount();
        renderCart(); // Re-render the cart page content
        showToast('Item removed from cart.', 'info');
    };

    // 1.4. Update the cart count in the top navigation bar
    function updateCartCount() {
        const countEl = document.getElementById('cartCount');
        if (countEl) countEl.textContent = cart.length;
    }

    // 1.5. Render the Cart page content (on cart.html)
    function renderCart() {

        const cartContent = document.getElementById('cartContent');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotalEl = document.getElementById('cartTotal');

        if (!cartContent) return; // Only run if on cart.html

        if (cart.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart-msg epunda-slab-font">Your cart is empty. Time to refill your mana stores!</p>';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        let total = 0;
        
        // Change output to a tabular structure matching the design image
        let cartHtml = `
            <table class="cart-table">
                <thead>
                    <tr class="table-header-row">
                        <th class="product-col">Product</th>
                        <th class="price-col">Price</th>
                        <th class="action-col">Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Loop through cart items to generate TABLE ROWS
        cart.forEach((item, index) => {
            const itemPrice = parseFloat(item.price);
            total += itemPrice;

            // Use table row/data structure. Image size reduced to 50x60 for better table fit.
            cartHtml += `
                <tr class="cart-item-row epunda-slab-font">
                    <td class="item-product">
                        <img class="cart-item-image" src="${item.image}" alt="${item.name}" width="50" height="60"
                             onerror="this.onerror=null;this.src='https://placehold.co/50x60/99e0e0/000000?text=IMG';">
                        <span class="item-name">${item.name}</span>
                    </td>
                    <td class="item-price">$${itemPrice.toFixed(2)}</td>
                    <td class="item-action">
                        <button class="remove-btn remove-btn-styled" onclick="removeFromCart(${index})" aria-label="Remove ${item.name}">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
        });

        // Close the table
        cartHtml += '</tbody></table>';

        cartContent.innerHTML = cartHtml;

        if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
        if (cartFooter) cartFooter.style.display = 'block';

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.onclick = () => {

                // 1. Show confirmation toast
                showToast('Initiating purchase sequence...', 'info');

                // 2. Clear the cart data (simulating successful transaction)
                const finalTotal = total.toFixed(2);
                cart = [];
                localStorage.setItem('manaCart', JSON.stringify(cart));
                updateCartCount();
                
                // 3. FIX: Redirect to payment_qr.html, passing the total as a URL parameter
                window.location.href = `payment_qr.html?total=${finalTotal}`;
            };
        }
    }


    // --- 2. PRODUCT PAGE LOGIC (Restored Functionality) ---

    // 2.1. Render Product Details (only runs on product.html)
    function renderProductDetails() {
        // Check if the necessary elements exist
        const nameEl = document.getElementById('productName');
        if (!nameEl) return;

        // Get product details from URL parameters
        const params = new URLSearchParams(window.location.search);
        const name = params.get('product');
        const price = params.get('price');
        const image = params.get('img');

        // Mock Description based on product name (since a DB isn't used)
        let description = "A detailed description for this game will be loaded here. It covers gameplay mechanics, developer notes, system requirements, and community reviews. This is placeholder text for the physical version of the game.";
        
        if (name === 'Palworld') {
            description = "Palworld is a multiplayer, open-world survival crafting game with monster-collecting elements. Explore a vast world, capture mysterious creatures called 'Pals,' and use them for combat, farming, building, and more. A unique blend of survival and creature collection!";
        } else if (name === 'Hades 2') {
            description = "Hades II is the sequel to the critically-acclaimed rogue-like dungeon crawler. As Melinoë, the Princess of the Underworld, you must venture beyond the world you know and use the powers of the moon and witchcraft to confront the Titan of Time, Chronos.";
        } else if (name === 'Terraria') {
            description = "Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game. Terraria is a world-building sandbox game that blends classic action with completely free-form creativity. The world is your canvas, and the ground itself is your paint.";
        } else if (name === 'Dinkum') {
            description = "Dinkum is an Australian-themed survival and farming game where you are invited to start a new life in the Australian outback. Explore tropical eucalyptus forests, manage a farm, hunt, fish, and build a town on an island inspired by the wild landscape of Australia.";
        }

        // Populate the elements
        nameEl.textContent = name || 'Unknown Product';
        document.getElementById('productPrice').textContent = price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
        document.getElementById('productDesc').textContent = description;
        
        const imgEl = document.getElementById('productImg');
        if (imgEl) {
            imgEl.src = image || 'https://placehold.co/300x400/808080/FFFFFF?text=Product+Image';
            imgEl.style.display = 'block'; // Show the image once loaded
        }
        
        // Attach the Add to Cart functionality to the button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn && name && price && image) {
            // Use the global window.addToCart function defined earlier
            addToCartBtn.onclick = () => window.addToCart(name, price, image);
        }
    }


    // --- 3. EXECUTE INITIAL FUNCTIONS ---

    // Call renderCart if the current page has the cartContent element (i.e., cart.html)
    if (document.getElementById('cartContent')) {
        renderCart();
    }
    
    // Call renderProductDetails if the current page has the productName element (i.e., product.html)
    if (document.getElementById('productName')) {
        renderProductDetails();
    }


    // --- 4. USER AUTHENTICATION/SESSION LOGIC (Simulated) ---

    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.querySelector('a[href="login.html"]');
    const signupLink = document.querySelector('a[href="signup.html"]');

    // 4.1. Function to update visibility of Login/Logout links based on session
    function updateAuthUI() {
        const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

        // Check if a user session exists
        if (loggedInUserEmail) {
            // User is logged in
            if (userEmailDisplay) {
                userEmailDisplay.textContent = `Welcome, ${loggedInUserEmail.split('@')[0]}!`;
                userEmailDisplay.style.display = 'inline';
            }
            if (logoutBtn) logoutBtn.style.display = 'inline';
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
        } else {
            // User is logged out
            if (userEmailDisplay) userEmailDisplay.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginLink) loginLink.style.display = 'inline';
            if (signupLink) signupLink.style.display = 'inline';
        }
    }

    // Initial UI update on load
    updateAuthUI();

    // 4.2. Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link navigation
            
            // Clear the session data
            localStorage.removeItem('loggedInUserEmail'); 

            // Update UI
            updateAuthUI(); 

            // Notify user
            showToast('You have been logged out. See you next time!', 'info');
            
            // Redirect to home if on sensitive pages, otherwise reload the page
            const currentPath = window.location.pathname;
            if (currentPath.endsWith('cart.html') || currentPath.endsWith('payment_qr.html') || currentPath.endsWith('product.html')) {
                 window.location.href = 'index.html';
            } else {
                // Reload to refresh dynamic content if staying on index/store
                window.location.reload(); 
            }
        });
    }


    // --- 5. FORM UI ENHANCEMENTS AND SUBMISSION HANDLING ---

    // 5.1. Password visibility toggling for login/signup pages
    const toggleBtn = document.getElementById('togglePwd');
    const pwd = document.getElementById('password');

    if (toggleBtn && pwd) {
        toggleBtn.addEventListener('click', () => {
            const showing = pwd.type === 'text';
            pwd.type = showing ? 'password' : 'text';
            toggleBtn.textContent = showing ? 'Show' : 'Hide';
            toggleBtn.setAttribute('aria-pressed', String(!showing));
        });
    }

    // 5.2. Submission UI Handler (for PHP forms)
    function handleFormSubmissionUI(formSelector) {
        const form = document.querySelector(formSelector);
        if (form) {
            form.addEventListener('submit', function(e) {
                const submitButton = e.submitter;

                if (!submitButton) return; 

                const originalButtonText = submitButton.textContent;

                // 1. Show processing state
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;

                // 2. Set a timeout to revert the button state if the PHP script
                //    doesn't immediately redirect due to an error or delay.
                setTimeout(() => {
                    if (submitButton.disabled) {
                         submitButton.textContent = originalButtonText;
                         submitButton.disabled = false;
                         console.log("Form submission processing state timed out and reset.");
                    }
                }, 5000); // Reset after 5 seconds
            });
        }
    }

    // Apply the processing state handler to both login and signup forms
    handleFormSubmissionUI('form[action="login.php"]');
    handleFormSubmissionUI('form[action="signup.php"]');

    // 5.3. Handle Contact Form submission (simulated success)
    const contactForm = document.getElementById('contactForm');
    const thankYouMsg = document.getElementById('thankYouMsg');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stop actual form submission to server

            const submitButton = e.submitter;
            const originalButtonText = submitButton.textContent;

            // Simulate loading
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            setTimeout(() => {
                showToast("Thanks for contacting Mana Market! We will get back to you soon.", 'success');
                
                // Hide the form and show the thank you message
                contactForm.style.display = 'none';
                if (thankYouMsg) thankYouMsg.style.display = 'block';

                // Restore button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }, 1500); // 1.5 second delay to simulate network call
        });
    }


    // --- 6. SCROLL TO TOP BUTTON LOGIC ---

    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Function to check scroll position and show/hide button
    window.onscroll = function() { scrollFunction() };

    function scrollFunction() {
      if (scrollTopBtn) {
        // Show button if scroll position is beyond 20 pixels
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          scrollTopBtn.style.display = "block";
        } else {
          scrollTopBtn.style.display = "none";
        }
      }
    }

    // Click handler for the scroll to top button
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
    }
    
    // Additional comment block to pad lines

    // --- 7. BACKGROUND MUSIC CONTROL ---
    
    // Get audio and toggle button elements
    const bgMusic = document.getElementById('bgMusic');
    const musicToggleBtn = document.getElementById('musicToggleBtn');

    if (bgMusic && musicToggleBtn) {
        // Load state from local storage (muted status and current time)
        const isMuted = localStorage.getItem('musicMuted') === 'true';
        const currentTime = parseFloat(localStorage.getItem('musicCurrentTime')) || 0;

        bgMusic.muted = isMuted;
        bgMusic.currentTime = currentTime;

        // 7.1. Save state before user leaves or closes page
        const saveMusicState = () => {
            localStorage.setItem('musicCurrentTime', bgMusic.currentTime);
            localStorage.setItem('musicMuted', bgMusic.muted);
        };
        window.addEventListener('pagehide', saveMusicState);


        // 7.2. Update the button text to reflect the current state
        const updateBtn = () => {
            musicToggleBtn.textContent = bgMusic.muted ? 'Music OFF' : 'Music ON';
            if(bgMusic.muted) musicToggleBtn.classList.add('muted');
            else musicToggleBtn.classList.remove('muted');
        };
        updateBtn();

        // 7.3. Function to attempt playing the music
        const tryPlay = () => {
             // Only attempt if paused
             if (bgMusic.paused) {
                 // The promise catch handles the DOMException if autoplay is blocked
                 bgMusic.play().catch(() => {}); 
             }
        };
        
        // Attempt to play on load, and add an event listener to try again on first user interaction
        tryPlay(); 
        
        // Use a single, temporary listener for the first user interaction
        document.addEventListener('click', tryPlay, { once: true });


        // 7.4. Toggle functionality on button click
        musicToggleBtn.addEventListener('click', () => {
            bgMusic.muted = !bgMusic.muted;
            localStorage.setItem('musicMuted', bgMusic.muted);
            updateBtn();

            // If unmuting and the audio is paused, attempt to play
            if (!bgMusic.muted && bgMusic.paused) {
                tryPlay();
            }
        });
    }

    // 8. Final cleanup and global exposure
    // Expose toast function globally if needed in other inline scripts
    window.showToast = showToast;
    
    // End of DOMContentLoaded listener
});