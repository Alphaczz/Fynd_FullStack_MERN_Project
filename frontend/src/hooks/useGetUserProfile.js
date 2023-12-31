import { useEffect, useState } from 'react'
import useShowToast from './useShowToast';
import { useParams } from 'react-router-dom';


const useGetUserProfile = () => {
   const [user,setUser]= useState(null);
   const [loading,setLoading]= useState(true);
   const {username}= useParams();
   const showToast = useShowToast();
    useEffect(()=>{
            const getUser = async () => {
              setLoading(true);
              try {
                const response = await fetch(`/api/users/profile/${username}`);
                const data = await response.json();
                console.log(data);
                if (data.error) {
                  showToast("Error", data.error,"error");
                }
                setUser(data);
              } catch (error) {
                showToast("Error", error,"error");
        
              }finally{
                setLoading(false);
              }
            };
            getUser();
    },[username,showToast])
    return {loading,user}


}

export default useGetUserProfile