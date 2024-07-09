"use client";

import { updateProfile } from "@/lib/action";
import { User } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import UpdateButton from "./rightMenu/UpdateButton";
import Link from "next/link";

const UpdateUser = ({ user, isSetting }: { user: User | any, isSetting?: boolean }) => {
  const [open, setOpen] = useState(isSetting || false);
  const [cover, setCover] = useState<any>(null);
  const [state, setState] = useState({ success: false, error: false });
  const router = useRouter();

  const formAction = async (formData: FormData) => {
    try {
      await updateProfile({ success: false, error: false }, { formData, cover: cover?.secure_url || "" });
      setState({ success: true, error: false });
    } catch (error) {
      setState({ success: false, error: true });
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (state.success) {
      router.refresh();
    }
  };

  return (
    <div>
      {!isSetting && (
        <span
          className="text-blue-500 text-xs cursor-pointer"
          onClick={() => setOpen(true)}
        >
          Update
        </span>
      )}
      {open && (
        <div className={`${isSetting ? "" : "fixed w-screen h-screen top-0 left-0 bg-black bg-opacity-65"} flex items-center justify-center z-50`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              formAction(formData);
            }}
            className="p-6 animate-modal bg-white rounded-lg shadow-md flex flex-col gap-2 w-full xl:w-1/2 relative"
          >
            <h1>Update Profile</h1>
            <Link href="/settings/#profile" className="mt-4 text-xs text-blue-500 underline">
              Go to &gt;settings&gt;#profile to change username or avatar.
            </Link>
            OR
            <div className="text-xs text-gray-500">
              Use the navbar profile to change the avatar or username.
            </div>

            <CldUploadWidget
              uploadPreset="anas_social"
              onSuccess={(result) => setCover(result.info)}
            >
              {({ open }) => (
                <div className="flex flex-col gap-4 my-4" onClick={() => open()}>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <label htmlFor="cover">Cover Picture</label>
                    <Image
                      src={user.cover || "/banner.jpg"}
                      alt="Cover Picture"
                      width={48}
                      height={32}
                      className="w-12 h-8 rounded-md object-cover"
                    />
                    <span className="text-xs underline text-gray-600">Change</span>
                  </div>
                  {cover && cover !== '' && (
                    <div className="flex items-center gap-2 cursor-pointer">
                      <label htmlFor="preview">Preview</label>
                      <Image
                        src={cover.secure_url}
                        alt="Preview"
                        width={48}
                        height={32}
                        className="w-12 h-8 rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </CldUploadWidget>

            <div className="flex flex-wrap justify-center gap-2 xl:gap-4">
              {[
                { label: 'First Name', name: 'name', placeholder: user.name || 'John' },
                { label: 'Surname', name: 'surname', placeholder: user.surname || 'Doe' },
                { label: 'Description', name: 'description', placeholder: user.description || 'Life is beautiful...' },
                { label: 'City', name: 'city', placeholder: user.city || 'New York' },
                { label: 'School', name: 'school', placeholder: user.school || 'MIT' },
                { label: 'Work', name: 'work', placeholder: user.work || 'Apple Inc.' },
                { label: 'Website', name: 'website', placeholder: user.website || 'https://your-domain.com' },
              ].map(({ label, name, placeholder }) => (
                <div className="flex flex-col gap-4" key={name}>
                  <label htmlFor={name} className="text-xs text-gray-500">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                    name={name}
                  />
                </div>
              ))}
              <div className="flex flex-col gap-4">
                <label htmlFor="dob" className="text-xs text-gray-500">
                  Date-of-birth: {user.dob ? new Date(user.dob).toISOString().split('T')[0] : "null"}
                </label>
                <input
                  type="date"
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="dob"
                />
              </div>
            </div>
            <UpdateButton />
            {state.success && (
              <span className="text-green-500">Profile has been updated!</span>
            )}
            {state.error && (
              <span className="text-red-500">Something went wrong!</span>
            )}
            {!isSetting && (
              <div
                className="absolute text-xl right-3 top-4 cursor-pointer"
                onClick={handleClose}
              >
                <Image
                  src="/cross.png"
                  alt="Close"
                  width={5}
                  height={5}
                  className="w-5 h-5 rounded-md object-cover"
                />
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;
