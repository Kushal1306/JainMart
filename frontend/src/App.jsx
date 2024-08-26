
import React from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import ProductManagement from './components/ProductManagement';
import InvoiceCreation from './components/InvoiceCreation';
import { GoogleOAuthProvider } from '@react-oauth/google'


function App() {
  return (
    <GoogleOAuthProvider clientId='951522285736-dge67ps62hcv421d7qcbqdv64vp9gusl.apps.googleusercontent.com'>
       <Router>
          <Routes>
           <Route path='/' element={<Signin/>}/>
           <Route path='/signin' element={<Signin/>} />
           <Route path='/signup' element={<Signup/>} />
           <Route path='/invoice' element={<InvoiceCreation/>}/>
           <Route path='/products' element={<ProductManagement/>} />
         </Routes>
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
