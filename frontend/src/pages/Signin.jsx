import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Heading } from '../components/Heading';
import { SubHeading } from '../components/SubHeading';
import { InputBox } from '../components/InputBox';
import { Button } from '../components/Button';
import { BottomWarning } from '../components/BottomWarning';

function Signin() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleEmailSignIn = async () => {
        try {
            const response = await axios.post("https://realtimechatbot-rentok.onrender.com/user/signin", {
                userName,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/chat");
        } catch (error) {
            console.error("Email Sign-In Error:", error);
            setError("Invalid email or password. Please try again.");
        }
    };

    const handleGoogleSignIn = async (codeResponse) => {
        try {
            console.log('Google Sign-In Response:', codeResponse);

            const { code } = codeResponse;
            if (!code) {
                throw new Error('No authorization code received from Google');
            }

            // Send the authorization code to your backend
            const response = await axios.post("http://localhost:3000/user/google-signin", {
                code: code
            });

            localStorage.setItem("token", response.data.token);
            navigate("/chat");
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            setError("Google sign-in failed. Please try again.");
        }
    };

    const login = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: handleGoogleSignIn,
        onError: () => setError("Google sign-in failed. Please try again."),
        scope: 'openid email profile https://www.googleapis.com/auth/calendar',
    });

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                    <Heading label={"Sign in"} />
                    <SubHeading label={"Enter your credentials to access your account"} />
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <InputBox
                        type="email"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="name@gmail.com"
                        label={"Email"}
                    />
                    <InputBox
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="123456"
                        label={"Password"}
                    />
                    <div className="pt-4">
                        <Button label={"Sign in"} onClick={handleEmailSignIn} />
                    </div>
                    <div className='pt-4 w-full px-10 pb-2'>
                        <div className="w-full justify-center">
                            <Button label={"Sign in with Google"} onClick={() => login()} />
                        </div>
                    </div>
                    <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
                </div>
            </div>
        </div>
    );
}

export default Signin;

// import React,{useState} from 'react';
// import { Heading } from '../components/Heading'
// import { SubHeading } from '../components/SubHeading'
// import { InputBox } from '../components/InputBox'
// import { Button } from '../components/Button'
// import { BottomWarning } from '../components/BottomWarning'
// import { useNavigate } from 'react-router-dom';
// import {jwtDecode} from 'jwt-decode';
// import {GoogleLogin} from '@react-oauth/google';
// import axios from 'axios';
// import { useGoogleLogin } from '@react-oauth/google';



// function Signin() {
//     const navigate=useNavigate();
//     const [userName,setuserName]=useState("");
//     const [password,setPassword]=useState("");

//     const handleButton=async()=>{
//         try {
//             const response=await axios.post("https://realtimechatbot-rentok.onrender.com/user/signin",{
//                 userName,
//                 password
//             });
//             localStorage.setItem("token",response.data.token);
//             navigate("/chat");
            
//         } catch (error) {
//             console.log(error); 
//         }

//     }; 

//     const handleGoogleSignIn=async(tokenResponse)=>{
//         try {
//           console.log('Full Google Sign-In response:', tokenResponse);

//           const { access_token, credentialResponse } = tokenResponse;
//           console.log('Access Token:', access_token);
//           console.log('ID Token:', credentialResponse);
//             const decoded=jwtDecode(credentialResponse.credential);
//             console.log(decoded);
//             //https://realtimechatbot-rentok.onrender.com
//             const response=await axios.post("http://localhost:3000/user/google-signin",{
//                 token:credentialResponse.credential,
//             });
//             localStorage.setItem("token",response.data.token);
//             navigate("/chat"); 
//         } catch (error) {
//             console.error('Google Sign-In Error:', error);
//         }

//     };
//     const login = useGoogleLogin({
//       onSuccess: handleGoogleSignIn,
//       flow: 'auth-code',
//       scope: 'openid https://www.googleapis.com/auth/calendar',
//       prompt: 'consent',
//     });
    

//   return (
//     <div className="bg-slate-300 h-screen flex justify-center">
//       <div className="flex flex-col justify-center">
//         <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
//           <Heading label={"Sign in"} />
//           <SubHeading label={"Enter your credentials to access your account"} />
//           <InputBox
//             type="email"
//             value={userName}
//             onChange={(e) => {
//               setuserName(e.target.value);
//             }} placeholder="name@gmail.com" label={"Email"} />
//           <InputBox
//             type="password"
//             value={password}
//             onChange={(e) => {
//               setPassword(e.target.value);
//             }}
//             placeholder="123456" label={"Password"} />
//           <div className="pt-4">
//             <Button label={"Sign in"} onClick={handleButton} />
//           </div>
//           <div className='pt-4 w-full px-10 pb-2'>
//             <div className="w-full justify-center">
//             {/* <GoogleLogin
//              onSuccess={handleGoogleSignIn}
//              onError={() => console.log('login failed')}
//              scope="https://www.googleapis.com/auth/calendar email profile"
// /> */}
//          <Button label={"Sign in with Google"} onClick={login} />
//  {/* onClick={() => login()}></button> */}

//             </div>
//           </div>
//           <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Signin