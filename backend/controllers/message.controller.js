import cloudinary from '../lib/cloudinary.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { getReceiverSocketId, io } from "../socket.js";

// Function to get users for the sidebar, excluding the logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password");  // Exclude password for security

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getting users for sidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get messages between the logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Fetch messages between the two users, sorted by creation date
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });  // Sort messages by ascending creation date

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in fetching messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to send a message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    // Upload image if provided
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (cloudError) {
        console.error("Cloudinary upload error:", cloudError.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Create and save the new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl || null,  // Ensure null if no image is provided
    });

    await newMessage.save();
    
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sending message:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};