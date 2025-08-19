import { asynchandler } from '../utils/asynchandler.js';
const createUser = asynchandler(async (req, res) => {
    res.status(201).json({
        message:"User created successfully",
})
})
    

export { createUser };