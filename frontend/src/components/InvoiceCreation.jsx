import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Quagga from 'quagga';

// Import or create an audio file for the beep sound
import beepSound from '../assets/beep.mp3';  // Make sure to add this audio file to your project

function InvoiceCreation() {
    const [items, setItems] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [scanning, setScanning] = useState(false);
    const [continuousScanning, setContinuousScanning] = useState(false);
    const scannerRef = useRef(null);
    const [scannedItems, setScannedItems] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(beepSound);
    }, []);

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
            const detectedBarcode = result.codeResult.code;
            setBarcode(detectedBarcode);

            // Play the beep sound
            audioRef.current.play();

            if (continuousScanning) {
                await handleAddProduct(detectedBarcode);
                setScannedItems(prevItems => [...prevItems, detectedBarcode]);
            } else {
                setScanning(false);
            }
        }
    };

    const handleAddProduct = async (barcodeValue) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/products/barcode/${barcodeValue}`);
            const product = response.data;
            const existingItemIndex = items.findIndex(item => item.product === product._id);
            
            if (existingItemIndex !== -1) {
                const updatedItems = [...items];
                updatedItems[existingItemIndex].quantity += quantity;
                setItems(updatedItems);
            } else {
                setItems(prevItems => [...prevItems, { product: product._id, quantity: quantity, name: product.name, price: product.price }]);
            }
            
            setBarcode('');
            setQuantity(1);
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleCreateInvoice = async () => {
        try {
            await axios.post('http://localhost:3000/api/invoices', { items });
            setItems([]);
            setScannedItems([]);
            alert('Invoice created successfully!');
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    const toggleScanning = () => {
        setScanning(!scanning);
        setContinuousScanning(false);
        setScannedItems([]);
    };

    const toggleContinuousScanning = () => {
        setScanning(true);
        setContinuousScanning(!continuousScanning);
        setScannedItems([]);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Invoice</h2>
            <div className="mb-6 flex justify-between">
                <button 
                    onClick={toggleScanning}
                    className={`${scanning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded transition duration-300`}
                >
                    {scanning ? 'Stop Scanning' : 'Scan Barcode'}
                </button>
                <button 
                    onClick={toggleContinuousScanning}
                    className={`${continuousScanning ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white font-bold py-2 px-4 rounded transition duration-300`}
                >
                    {continuousScanning ? 'Stop Continuous Scan' : 'Start Continuous Scan'}
                </button>
            </div>
            {scanning && (
                <div ref={scannerRef} className="w-full max-w-md h-64 mx-auto border-2 border-gray-300 rounded-lg overflow-hidden mb-6" />
            )}
            <div className="flex mb-4">
                <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter barcode manually"
                    className="flex-grow mr-2 p-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-20 mr-2 p-2 border border-gray-300 rounded"
                />
                <button 
                    onClick={() => handleAddProduct(barcode)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Add Item
                </button>
            </div>
            {continuousScanning && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Recently Scanned Items:</h3>
                    <ul className="bg-gray-100 rounded-lg p-2">
                        {scannedItems.map((item, index) => (
                            <li key={index} className="mb-1">{item}</li>
                        ))}
                    </ul>
                </div>
            )}
            <ul className="mb-6 bg-gray-100 rounded-lg p-4">
                {items.map((item, index) => (
                    <li key={index} className="mb-2 p-2 bg-white rounded shadow flex justify-between items-center">
                        <span>{item.name} - ${item.price}</span>
                        <span>Quantity: {item.quantity}</span>
                    </li>
                ))}
            </ul>
            <button 
                onClick={handleCreateInvoice}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
                Create Invoice
            </button>
        </div>
    );
}

export default InvoiceCreation;
// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import Quagga from 'quagga';

// function InvoiceCreation() {
//     const [items, setItems] = useState([]);
//     const [barcode, setBarcode] = useState('');
//     const [scanning, setScanning] = useState(false);
//     const scannerRef = useRef(null);

//     useEffect(() => {
//         if (scanning && scannerRef.current) {
//             Quagga.init(
//                 {
//                     inputStream: {
//                         name: "Live",
//                         type: "LiveStream",
//                         target: scannerRef.current,
//                         constraints: {
//                             width: 600,
//                             height: 600,
//                             facingMode: "environment"
//                         },
//                     },
//                     decoder: {
//                         readers: ['ean_reader', 'ean_8_reader', 'code_128_reader'],
//                     },
//                 },
//                 (err) => {
//                     if (err) {
//                         console.error(err);
//                         return;
//                     }
//                     Quagga.start();
//                 }
//             );

//             Quagga.onDetected(handleBarcodeDetected);

//             return () => {
//                 Quagga.offDetected(handleBarcodeDetected);
//                 Quagga.stop();
//             };
//         }
//     }, [scanning]);

//     const handleBarcodeDetected = async (result) => {
//         if (result && result.codeResult) {
//             setBarcode(result.codeResult.code);
//             await handleAddProduct(result.codeResult.code);
//             setScanning(false);
//         }
//     };

//     const handleAddProduct = async (barcodeValue) => {
//         try {
//             const response = await axios.get(`http://localhost:3000/api/products/barcode/${barcodeValue}`);
//             const product = response.data;
//             setItems([...items, { product: product._id, quantity: 1 }]);
//             setBarcode('');
//         } catch (error) {
//             console.error('Error fetching product:', error);
//         }
//     };

//     const handleCreateInvoice = async () => {
//         try {
//             await axios.post('http://localhost:3000/api/invoices', { items });
//             setItems([]);
//             alert('Invoice created successfully!');
//         } catch (error) {
//             console.error('Error creating invoice:', error);
//         }
//     };

//     return (
//         <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Invoice</h2>
//         <div className="mb-6">
//             {scanning ? (
//                 <div ref={scannerRef} className="w-full max-w-md h-64 mx-auto border-2 border-gray-300 rounded-lg overflow-hidden" />
//             ) : (
//                 <button 
//                     onClick={() => setScanning(true)}
//                     className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
//                 >
//                     Scan Barcode
//                 </button>
//             )}
//         </div>
//         <div className="flex mb-4">
//             <input
//                 type="text"
//                 value={barcode}
//                 onChange={(e) => setBarcode(e.target.value)}
//                 placeholder="Enter barcode manually"
//                 className="flex-grow mr-2 p-2 border border-gray-300 rounded"
//             />
//             <button 
//                 onClick={() => handleAddProduct(barcode)}
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
//             >
//                 Add Item
//             </button>
//         </div>
//         <ul className="mb-6 bg-gray-100 rounded-lg p-4">
//                 {items.map((item, index) => (
//                     <li key={index} className="mb-2 p-2 bg-white rounded shadow">
//                         Product ID: {item.product}, Quantity: {item.quantity}
//                     </li>
//                 ))}
//             </ul>
//             <button 
//                 onClick={handleCreateInvoice}
//                 className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
//             >
//                 Create Invoice
//             </button>
//         </div>
//     );
// }

// export default InvoiceCreation;
