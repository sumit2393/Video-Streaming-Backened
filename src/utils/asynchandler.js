const asynchandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
            .catch((error)=>{
                console.error("Error in async handler:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal Server Error",
                    error: error.message || "An unexpected error occurred"
                });
            });
    }
    
}

export {asynchandler}