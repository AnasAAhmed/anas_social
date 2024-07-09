"use client";

import { addStory } from "@/lib/action";
import { useUser } from "@clerk/nextjs";
import { Story, User } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useEffect, useOptimistic, useState } from "react";

type StoryWithUser = Story & {
    user: User;
};

const StoryList = ({
    stories,
    userId
}: {
    stories: StoryWithUser[];
    userId: string;
}) => {
    const [storyList, setStoryList] = useState(stories);
    const [img, setImg] = useState<any>();
    const [open, setOpen] = useState<boolean>(false);
    const [selectedStory, setSelectedStory] = useState<StoryWithUser | null>(null);

    const openModal = (story: StoryWithUser) => {
        setSelectedStory(story);
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    const { user } = useUser();

    const add = async () => {
        if (!img?.secure_url) return;

        addOptimisticStory({
            id: Math.random(),
            img: img.secure_url,
            createdAt: new Date(Date.now()),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            userId: userId,
            user: {
                id: userId,
                username: "Sending...",
                avatar: user?.imageUrl || "/noAvatar.png",
                cover: "",
                description: "",
                name: "",
                dob: null,
                surname: "",
                city: "",
                work: "",
                school: "",
                website: "",
                createdAt: new Date(Date.now()),
            },
        });

        try {
            const createdStory = await addStory(img.secure_url);
            setStoryList((prev) => [createdStory!, ...prev]);
            setImg(null);
        } catch (err) { }
    };

    const [optimisticStories, addOptimisticStory] = useOptimistic(
        storyList,
        (state, value: StoryWithUser) => [value, ...state]
    );

    const LoadingBar = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                closeModal();
            }, 6000);

            return () => clearTimeout(timer);
        }, []);

        return (
            <div className="w-full bg-gray-200 h-1 rounded">
                <div className="bg-blue-500 h-1 rounded animate-loading-bar"></div>
            </div>
        );
    };

    return (
        <>
            <CldUploadWidget
                uploadPreset="anas_social"
                onSuccess={(result, { widget }) => {
                    setImg(result.info);
                    widget.close();
                }}
            >
                {({ open }) => {
                    return (
                        <div className="h-40 w-28 flex flex-col items-center justify-end p-s2 bg-cover rounded-md gap-1 cursor-pointer" onClick={() => open()} style={{ backgroundImage: `url(${img?.secure_url || user?.imageUrl || "/noAvatar.png"})` }}>
                            <div className="bg-blue-500 text-2xl text-white rounded-full w-8 h-8 flex justify-center items-center">
                                +
                            </div>
                            {img ? (
                                <form action={add}>
                                    <button className="text-xs bg-blue-500 p-1 rounded-md text-white">
                                        Post
                                    </button>
                                </form>
                            ) : (
                                <span className="font-medium text-white text-center h-6 text-xm lg:text-sm bg-gray-500 rounded-b-md w-full">Add a Story</span>
                            )}
                        </div>
                    );
                }}
            </CldUploadWidget>
            {/* STORY */}
            {optimisticStories.map((story) => (
                <div key={story.id} onClick={()=>openModal(story)} className="h-40 w-28 flex flex-col items-start justify-start p-2 bg-cover rounded-md gap-2 cursor-pointer" style={{ backgroundImage: `url(${story.img})` }}>
                    <Image
                        src={story.user.avatar || "/noAvatar.png"}
                        alt=""
                        width={80}
                        height={80}
                        className="w-12 h-12 rounded-full ring-4"
                    />
                </div>
            ))}

            {open && selectedStory && (
                <div className="fixed w-screen h-screen top-0 left-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
                    <div className="relative animate-modal bg-transparent rounded-lg shadow-md flex flex-col gap-2 w-full h-full md:w-3/4 md:h-3/4 p-4 md:p-6">
                        <button onClick={closeModal} className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
                            &times;
                        </button>
                        <div className="relative w-full h-full">
                            <Image src={selectedStory.img} alt="story" layout="fill" className="object-cover rounded-lg" />
                            <span className="font-medium">
                                {selectedStory.user.name || selectedStory.user.username}
                            </span>
                        </div>
                        <LoadingBar />
                    </div>
                </div>
            )}
        </>
    );
};

export default StoryList;
