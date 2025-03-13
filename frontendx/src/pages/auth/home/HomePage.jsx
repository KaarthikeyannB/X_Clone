import React, { useState } from "react";
import CreatePost from "./CreatePost";
import Posts from "../../../common/Posts";
const HomePage = () => {
  //Following,forYou
  const [feedType, setFeedType] = useState("forYou");

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        <div className="flex w-full border-b border-gray-700">
          <div
            className="relative flex justify-center flex-1 p-3 hover:bg-gray-800 transition duration-300 cursor-pointer"
            onClick={() => setFeedType("forYou")}
          >
            For You
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className="relative flex justify-center flex-1 p-3 hover:bg-gray-800  transition duration-300 cursor-pointer"
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>
        <CreatePost />
        <Posts feedType={feedType}/>
      </div>
    </>
  );
};

export default HomePage;
