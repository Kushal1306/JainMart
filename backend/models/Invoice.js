import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;