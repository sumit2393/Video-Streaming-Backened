import mongoose from 'mongoose';

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
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
    }

},

    {
        timestamps: true
    });

    userSchema.pre   ('save', async function (next) {
        if (!this.isModified('password')) {
            return next();
        }
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(this.password, salt);
            this.password = hash;
            next();
            
        } catch (error) {
            next(error);
        }

    }

);
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}
userSchema.methods.generateAccessToken = function () {
    jwt.sign(
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
    export const User = mongoose.model('User', userSchema);