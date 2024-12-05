import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO)
        console.log('Mongo DB Connected')
    } catch (error) {
        console.log(error)
        
    }
}