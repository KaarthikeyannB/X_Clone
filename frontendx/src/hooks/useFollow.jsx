import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../constant/url";
import toast from "react-hot-toast";


const useFollow=()=>{
    const queryClient = useQueryClient();
    const {mutate:follow,isPending} = useMutation({
        mutationFn:async(userId)=>{
            try {
                const res = await fetch(`${baseUrl}/api/users/follow/${userId}`,{
                    method:"POST",
                    credentials:"include",
                    headers:{
                        "Content-Type":"application/json"
                    }
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
        onSuccess:()=>{
            Promise.all([
                queryClient.invalidateQueries({
                    queryKey:["suggestedUser"]
                }),
                queryClient.invalidateQueries({
                    queryKey:["authUser"]
                }),
                queryClient.invalidateQueries({
                    queryKey: ["userProfile"]
                })
            ])
        },
        onError:()=>{
            toast.error(error.message)
        }
    })
    return {follow,isPending}
}

export default useFollow;