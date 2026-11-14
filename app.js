
const API_URL = "/api";
const USER_ID = "demo-user";

let allProducts = [];
let selectedProducts = [];
let wishlistMode = false;

// Product Images - Local Images
const productImages = {
    "Organic Cotton T-Shirt": "/images/cotton_tshirt.jpg",

    "Reusable Water Bottle": "/images/resusable_waterbottle.png",

    "Bamboo Toothbrush": "/images/Flat_Straight_Bamboo_Toothbrush.webp",

    "Recycled Paper Notebook": "/images/recycled_notebook.webp",

    "Canvas Shopping Bag": "/images/shopping_bag.jpg",

    "LED Bulb": "/images/led_bulb.webp",

    "Plastic Storage Box": "/images/plastic_storage_bag.jpg",

    "Synthetic Sports T-Shirt": "/images/synthetic_sports_tshirt.webp",

    "Disposable Paper Cups": "/images/disposable_paper_cups.jpg",

    "Plastic Water Bottle": "/images/plastic_waterbottle.avif",

    "Fashion Jacket": "/images/fashion_jacket.webp"
};

// Get Product Image
function getProductImage(product) {
    return productImages[product.name] ||
        "https://placehold.co/600x400?text=Image+Unavailable";
}

// Fallback Image
function getProductImageFallback(product) {
    const label = encodeURIComponent(product.name || "Product Image");
    return `https://placehold.co/600x400?text=${label}`;
}

// Escape HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// Display Products
function displayProducts(products) {
    const container = document.getElementById("productContainer");
    const message = document.getElementById("message");

    container.innerHTML = "";

    if (products.length === 0) {
        message.textContent = "No products found. Try changing your filters.";
        return;
    }

    message.textContent = "";

    products.forEach(product => {
        const id = escapeHTML(product._id);
        const name = escapeHTML(product.name);
        const category = escapeHTML(product.category);
        const description = escapeHTML(product.description);
        const image = escapeHTML(getProductImage(product));

        const price = Number(product.price).toLocaleString("en-IN");

        let ecoBadge = "";

        if (product.ecoDataAvailable && product.ecoScore) {
            ecoBadge = `
                <span class="eco-badge score-${escapeHTML(product.ecoScore)}">
                    Eco Score: ${escapeHTML(product.ecoScore)}
                </span>
            `;
        } else {
            ecoBadge = `
                <span class="eco-badge no-data">
                    Eco Data Unavailable
                </span>
            `;
        }

        const wishlistButton = wishlistMode
            ? `
                <button class="btn btn-danger btn-sm w-100 mt-2"
                    onclick="removeFromWishlist('${id}')">
                    Remove from Wishlist
                </button>
              `
            : `
                <button class="btn btn-outline-success btn-sm w-100 mt-2"
                    onclick="addToWishlist('${id}')">
                    ♡ Add to Wishlist
                </button>
              `;

        container.innerHTML += `
            <div class="col-md-6 col-xl-4">
                <div class="product-card">

                    <img
                        src="${image}"
                        alt="${name}"
                        class="product-image"
                        onerror="this.onerror=null;this.src=getProductImageFallback({name: '${name}'});">

                    <p class="text-muted mb-1">${category}</p>

                    <h5>${name}</h5>

                    <p class="product-description">
                        ${description}
                    </p>

                    <p class="product-price">₹${price}</p>

                    ${ecoBadge}

                    <button class="btn btn-success btn-sm w-100 mt-2"
                        onclick="viewProductDetails('${id}')">
                        View Details
                    </button>

                    <div class="form-check">
                        <input
                            class="form-check-input compare-checkbox"
                            type="checkbox"
                            value="${id}"
                            id="compare-${id}"
                            onchange="toggleCompare('${id}', this.checked)">

                        <label class="form-check-label" for="compare-${id}">
                            Select to Compare
                        </label>
                    </div>

                    ${wishlistButton}

                </div>
            </div>
        `;
    });
}

// Load Products
async function loadProducts() {
    try {
        wishlistMode = false;

        document.getElementById("sectionTitle").textContent =
            "Explore Products";

        const search = document.getElementById("searchInput").value;
        const category = document.getElementById("categoryFilter").value;
        const ecoScore = document.getElementById("ecoFilter").value;
        const maxPrice = document.getElementById("priceFilter").value;

        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (category !== "All") params.append("category", category);
        if (ecoScore !== "All") params.append("ecoScore", ecoScore);
        if (maxPrice) params.append("maxPrice", maxPrice);

        const response = await fetch(
            `${API_URL}/products?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        const products = await response.json();

        allProducts = products;
        selectedProducts = [];

        document.getElementById("comparisonContainer").innerHTML =
            `<p class="text-muted">
                Select products above to see their comparison.
            </p>`;

        displayProducts(products);

    } catch (error) {
        console.error(error);

        document.getElementById("message").textContent =
            "Unable to load products. Please check the server connection.";
    }
}

// Show All Products
function showAllProducts() {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "All";
    document.getElementById("ecoFilter").value = "All";
    document.getElementById("priceFilter").value = "";

    loadProducts();

    window.scrollTo({
        top: document.querySelector(".shop-section").offsetTop,
        behavior: "smooth"
    });
}

// Reset Filters
function resetFilters() {
    showAllProducts();
}

// View Product Details
function viewProductDetails(productId) {
    const product = allProducts.find(
        item => item._id === productId
    );

    if (!product) {
        alert("Product details not found.");
        return;
    }

    const detailsImage = document.getElementById("detailsImage");

    detailsImage.onerror = function () {
        this.onerror = null;
        this.src = getProductImageFallback(product);
    };

    detailsImage.src = getProductImage(product);

    document.getElementById("detailsName").textContent =
        product.name;

    document.getElementById("detailsCategory").textContent =
        "Category: " + product.category;

    document.getElementById("detailsPrice").textContent =
        "Price: ₹" + Number(product.price).toLocaleString("en-IN");

    document.getElementById("detailsDescription").textContent =
        product.description || "No description available.";

    if (product.ecoDataAvailable && product.ecoScore) {
        document.getElementById("detailsEcoScore").innerHTML =
            `<span class="eco-badge score-${escapeHTML(product.ecoScore)}">
                Eco Score: ${escapeHTML(product.ecoScore)}
            </span>`;

        document.getElementById("detailsDataStatus").textContent =
            "Sustainability information is available in this demo dataset.";
    } else {
        document.getElementById("detailsEcoScore").innerHTML =
            `<span class="eco-badge no-data">
                Eco Data Unavailable
            </span>`;

        document.getElementById("detailsDataStatus").textContent =
            "Sustainability information is not available for this product.";
    }

    const modal = new bootstrap.Modal(
        document.getElementById("productDetailsModal")
    );

    modal.show();
}

// Add to Wishlist
async function addToWishlist(productId) {
    try {
        const response = await fetch(`${API_URL}/wishlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: USER_ID,
                productId: productId
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Unable to add product.");
            return;
        }

        alert("Product added to your wishlist!");

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}

// Show Wishlist
async function showWishlist() {
    try {
        const response = await fetch(
            `${API_URL}/wishlist/${USER_ID}`
        );

        if (!response.ok) {
            throw new Error("Unable to load wishlist");
        }

        const wishlist = await response.json();

        const products = wishlist
            .map(item => item.productId)
            .filter(product => product && product._id);

        wishlistMode = true;
        allProducts = products;
        selectedProducts = [];

        document.getElementById("sectionTitle").textContent =
            "My Wishlist";

        document.getElementById("comparisonContainer").innerHTML =
            `<p class="text-muted">
                Select products above to see their comparison.
            </p>`;

        document.getElementById("message").textContent =
            products.length === 0
                ? "Your wishlist is empty. Add some products to get started!"
                : "";

        displayProducts(products);

        window.scrollTo({
            top: document.querySelector(".shop-section").offsetTop,
            behavior: "smooth"
        });

    } catch (error) {
        console.error(error);

        document.getElementById("message").textContent =
            "Unable to load wishlist.";
    }
}

// Remove from Wishlist
async function removeFromWishlist(productId) {
    try {
        const response = await fetch(
            `${API_URL}/wishlist/${USER_ID}/${productId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to remove product");
        }

        alert("Product removed from wishlist!");

        showWishlist();

    } catch (error) {
        console.error(error);
        alert("Unable to remove product.");
    }
}

// Select Products for Comparison
function toggleCompare(productId, checked) {
    if (checked) {
        if (selectedProducts.length >= 5) {
            alert("You can compare a maximum of 5 products.");

            const checkbox = document.getElementById(
                `compare-${productId}`
            );

            if (checkbox) checkbox.checked = false;

            return;
        }

        if (!selectedProducts.includes(productId)) {
            selectedProducts.push(productId);
        }

    } else {
        selectedProducts = selectedProducts.filter(
            id => id !== productId
        );
    }
}

// Compare Products
function compareProducts() {
    const selected = allProducts.filter(product =>
        selectedProducts.includes(product._id)
    );

    if (selected.length < 2) {
        alert("Please select at least 2 products to compare.");
        return;
    }

    let table = `
        <table class="table table-bordered table-hover text-center">
            <thead>
                <tr>
                    <th>Product Details</th>
    `;

    selected.forEach(product => {
        table += `<th>${escapeHTML(product.name)}</th>`;
    });

    table += `
                </tr>
            </thead>
            <tbody>
    `;

    const rows = [
        {
            label: "Category",
            value: product => product.category || "N/A"
        },
        {
            label: "Price",
            value: product =>
                "₹" + Number(product.price).toLocaleString("en-IN")
        },
        {
            label: "Eco Score",
            value: product =>
                product.ecoDataAvailable && product.ecoScore
                    ? product.ecoScore
                    : "No Data"
        },
        {
            label: "Description",
            value: product => product.description || "N/A"
        }
    ];

    rows.forEach(row => {
        table += `<tr><th>${row.label}</th>`;

        selected.forEach(product => {
            table += `<td>${escapeHTML(row.value(product))}</td>`;
        });

        table += `</tr>`;
    });

    table += `
            </tbody>
        </table>
    `;

    document.getElementById("comparisonContainer").innerHTML = table;

    document.getElementById("comparisonSection").scrollIntoView({
        behavior: "smooth"
    });
}

// Start Application
document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
});
