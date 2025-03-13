import Post from "./Post";
import PostSkeleton from "../components/skeletons/PostSkeleton";
import { POSTS } from "../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../constant/url";
import { useEffect } from "react";

const Posts = ({feedType,username,userId}) => {

	const getFeed = ()=>{
		switch(feedType){
			case 'forYou':
				return `${baseUrl}/api/post/all`;
			case 'following':
				return `${baseUrl}/api/post/following`;
			case 'posts':
				return `${baseUrl}/api/post/user/${username}`;
			case 'likes':
				return `${baseUrl}/api/post/likes/${userId}`;
			default:
				return `${baseUrl}/api/post/all`;
		}
	}

	const getEndPoint = getFeed();
	
	
	const {data:posts,isLoading,isRefetching,refetch} = useQuery({
		queryKey:["posts"],
		queryFn:async()=>{
			try {
				const res = await fetch(getEndPoint,{
					method:"GET",
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
		}
	})

	useEffect(()=>{
		refetch();
	},[feedType,refetch,username])
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;