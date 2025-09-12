import { asynchandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadcloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

    const { fullName, email, username, password } = req.body;

    console.log("Creating user with email:", email);

    if (

        [fullName, email, username, password].some(field => field?.trim() === '')
    ) {
        throw new ApiError(400, "Name is required");
    }
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }
    const avatar = req.files?.avatar && req.files.avatar[0]?.path;
    const coverImage = req.files?.coverImage?.[0]?.path;
    if (!avatar) {
        throw new ApiError(400, "Avatar is required");

    }
    if (!coverImage) {
        throw new ApiError(400, "Cover image is required");
    }
    const avatarUrl = await uploadcloudinary(avatar);
    const coverImageUrl = await uploadcloudinary(coverImage);
    if (!avatarUrl || !coverImageUrl) {
        throw new ApiError(409, "Avatar & cover image required");
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl.url || "",



    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken -__v ')
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    // res.status(201).json({
    //     success: true,
    //     message: "User created successfully",
    //     data: createdUser
    // });

    res.status(201).json(new ApiResponse(
        201, createdUser, "User created successfully"));

})

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    }
    catch
    (error) {
        throw new ApiError(500, "Token generation failed");

    }
}
const loginUser = asynchandler(async (req, res) => {
    // req body => data
    //username or  email,
    //find user based on username or email
    //check if user exists
    //check for password
    //generate access token
    //generate refresh token
    //send cookies & response

    req.body.email = req.body.email.toLowerCase();
    const { email, username, password } = req.body;
    if ([email, username, password].some(field => field?.trim() === '')) {
        throw new ApiError(400, "Username & Password are required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isMatch = await user.PasswordCorrect(password);
    if (!password) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

    if (!accessToken, !refreshToken) {
        throw new ApiError(500, "Token generation failed");
    }
    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken -__v ')

})
const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            refreshToken: null
        },
        {
            new: true,
            runValidators: true
        }
    )
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    return res.status(200)
        .clearCookie('refreshToken', cookieOptions)
        .clearCookie('accessToken', cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

return res.status(200).cookie('refreshToken', refreshToken, cookieOptions)
    .cookie('accessToken', accessToken, cookieOptions).
    json(new ApiResponse(
        200,
        {
            user: loginUser,
            accessToken,
            refreshToken,
        },
        "User logged in successfully"
    ));


export {
    createUser,
    loginUser,
    logoutUser

};