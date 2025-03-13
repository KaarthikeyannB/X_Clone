import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../constant/url";
import toast from "react-hot-toast";

const useUpdateUser = () =>{

    const queryClient = useQueryClient();

    const {mutateAsync:updateProfile,isPending:isUpdating} = useMutation({
            mutationFn:async(formData)=>{
                try {
                    const res = await fetch(`${baseUrl}/api/users/update`,{
                        method:"POST",
                        credentials:"include",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify(formData)
                    })
                    const responseData = await res.json();
                    if(!res.ok){
                        throw new Error(responseData.error || "Something went wrong");
                    }
                    return responseData;
                } catch (error) {
                    throw error;
                }
            },
            onSuccess:(data)=>{
                toast.success("Profile Updated")
                Promise.all([
                    queryClient.invalidateQueries({
                        queryKey:["authUser"]
                    }),
                    queryClient.invalidateQueries({
                        queryKey:["userProfile"]
                    }),
                    queryClient.invalidateQueries({
                        queryKey:["posts"]
                    })
                ])
            },
            onError:(error)=>{
                toast.error(error.message)
            }
        })
        return {updateProfile,isUpdating}
}


export default useUpdateUser;