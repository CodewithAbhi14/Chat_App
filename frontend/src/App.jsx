import Navbar from '../src/components/Navbar'
import {Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUp from './pages/SignUp'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import {Loader} from 'lucide-react'
import {Toaster} from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const{authUser, checkAuth,isCheckingAuth, onlineUsers} = useAuthStore()
  const {theme} =useThemeStore()
  useEffect(()=>{
    checkAuth()
  },[checkAuth])
  console.log({authUser})
  console.log({onlineUsers})

  if(isCheckingAuth && !authUser){
    return(
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin'></Loader>
      </div>
    )
  }
  return (
    <div data-theme={theme}>
      <Navbar/>
        <Routes>
          <Route path='/' element={authUser ? <HomePage></HomePage>: <Navigate to='/login'/>}/>
          <Route path='/signup' element={!authUser ?<SignUp></SignUp>: <Navigate to="/"/>}/>
          <Route path='/login' element={!authUser ? <LoginPage></LoginPage>: <Navigate to="/"/>}/>
          <Route path='/settings' element={<SettingsPage></SettingsPage>}/>
          <Route path='/profile' element={authUser ?<ProfilePage></ProfilePage>: <Navigate to='/login'/>}/>
        </Routes>
        <Toaster/>
    </div>
  )
}

export default App