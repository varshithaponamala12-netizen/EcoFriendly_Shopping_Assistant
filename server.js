
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/EcoShoppingDB")
    .then(() => {
        console.log("MongoDB Connected Successfully");
        seedProducts();
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    ecoScore: String,
    description: String,
    image: String,
    ecoDataAvailable: Boolean
});

const Product = mongoose.model("Product", productSchema);

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
    userId: String,
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }
});

wishlistSchema.index(
    { userId: 1, productId: 1 },
    { unique: true }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// Sample Products
async function seedProducts() {
    try {
        const count = await Product.countDocuments();

        if (count === 0) {
            const products = [
                {
                    name: "Organic Cotton T-Shirt",
                    category: "Clothing",
                    price: 599,
                    ecoScore: "A",
                    description: "Made from organic cotton.",
                    image: "https://placehold.co/400x250?text=Cotton+T-Shirt",
                    ecoDataAvailable: true
                },
                {
                    name: "Reusable Water Bottle",
                    category: "Accessories",
                    price: 399,
                    ecoScore: "A",
                    description: "Reusable stainless steel bottle.",
                    image: "https://placehold.co/400x250?text=Water+Bottle",
                    ecoDataAvailable: true
                },
                {
                    name: "Bamboo Toothbrush",
                    category: "Personal Care",
                    price: 99,
                    ecoScore: "A",
                    description: "Toothbrush with a bamboo handle.",
                    image: "https://placehold.co/400x250?text=Bamboo+Toothbrush",
                    ecoDataAvailable: true
                },
                {
                    name: "Recycled Paper Notebook",
                    category: "Stationery",
                    price: 149,
                    ecoScore: "B",
                    description: "Notebook made using recycled paper.",
                    image: "https://placehold.co/400x250?text=Notebook",
                    ecoDataAvailable: true
                },
                {
                    name: "Canvas Shopping Bag",
                    category: "Accessories",
                    price: 199,
                    ecoScore: "B",
                    description: "Reusable shopping bag.",
                    image: "https://placehold.co/400x250?text=Shopping+Bag",
                    ecoDataAvailable: true
                },
                {
                    name: "LED Bulb",
                    category: "Home",
                    price: 120,
                    ecoScore: "B",
                    description: "Energy-efficient LED bulb.",
                    image: "https://placehold.co/400x250?text=LED+Bulb",
                    ecoDataAvailable: true
                },
                {
                    name: "Plastic Storage Box",
                    category: "Home",
                    price: 250,
                    ecoScore: "C",
                    description: "Reusable plastic storage box.",
                    image: "https://placehold.co/400x250?text=Storage+Box",
                    ecoDataAvailable: true
                },
                {
                    name: "Synthetic Sports T-Shirt",
                    category: "Clothing",
                    price: 450,
                    ecoScore: "C",
                    description: "Synthetic fabric sportswear.",
                    image: "https://placehold.co/400x250?text=Sports+T-Shirt",
                    ecoDataAvailable: true
                },
                {
                    name: "Disposable Paper Cups",
                    category: "Home",
                    price: 80,
                    ecoScore: "D",
                    description: "Single-use paper cups.",
                    image: "https://placehold.co/400x250?text=Paper+Cups",
                    ecoDataAvailable: true
                },
                {
                    name: "Plastic Water Bottle",
                    category: "Accessories",
                    price: 50,
                    ecoScore: "E",
                    description: "Single-use plastic bottle.",
                    image: "https://placehold.co/400x250?text=Plastic+Bottle",
                    ecoDataAvailable: true
                },
                {
                    name: "Fashion Jacket",
                    category: "Clothing",
                    price: 1200,
                    ecoScore: "F",
                    description: "Conventional synthetic jacket.",
                    image: "https://placehold.co/400x250?text=Jacket",
                    ecoDataAvailable: true
                },
                {
                    name: "Unknown Material Product",
                    category: "Home",
                    price: 300,
                    ecoScore: null,
                    description: "Sustainability information is unavailable.",
                    image: "https://placehold.co/400x250?text=Unknown+Product",
                    ecoDataAvailable: false
                }
            ];

            await Product.insertMany(products);
            console.log("Sample products added successfully");
        }
    } catch (error) {
        console.log("Product Seeding Error:", error);
    }
}

// Get Products with Filters
app.get("/api/products", async (req, res) => {
    try {
        const { search, category, ecoScore, maxPrice } = req.query;

        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (category && category !== "All") {
            filter.category = category;
        }

        if (ecoScore && ecoScore !== "All") {
            if (ecoScore === "No Data") {
                filter.ecoDataAvailable = false;
            } else {
                filter.ecoScore = ecoScore;
            }
        }

        if (maxPrice) {
            filter.price = { $lte: Number(maxPrice) };
        }

        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Unable to fetch products" });
    }
});

// Get Wishlist
app.get("/api/wishlist/:userId", async (req, res) => {
    try {
        const wishlist = await Wishlist.find({
            userId: req.params.userId
        }).populate("productId");

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: "Unable to fetch wishlist" });
    }
});

// Add Product to Wishlist
app.post("/api/wishlist", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const item = await Wishlist.create({
            userId,
            productId
        });

        res.status(201).json(item);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Product already exists in wishlist"
            });
        }

        res.status(500).json({ message: "Unable to add product" });
    }
});

// Remove Product from Wishlist
app.delete("/api/wishlist/:userId/:productId", async (req, res) => {
    try {
        await Wishlist.findOneAndDelete({
            userId: req.params.userId,
            productId: req.params.productId
        });

        res.json({ message: "Product removed from wishlist" });
    } catch (error) {
        res.status(500).json({ message: "Unable to remove product" });
    }
});

// Start Server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
