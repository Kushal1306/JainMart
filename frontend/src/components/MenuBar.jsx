import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MenuBar() {
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">MyApp</Link>
        <div className="space-x-4">
          <Link 
            to="/products" 
            className={`text-white hover:text-indigo-200 transition duration-300 ${location.pathname === '/products' ? 'border-b-2 border-white' : ''}`}
          >
            Products
          </Link>
          <Link 
            to="/invoice" 
            className={`text-white hover:text-indigo-200 transition duration-300 ${location.pathname === '/invoice' ? 'border-b-2 border-white' : ''}`}
          >
            Invoice Creation
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.reload();
            }} 
            className="text-white hover:text-indigo-200 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default MenuBar;