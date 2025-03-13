import React from 'react';
import { Navigate, Route,Routes } from 'react-router-dom';
import HomePage from './pages/auth/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import SideBar from './common/SideBar';
import RightPanel from './components/commmon/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import {Toaster} from "react-hot-toast";
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from './constant/url';
import LoadingSpinner from './components/commmon/LoadingSpinner';

const App = () => {

  const {data:authUser,isLoading} = useQuery({
    queryKey : ["authUser"],
    queryFn : async()=>{
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`,{
          method:"GET",
          credentials:"include",
          headers:{
            "Content-Type":"application/json"
          }
        })
        const responseData = await res.json();
        if(responseData.error){
          return null;
        }
        if(!res.ok){
          throw new Error(responseData.error || "Something Went Wrong");
        }
        return responseData;
      } catch (error) {
        throw error
      }
    },
    retry:false
  })

  if(isLoading){
    return(
      <div className='flex items-center justify-center h-screen'>
        <LoadingSpinner size='lg'/>
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <SideBar/>}
      <Routes>
        <Route path='/' element={authUser?<HomePage/>:<Navigate to="/login"/>}/>
        <Route path='/login' element={!authUser?<LoginPage/>:<Navigate to='/'/>}/>
        <Route path='/signup' element={!authUser?<SignUpPage/>:<Navigate to='/'/>}/>
        <Route path='/notifications' element={authUser?<NotificationPage/>:<Navigate to="/login"/>}/>
        <Route path='/profile/:username' element={authUser?<ProfilePage/>:<Navigate to="/login"/>}/>
      </Routes>
      {authUser && <RightPanel/>}
      <Toaster/>
    </div>
  )
}

export default App