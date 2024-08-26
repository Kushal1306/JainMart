import express from 'express';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

const router = express.Router();

// Create a new invoice
router.post('/', async (req, res) => {
    try {
        const { items } = req.body;
        let total = 0;

        // Calculate total and validate products
        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            total += product.price * item.quantity;
        }

        const invoice = new Invoice({
            items,
            total
        });

        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('items.product');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;