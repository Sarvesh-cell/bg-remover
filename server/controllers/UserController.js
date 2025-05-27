import { Webhook } from "svix"
import userModel from "../models/userModel.js"

//API controller function to manage clerk user with database 
//https://localhost:4000/api/user/webhooks

const clerkWebhooks = async (req,res) => {
    try {

        //create a svix instance with clerk secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(JSON.stringify(req.body),{
            "svix-id":req.headers["svix-id"],
            "svix-timestamp" : req.headers["svix-timestamp"],
            "svix-signature" :  req.headers["svix-signature"]
        })

        const {data, type}=req.body

        switch (type) {
            case "user.created":{
                
                const userData={
                    clerkId: data.id,
                    email: data.email_addresses[0].email_address,
                    firstname: data.first_name,
                    lastname: data.last_name,
                    photo: data.image_url
                }

                await userModel.create(userData)
                res.JSON({})

                break;
            }

            case "user.updated":{

                 const userData={
                    email: data.email_addresses[0].email_address,
                    firstname: data.first_name,
                    lastname: data.last_name,
                    photo: data.image_url
                }

                await userModel.findOneAndUpdate({clerkId:data.id},userData)
                res.JSON({})

                break;
            }

            case "user.deleted":{
                
                 await userModel.findOneAndDelete({clerkId:data.id})
                 res.JSON({})
                break;
            }
            
            default:
                break;
        }

    } catch (error) {
        console.log(error.message);
        req.JSON({success:false,message:error.message})
        
    }
}


export {clerkWebhooks}