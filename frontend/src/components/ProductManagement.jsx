import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Quagga from 'quagga';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', barcode: '', price: '', description: '' });
  const [scanning, setScanning] = useState(false);
  
  const scannerRef = useRef(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

  useEffect(() => {
    if (scanning && scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              width: 480,
              height: 320,
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'code_39_vin_reader', 'codabar_reader', 'upc_reader', 'upc_e_reader', 'i2of5_reader'],
          },
        },
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected(handleBarcodeDetected);

      return () => {
        Quagga.offDetected(handleBarcodeDetected);
        Quagga.stop();
      };
    }
  }, [scanning]);

  const fetchProducts = async () => {
    const response = await axios.get('http://localhost:3000/api/products');
    setProducts(response.data);
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/api/products', newProduct);
    setNewProduct({ name: '', barcode: '', price: '', description: '' });
    fetchProducts();
  };

  const handleBarcodeDetected = (result) => {
    if (result.codeResult.code) {
      setNewProduct({ ...newProduct, barcode: result.codeResult.code });
      setScanning(false);
    }
  };

  const toggleScanner = () => {
    setScanning(!scanning);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
            className="border p-2 rounded"
          />
          <div className="flex">
            <input
              name="barcode"
              value={newProduct.barcode}
              onChange={handleInputChange}
              placeholder="Barcode"
              required
              className="border p-2 rounded flex-grow"
            />
            <button
              type="button"
              onClick={toggleScanner}
              className="ml-2 bg-blue-500 text-white p-2 rounded"
            >
              {scanning ? 'Cancel' : 'Scan'}
            </button>
          </div>
          <input
            name="price"
            type="number"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Price"
            required
            className="border p-2 rounded"
          />
          <input
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="border p-2 rounded"
          />
        </div>
        <button type="submit" className="mt-4 bg-green-500 text-white p-2 rounded">Add Product</button>
      </form>

      {scanning && (
        <div className="mb-4">
          <div ref={scannerRef} className="w-full max-w-md mx-auto"></div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">Product List</h3>
      <ul className="bg-gray-100 rounded p-4">
        {products.map(product => (
          <li key={product._id} className="mb-2 p-2 bg-white rounded shadow">
            {product.name} - {product.barcode} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManagement;