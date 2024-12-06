import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res)=>{
    const {fullName, email, password} = req.body
    try {

        if(!fullName || !email || !password){
            return res.status(400).json({message:"All fields must be filled"})
        }

        if(password.length < 6)
        {
            res.status(400).json({message: "Error: Password length is less than 6"})
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message:"User already exist"})

        const hashedPassword = await bcrypt.hash(password, 10)
        
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({message:"User Created...",
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                createdAt: newUser.createdAt,
            })
        }
        else{
            res.status(400).json({message: "Invalid User Data"})
        }

    } catch (error) {
        console.log("Error in SignUp Controller", error.message);
        res.status(500).json({messgae:"Internal Server Error"})
    }
}

export const login = async (req, res)=>{
    const {email, password} = req.body
    try {

        if(!email || !password){
            return res.status(400).json({message:"All fields must be filled"})
        }

        const user = await User.findOne({email})

        if(!user) return res.status(400).json({message:"User does not exist"})

        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch) {
            return res.status(400).json({message:"User does not exist"})
        }

            generateToken(user._id, res)

            res.status(201).json({message:"User Logedin...",
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                createdAt: newUser.createdAt,
            })

    } catch (error) {
        console.log("Error in LogIn Controller", error.message);
        res.status(500).json({messgae:"Internal Server Error"})
    }
}
export const logout =(req, res)=>{
    try {
        res.cookie("token","",{maxAge:0})
        res.status(200).json({message: "Logged Out"})
    } catch (error) {
        console.log("Error in Loggin Out Controller", error.message);
        res.status(500).json({messgae:"Internal Server Error"})   
    }
}

export const updateProfile =async (req, res) =>{
    try {
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic){
            res.status(400).json({message:"Profile Pic is needed"})
        }

        const uploadRespose = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadRespose.secure_url}, {new:true})

        res.status(200).json({message:"Updated User Profile Pic", profilePic: updatedUser.profilePic, Name: updatedUser.fullName})
    } catch (error) {
        console.log("Error in Update Controller", error.message);
        res.status(500).json({messgae:"Internal Server Error"})  
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth Controller", error.message);
        res.status(500).json({messgae:"Internal Server Error"})  
    }
}
