import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Quagga from 'quagga';

function InvoiceCreation() {
    const [items, setItems] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (scanning && scannerRef.current) {
            Quagga.init(
                {
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: scannerRef.current,
                        constraints: {
                            width: 600,
                            height: 600,
                            facingMode: "environment"
                        },
                    },
                    decoder: {
                        readers: ['ean_reader', 'ean_8_reader', 'code_128_reader'],
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

    const handleBarcodeDetected = async (result) => {
        if (result && result.codeResult) {
            setBarcode(result.codeResult.code);
            await handleAddProduct(result.codeResult.code);
            setScanning(false);
        }
    };

    const handleAddProduct = async (barcodeValue) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/products/barcode/${barcodeValue}`);
            const product = response.data;
            setItems([...items, { product: product._id, quantity: 1 }]);
            setBarcode('');
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleCreateInvoice = async () => {
        try {
            await axios.post('http://localhost:3000/api/invoices', { items });
            setItems([]);
            alert('Invoice created successfully!');
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    return (
        <div>
            <h2>Create Invoice</h2>
            {scanning ? (
                <div ref={scannerRef} style={{ width: 300, height: 300 }} />
            ) : (
                <button onClick={() => setScanning(true)}>Scan Barcode</button>
            )}
            <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode manually"
            />
            <button onClick={() => handleAddProduct(barcode)}>Add Item</button>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>Product ID: {item.product}, Quantity: {item.quantity}</li>
                ))}
            </ul>
            <button onClick={handleCreateInvoice}>Create Invoice</button>
        </div>
    );
}

export default InvoiceCreation;

// import React, { useState } from 'react';
// import axios from 'axios';
// import Quagga from 'quagga';

// function InvoiceCreation() {
//   const [items, setItems] = useState([]);
//   const [barcode, setBarcode] = useState('');
//   const [scanning, setScanning] = useState(false);
//   const scannerRef = useRef(null);

//   const handleBarcodeDetected = async (result) => {
//     if (result) {
//       setBarcode(result.text);

//       await handleAddProduct(result.text);
//       setScanning(false);
//     }
//   };

  

//   return (
//     <div>
//       <h2>Create Invoice</h2>
//       {scanning ? (
//         <BarcodeScannerComponent
//           width={300}
//           height={300}
//           onUpdate={(err, result) => {
//             if (result) handleBarcodeDetected(result);
//           }}
//         />
//       ) : (
//         <button onClick={() => setScanning(true)}>Scan Barcode</button>
//       )}
//       <input
//         type="text"
//         value={barcode}
//         onChange={(e) => setBarcode(e.target.value)}
//         placeholder="Enter barcode manually"
//       />
//       <button onClick={() => handleAddProduct(barcode)}>Add Item</button>
//       <ul>
//         {items.map((item, index) => (
//           <li key={index}>Product ID: {item.product}, Quantity: {item.quantity}</li>
//         ))}
//       </ul>
//       <button onClick={handleCreateInvoice}>Create Invoice</button>
//     </div>
//   );
// }

// export default InvoiceCreation;