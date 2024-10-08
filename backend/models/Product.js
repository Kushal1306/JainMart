import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;