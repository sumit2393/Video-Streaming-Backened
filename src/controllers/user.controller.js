import { asynchandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/apiE.js';
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { use } from 'react';

const createUser = asynchandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res





    const { name, email, username, password } = req.body;

    console.log("Creating user with email:", email);

    if (

        [name, email, username, password].some(field => field?.trim() === '')
    ) {
        throw new ApiError(400, "Name is required");
    }
    const existingUser = User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }
    const avatar = req.files?.avatar[0]?.path;
    const coverImage = req.files?.cover[0]?.path;
    if (!avatar) {
        throw new ApiError(400, "Avatar is required");

    }
    if (!coverImage) {
        throw new ApiError(400, "Cover image is required");
    }
    const avatarUrl = await uploadToCloudinary(avatar);
    const coverImageUrl = await uploadToCloudinary(coverImage);
     if(!avatarUrl || !coverImageUrl){
        throw new ApiError(409,"Avatar & cover image required");
     }
    
    const user = await User.create({
        name,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl,
        coverImage: coverImage?.url||"",
        

    })

})

export { createUser };