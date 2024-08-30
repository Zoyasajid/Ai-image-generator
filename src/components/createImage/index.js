"use client";

import Navbar from "@/components/Navbar";
import * as fal from "@fal-ai/serverless-client";
import { useState, useRef } from "react";
import { SlMagicWand } from "react-icons/sl";
import { BiSolidImageAdd } from "react-icons/bi";
import {
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  db,
} from "../../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

fal.config({
  proxyUrl: "/api/proxy",
});

const INPUT_DEFAULTS = {
  _force_msgpack: new Uint8Array([]),
  image_size: "square_hd",
  num_inference_steps: "2",
  num_images: 1,
  enable_safety_checker: true,
  sync_mode: true,
};

export default function CreateImage() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const timer = useRef(null);
  const [imageData, setImageData] = useState("");
  const [postImageLoading, setPostImageLoading] = useState(false);
  const router = useRouter()
  const connection = fal.realtime.connect("fal-ai/fast-lightning-sdxl", {
    connectionKey: "Lighting-sdxl",
    throttleInterval: 64,
    onResult: async (result) => {
      const blob = new Blob([result.images[0].content], { type: "image/jpeg" });
      const imageURL = await uploadImage(blob);
      if (imageURL) {
        setImageUrl(imageURL);
      } else {
        console.error("Failed to get image URL");
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error(error);
      setLoading(false);
    },
  });

  const uploadImage = async (blob) => {
    const storageRef = ref(storage, `images/${Date.now()}_image.jpg`); 
    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setImageData(url);
      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleGenerateImage = async () => {
    if (!validateForm()) return;

    if (timer.current) {
      clearTimeout(timer.current);
    }
    setLoading(true);
    console.log(loading);
    const inputPayload = {
      ...INPUT_DEFAULTS,
      prompt: form.description,
    };
    timer.current = setTimeout(() => {
      connection.send(inputPayload);
    }, 500);
  };

  const handlePostPhoto = async () => {
    setPostImageLoading(true);
    if (!validateForm()) return;
    const docRef = await addDoc(collection(db, "ai-image-data"), {
      title: form.title,
      description: form.description,
      imageUrl: imageData,
    });
    console.log("Document written with ID: ", docRef.id);
    setImageUrl("");
    setForm({ description: "", title: "" });
    setPostImageLoading(false);
    router.push('/')
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!form.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!form.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  return (
    <div className="h-[100vh] bg-black">
      <Navbar />
      <div className="flex h-5/6 flex-col justify-center items-center text">
        {/* <div className="px-74 w-full text-white"> <h1>AI Image Generator</h1></div> */}
        <div className="flex justify-between w-full px-72 gap-16">
          <div className="w-2/4 p-4 h-[500px]">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-white mb-4 text-lg font-medium">
                  Title:
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter image Title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full h-14 p-4 border bg-transparent text-white border-[#FF9431] rounded-2xl"
                />
                {errors.title && (
                  <p className="text-red-500 mt-3">{errors.title}</p>
                )}
              </div>

              <div className="mb-6 mt-7">
                <label className="block text-white mb-4 text-lg font-medium">
                  Description:
                </label>
                <textarea
                  name="description"
                  rows="5"
                  placeholder="Description for generating Ai image"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-4 border border-[#FF9431] text-white rounded-2xl bg-transparent"
                />
                {errors.description && (
                  <p className="text-red-500 mt-3">{errors.description}</p>
                )}
              </div>

              <div className="flex gap-4 mt-20">
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  className="bg-blue-500 text-white px-4 py-2 w-1/2 h-14 rounded-xl"
                >
                  {loading ? (
                    "Generating..."
                  ) : (
                    <p className=" items-center flex justify-center gap-3 text-xl">
                      <SlMagicWand className="text-xl" />
                      Generate AI Image
                    </p>
                  )}
                </button>
                <button
                  type="button"
                  disabled={imageUrl === ""}
                  onClick={handlePostPhoto}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl w-1/2 h-14 "
                >
                  <p className=" items-center flex justify-center gap-3 text-xl">
                    {postImageLoading ? (
                      <p className="flex text-white items-center justify-center gap-4">
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            class="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span class="sr-only text-white">Loading...</span>
                        </div>
                        Post Image
                      </p>
                    ) : (
                      <>
                        <BiSolidImageAdd className="text-2xl" />
                        Post Image
                      </>
                    )}
                  </p>
                </button>
              </div>
            </form>
          </div>
          <div className="w-2/4 h-[500px] border-4 border-[#FF9431] overflow-hidden rounded-2xl flex items-center justify-center ">
            {!loading && imageUrl === "" ? (
              <p className="text-[#9b8e8e] text-xl font-semibold ">
                Write a description to generate image{" "}
              </p>
            ) : loading ? (
              <p className="flex text-white items-center justify-center gap-6">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only text-white">Loading...</span>
                </div>
                Generating Ai Image...
              </p>
            ) : (
              imageUrl && (
                <img
                  src={imageUrl}
                  height="500px"
                  style={{ height: "500px", width: "100%" }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
