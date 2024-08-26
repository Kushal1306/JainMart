import express from "express";
import Users from "../models/Users.js";
import jwt from 'jsonwebtoken';
import zod from 'zod';
import bcrypt from 'bcrypt';
import { OAuth2Client } from "google-auth-library";
import authMiddleware from "../middlewares/authMiddleware.js";
import axios from 'axios';

// const client=new OAuth2Client();
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
const UserRouter = express.Router();

async function getValidAccessToken(user) {
  if (!user.googleAuth) {
    throw new Error('User has no Google authentication data');
  }

  const now = new Date();
  if (now < user.googleAuth.expiryDate) {
   
    console.log("didnt expire, the expirty data is:", user.googleAuth.expiryDate);

    return user.googleAuth.accessToken;
  }

  // If token is expired, refresh it
  try {
    const { tokens } = await client.refreshToken(user.googleAuth.refreshToken);
    user.googleAuth.accessToken = tokens.access_token;
    user.googleAuth.expiryDate = new Date(Date.now() + tokens.expires_in * 1000);
    await user.save();
    return tokens.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// const currentDateUTC = new Date(); // Gets the current date and time in UTC
// console.log("Current Date and Time in UTC:", currentDateUTC.toISOString());

// // Convert to IST
// const offsetIST = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
// const currentDateIST = new Date(currentDateUTC.getTime());
// console.log("Current Date and Time in IST:", currentDateIST.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
const now = new Date();
const timeMin = now.toISOString();
console.log(timeMin);

const signupSchema = zod.object({
  userName: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string()

})

UserRouter.post("/signup", async (req, res) => {
  const { userName, password, firstName, lastName } = req.body;
  try {
    const { success } = signupSchema.safeParse(req.body);
    if (!success)
      return res.status(401).json({ message: 'invalid credentials' });
    const existingUser = await Users.findOne({ userName: userName });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });
    const newUser = new Users({
      userName,
      password,
      firstName,
      lastName
    });
    const response = await newUser.save();
    console.log(response);
    if (response) {
      const token = jwt.sign({
        userId: response._id

      }, process.env.JWT_SECRET);
      return res.status(201).json({
        token: token,
        message: 'user created Successfully'
      })
    }
    return res.status(401).json({ message: 'request failed' });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'request failed' });
  }

});

const signinbody=zod.object({
  userName:zod.string().email(),
  password:zod.string()
});

UserRouter.post("/signin", async (req, res) => {
  const { userName, password } = req.body;
  const {success}=signinbody.safeParse(req.body);
  if(!success)
    return res.status(402).json({message:"invalid credentails"});
  try {
    const existingUser = await Users.findOne({ userName: userName });
    if (!existingUser)
      return res.status(400).json({ message: 'User Doesnt exist ' });
    const passwordMatch=await bcrypt.compare(password,existingUser.password);
    if(!passwordMatch)
      return res.status(401).json({message:'password doesnt match/ wrong credentails'});

    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);

    return res.status(201).json({
      token: token,
      message: 'user SignedIn Successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'request failed' });
  }

});

// UserRouter.post("/google-signin",async(req,res)=>{
//   const token=req.body.token;
//   console.log(token);
//   try {
//     const ticket=await client.verifyIdToken({
//       idToken:token,
//       audience:process.env.GOOGLE_CLIENT_ID
//     });
//     const payload=ticket.getPayload();
//     const googleId=payload['sub'];
//     const userName=payload['email'];
//     const firstName=payload['given_name'];
//     const lastName=payload['family_name'];
//     const picture=payload['picture'];

//     let user=await Users.findOne({userName:userName});
//     if(!user){
//       user=await Users.create({
//         userName,
//         firstName,
//         lastName,
//         googleId:googleId,
//         picture: picture
//       });
//     }
//     const jwtToken=jwt.sign({
//       userId:user._id
//     },process.env.JWT_SECRET);
//     return res.status(200).json({messsage:'signed in successfully with google',
//       token:jwtToken,
//       imageUrl:picture
//     });
    
//   } catch (error) {
//     console.error("Google Sign-In Error:", error);
//     res.status(400).json({ message: "Invalid Google token" });
//   }

// });
UserRouter.post("/google-signin", async (req, res) => {
  const { code } = req.body;
  console.log("Received authorization code:", code);

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await client.getToken(code);
    console.log("Access token:", tokens.access_token);
    console.log("Refresh token:", tokens.refresh_token);

    // Get user info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    console.log("expiry is:",tokens.expiry_date);
    

    const { sub: googleId, email: userName, given_name: firstName, family_name: lastName, picture } = userInfoResponse.data;

    // Find or create user
    let user = await Users.findOne({ userName });
    if (!user) {
      user = await Users.create({
        userName,
        firstName,
        lastName,
        googleId,
        picture,
        googleAuth: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(Date.now() + tokens.expiry_date * 1000)
        }
      });
    } else {
      // Update tokens if user already exists
      user.googleAuth = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(Date.now() + tokens.expiry_date * 1000)
      };
      await user.save();
    }
   

    // Create JWT
    const jwtToken = jwt.sign({
      userId: user._id
    }, process.env.JWT_SECRET);

    // Return response
    return res.status(200).json({
      message: 'Signed in successfully with Google',
      token: jwtToken,
      imageUrl: picture
    });

  } catch (error) {
    console.error("Google Sign-In Error:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    res.status(400).json({ message: "Google sign-in failed", error: error.message });
  }
});
//get details of user using the site "me"
UserRouter.get("/me",authMiddleware,async(req,res)=>{
     const userId=req.userId;
     try {
      //retrieving all details except password
      const user=await Users.findById(userId).select('-password');
      if(!user)
        return res.status(401).json({message:'Error occured'});
      console.log(user);
      return res.json(user);
      
     } catch (error) {
       console.error(error);
       return res.status(401).json({message:'Error occured'});
     } 
})

// updating details of user
UserRouter.patch("/me",authMiddleware,async(req,res)=>{
       const userId=req.userId;
       const {firstName,lastName,password}=req.body;
       try {
        const updateUser=await Users.findByIdAndUpdate(userId,req.body,{new:true});
        if(!updateUser)
          return res.status(401).json({message:'User details not updated'});
        return res.status(200).json({
          message:'details updated successfully',
          details:updateUser
        });
       } catch (error) {
        console.error(error);
       return res.status(401).json({message:'Error occured'});
       }
});

UserRouter.get('/calendar/events', authMiddleware, async (req, res) => {
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accessToken = await getValidAccessToken(user);
    console.log('Access token:', accessToken); // Log the token (be cautious with this in production)

    const now = new Date();
    const timeMin = now.toISOString();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const timeMax = oneWeekLater.toISOString();

    console.log('Fetching events from:', timeMin, 'to:', timeMax);

    const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone: 'Asia/Kolkata',
      }
    });

    console.log('Response data:', JSON.stringify(response.data, null, 2));

    if (response.data.items && response.data.items.length > 0) {
      res.json(response.data.items);
    } else {
      res.json({ message: 'No events found in the specified time range.' });
    }
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    res.status(500).json({ message: 'Failed to fetch calendar events', error: error.message });
  }
});

export default UserRouter;