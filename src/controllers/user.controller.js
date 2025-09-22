import { asynchandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadcloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { client } from '../db/redis.js';
// import nodemailer from 'nodemailer';
// import { sendEmail } from '../utils/sendEmail.js';

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

    const { fullName, email, password } = req.body;

    console.log("Creating user with email:", email);

    if (

    [fullName, email, password].some(field => field?.trim() === '')
    ) {
        throw new ApiError(400, "Name is required");
    }
    const existingUser = await User.findOne({
   $or: [{ email }]    })
    if (existingUser) {
        throw new ApiError(409, "User already exists with this email");
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
        email:email.toLowerCase(),
        password,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl.url || "",

    })
    await user.save();
    const createdUser = await User.findById(user._id).select('-password -refreshToken');
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
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed: " + error.message);
    }
};
const loginUser = asynchandler(async (req, res) => {
    // req body => data
    //username or  email,
    //find user based on username or email
    //check if user exists
    //check for password
    //generate access token
    //generate refresh token
    //send cookies & response

    // req.body.email = req.body.email.toLowerCase();
    const { email, password } = req.body;
    console.log(email);

     if (!email) {
        throw new ApiError(400, " email is required")
    }

    const user = await User.findOne({
        $or: [{email}]
    })
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isMatch = await user.comparePassword(password);

    console.log("Candidate:", password);
    console.log("Stored:", user.password);
    console.log("Match result:", isMatch);

    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    // await client.set(user._id.toString(), JSON.stringify({ user }));
    // await client.HGETALL("key");


     const accessToken =user.generateAccessToken();
        const refreshToken =user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Token generation failed");
    }

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken -__v')   ;

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        // sameSite: 'strict',
        // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

    };

    return res.status(200).cookie('refreshToken', refreshToken, cookieOptions)
        .cookie('accessToken', accessToken, cookieOptions).
        json(new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User logged in successfully"
        ));


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
        // sameSite: 'strict',
        // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    return res.status(200)
        .clearCookie('refreshToken', cookieOptions)
        .clearCookie('accessToken', cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})


// const forgotPassword = asynchandler(async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         throw new ApiError(400, "Email is required");
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//         throw new ApiError(404, "User not found with this email");
//     }

//     const forgotToken = user.getForgotPasswordToken();
//     await user.save({ validateBeforeSave: false });

//     const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${forgotToken}`;

//     const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

//     try {
//         await sendEmail({
//             email: user.email,
//             subject: 'Password Recovery',
//             message,
//         });

//         res.status(200).json(new ApiResponse(200, {}, `Email sent to ${user.email} successfully`));

//     } catch (error) {
//         user.forgotPasswordToken = undefined;
//         user.forgotPasswordExpiry = undefined;
//         await user.save({ validateBeforeSave: false });
//         throw new ApiError(500, error.message || "Error sending email");
//     }
// });

// const resetPassword = asynchandler(async (req, res) => {
//     const forgotPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

//     const user = await User.findOne({
//         forgotPasswordToken,
//         forgotPasswordExpiry: { $gt: Date.now() },
//     });

//     if (!user) {
//         throw new ApiError(400, "Password reset token is invalid or has expired");
//     }

//     if (req.body.password !== req.body.confirmPassword) {
//         throw new ApiError(400, "Password and confirm password do not match");
//     }

//     user.password = req.body.password;
//     user.forgotPasswordToken = undefined;
//     user.forgotPasswordExpiry = undefined;
//     await user.save();

//     res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"));
// });

const refreshAccessToken = asynchandler(async (req, res) => {

    const incomingrefreshAccessToken = req.cookies.refreshAccessToken || req.body.refreshAccessToken; 
     if (!incomingrefreshAccessToken) {
        throw new ApiError(401, "Unauthorized request - No refresh token");
    }
    
   const decoded= jwt.verify(incomingrefreshAccessToken,
         process.env.REFRESH_TOKEN_SECRET)

       const user=  User.findById(decodedToken?._id);
  if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if(user.refreshToken !== incomingrefreshAccessToken){
         throw new ApiError(401, "Invalid refresh token - token mismatch");
    }
    const cookieOptions= {
         httpOnly: true,
        secure: true,}

       const {accessToken,newRefreshToken}= generateAccessandRefreshToken(user._id);

        return res.status(200).
        cookie( "refreshToken", newRefreshToken,cookieOptions)
        .cookie("accessToken",accessToken, cookieOptions).json
        (new ApiResponse
            (200,{ accessToken, refreshToken: newRefreshToken },
         "Access token refreshed successfully"));

});

export {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken

};
