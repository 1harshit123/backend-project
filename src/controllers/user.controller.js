import { DB_NAME } from '../constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.Model.js";
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import multer from "multer";
import jwt from "jsonwebtoken"

// Steps of getting registered user
// 1. Getting user details from frontend
// 2. Validation - not empty
// 3. Check if user already exists
// 4. Checking for image and other media Files
// 5. Upload them to Cloudinary
// 6. Create user object in DB
// 7. Remove password and refresh token field from response
// 8. Check for user creation
const generateAccessAndRefreashTokens = async(userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating access and refresh token")
   }
}
const registerUser = asyncHandler(async (req, res) => {
   console.log(req.body);
   
   const { fullName, email, username, password } = req.body;

   

   // Validation - Check for empty fields
   if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, 'One or more fields are empty');
   }

   // Check if user already exists
   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   });
   if (existedUser) {
      throw new ApiError(409, "User with duplicate email or username exists");
   }

   // Validate file uploads
   console.log("Files received: ", req.files);
   let avatarLocalPath;
   if(req.files && Array.isArray(req.files.avatar)&& req.files.avatar.length>0){
      avatarLocalPath = req.files.avatar[0].path;
   }
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }

   // if (!avatarLocalPath) {
   //    throw new ApiError(400, "Avatar file is required");
   // }

   // Upload files to Cloudinary
   // const coverImage = await uploadCloudinary(coverImageLocalPath);
   // const avatar = await uploadCloudinary(avatarLocalPath);
   

   // if (!coverImage) {
   //    throw new ApiError(400, "Failed to upload coverImage to Cloudinary");
   // }

   // Create user in the database
   const user = await User.create({
      fullName,
      avatar: avatarLocalPath || "",
      coverImage: coverImageLocalPath || "",
      email,
      password,
      username: username.toLowerCase()
   });

   // Fetch the created user without password and refreshToken fields
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating the user");
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
   );
});


const loginUser = asyncHandler(async (req, res) => {
   const {email, username, password} = req.body
   if(!(username || email)){
      throw new ApiError(400, "username or email is required")
   }

   const user = await User.findOne({
      $or: [{ username }, {email}]})
   if(!user){
      throw new ApiError(404, "User does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401, "Password is incorrect")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreashTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200, 
         {
            user: loggedInUser, accessToken, refreshToken
         },
         "user logged In successfully"
      )
   )
})

const logoutUser = asyncHandler(async(req, res) => {
   User.findByIdAndUpdate(

      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )
   const options = {
      httpOnly: true,
      secure: true
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "unauthorised request")

   }

   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
   
      const user = await User.findById(decodedToken?._id);
   
      if(!user){
         throw new ApiError(401, "invalid refresh token")
      }
   
      if (incomingRefreshToken !== user?.refreashToken){
         throw new ApiError(401, "Refresh token is expired or used")
      }
   
      const options = {
         httpOnly: true,
         secure:true
      }
   
      const {accessToken, newrefreshToken} = await generateAccessAndRefreashTokens(user._id)
   
      return res
      .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newrefreshToken, options)
         .json(
            new ApiResponse(
               200,
               { accessToken, newrefreshToken },
               "Access token refreshed"
            )
         )
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
      
   }
});

//Get user input from user
//Check if user exist in database if not then redirect to new registration
//if exits then validate password 
//give access token for a certain time to user
//and also create a refreash token for the user





// Route handler
export {registerUser, 
   loginUser, logoutUser, refreshAccessToken
};
