import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import connectToDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);

connectToDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }).catch((error) => {
        console.error('Error connecting to database:', error);
        process.exit(1);
    });

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});