import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


import { v2 as cloudinary } from 'cloudinary';



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
const uploadcloudinary = async (localfilePath) => {
    try {
        if (!fs.existsSync(localfilePath)) {
            throw new Error("File does not exist at the specified path");
        }
        
        // Upload the file to Cloudinary
        console.log("Uploading to Cloudinary:", localfilePath);

        const result = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto" // Automatically detect the resource type (image, video, etc.)
        });
        console.log("Upload successful:", result);
        return result;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        fs.unlinkSync(localfilePath); // Clean up the local file
        throw error;
    }



}
export { uploadcloudinary, cloudinary };