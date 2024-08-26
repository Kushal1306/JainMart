import React, { useState } from 'react'
import { Heading } from '../components/Heading'
import { SubHeading } from '../components/SubHeading'
import { InputBox } from '../components/InputBox'
import { Button } from '../components/Button'
import { BottomWarning } from '../components/BottomWarning'
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'


function Signup() {
  const [firstName,setfirstName]=useState("");
  const [lastName,setlastName]=useState("");
  const [userName,setuserName]=useState("");
  const [password,setPassword]=useState("");
  const navigate=useNavigate();

  const handleSignup=async()=>{
    try { 
     const response= await axios.post("https://realtimechatbot-rentok.onrender.com/user/signup",{
        userName,
        password,
        firstName,
        lastName
      });
      localStorage.setItem("token",response.data.token);
      navigate("/chat");

    } catch (error) {
        console.error('Sign-up Error:', error);
    }
   
  };

  const handleGoogleSignIn=async(credentialResponse)=>{
    try {
        const decoded=jwtDecode(credentialResponse.credential);
        console.log(decoded);
        const response=await axios.post("https://realtimechatbot-rentok.onrender.com/user/goole-signin",{
            token:credentialResponse.credential,
        });
        localStorage.setItem("token",response.data.token);
        navigate("/chat"); 
    } catch (error) {
        console.error('Google Sign-In Error:', error);
    }

};
  return (
     <div className="bg-slate-300 h-screen flex justify-center">
    <div className="flex flex-col justify-center">
      <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
        <Heading label={"Sign Up"} />
        <SubHeading label={"Enter your information to create an account"}/>
        <InputBox 
        value={firstName}
        onChange={e=>{
          setfirstName(e.target.value);
        }} label={"First Name"} placeholder={"xxx"}  />
        <InputBox 
        value={lastName}
        onChange={e=>{
          setlastName(e.target.value);
        }} label={"Last Name"} placeholder={"yyy"}/>
        <InputBox 
        type='email'
        value={userName}
        onChange={e=>{
          setuserName(e.target.value);
        }} label={"Email"} placeholder={"abc@gmail.com"}/>
        <InputBox 
        type='password'
        value={password}
        onChange={e=>{
          setPassword(e.target.value);
        }} label={"Pasword"}/>
        <div className='pt-2'>
          <Button onClick={handleSignup}label={"Sign Up"}/>
        </div>
        <div className='pt-2 w-full px-10 pb-1'>
            <div className="w-full">
              <GoogleLogin
                text='signup_with'
                onSuccess={handleGoogleSignIn}
                onError={() => console.log('login failed')}
                useOneTap
              />
            </div>
          </div>
        <BottomWarning label={"Alread have an account?"} buttonText={"Login"} to={"/signin"}/>
        </div>
    </div>
  </div>
  )
}

export default Signup