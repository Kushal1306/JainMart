import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ProductManagement from './components/ProductManagement';
import InvoiceCreation from './components/InvoiceCreation';
import MenuBar from './components/MenuBar';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const isAuthenticated = true;
  // const isAuthenticated = !!localStorage.getItem('token');

  return (
    <GoogleOAuthProvider clientId='951522285736-dge67ps62hcv421d7qcbqdv64vp9gusl.apps.googleusercontent.com'>
      <Router>
        {isAuthenticated && <MenuBar />}
        <div className="container mx-auto mt-8 px-4">
          <Routes>
            <Route path='/' element={isAuthenticated ? <Navigate to="/products" /> : <Signin />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/signup' element={<Signup />} />
            <Route 
              path='/invoice' 
              element={isAuthenticated ? <InvoiceCreation /> : <Navigate to="/signin" />}
            />
            <Route 
              path='/products' 
              element={isAuthenticated ? <ProductManagement /> : <Navigate to="/signin" />}
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
// import { useState } from 'react'
// import Signin from './pages/Signin'
// import Signup from './pages/Signup'
// import Chat from './pages/Chat';
// import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
// import { GoogleOAuthProvider } from '@react-oauth/google'

// import './App.css'

// function App() {
//   return (
//    <GoogleOAuthProvider clientId='951522285736-dge67ps62hcv421d7qcbqdv64vp9gusl.apps.googleusercontent.com'>
//     <Router>
//       <Routes>
//       <Route path='/' element={<Signin/>}/>
//       <Route path='/signin' element={<Signin/>} />
//       <Route path='/signup' element={<Signup/>} />
//       <Route path='/chat' element={<Chat/>}/>
//       </Routes>
//     </Router>
//    </GoogleOAuthProvider>
//   )
// }

// export default App
