import jwt from 'jsonwebtoken'

//middle ware function to decode jwt token to get clerkId
const authUser = async (req,res,next) =>{
    try {
        
        const {token} = await req.headers

        if(!token){
            return res.JSON({success:false, message:'Not Authorized login again..'})
        }

        const token_decode = jwt.decode(token)
        res.body.clerkId=token_decode.clerkId
        next()

    } catch (error) {
        console.log(error.message);
        res.JSON({success:false,message:error.message})
    }
}

export default authUser