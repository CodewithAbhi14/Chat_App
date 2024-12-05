import {create} from 'zustand'
import {axiosInstance} from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set,get)=>({
    message:[],
    users:[],
    selectedUser:null,
    isUserLoading:false,
    isMesssagesLoading:false,

    getUsers: async ()=>{
        set({isUserLoading:true})
        try {
            const res = await axiosInstance.get('/message/users');
            set({users: res.data});
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isUserLoading: false})
        }
    },

    getMessages: async (userId)=>{
        set({isMesssagesLoading: true})
        try {
            const res = await axiosInstance.get(`/message/${userId}`)
            set({message: res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isMesssagesLoading: false})
        }
    },

    sendMessage: async(messageData)=> {
        const {selectedUser, message} = get()
        try {
            const res =await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData)
            set({message:[...message, res.data]})
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: ()=>{
        const {selectedUser} = get()
        if(!selectedUser) return

        const socket = useAuthStore.getState().socket

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
            if(!isMessageSentFromSelectedUser) return;
            set({
                message: [...get().message, newMessage]
            })
        })
    },

    unsubscribeFromMessages: ()=>{
        const socket = useAuthStore.getState().socket

        socket.off("newMessage")
    },



    setSelectedUser: (selectedUser) => set({selectedUser}),
}))