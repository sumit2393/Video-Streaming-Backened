import mongoose from 'mongoose';

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
   password: {
            type: String,
            required: [true, 'Password is required']
        },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },

    watchhistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    refreshToken: {
        type: String
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date

},

    {
        timestamps: true
    });

    userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function (password) {
    
    return await bcrypt.compare(password, this.password);
    
}
userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
        { id: this._id, email: this.email,fullName:this.fullName },
        process.env.ACCESS_TOKEN_SECRET || 'default_access_token_secret',
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h' }
    );
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, fullName: this.fullName },
        process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );
}

userSchema.methods.getForgotPasswordToken = function () {
    const forgotToken = crypto.randomBytes(20).toString('hex');

    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    return forgotToken;
};

    export const User = mongoose.model('User', userSchema);
