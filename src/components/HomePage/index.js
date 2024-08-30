"use client";

import { db } from "@/firebaseConfig";
import Navber from "../Navbar";
import * as fal from "@fal-ai/serverless-client";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
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
function randomSpeed() {
  return Math.floor(Math.random() * 10000000).toFixed(0);
}
export default function HomePage() {
  const [input, setInput] = useState("");
  const [interfaceTime, setInterfaceTime] = useState(null);
  const [image, setImage] = useState("");  const [images, setImages] = useState([]);

  const [seed, setSeed] = useState(randomSpeed());
  const timer = useRef();
  const connection = fal.realtime.connect("fal-ai/fast-lightning-sdxl", {
    connectionKey: "Lighting-sdxl",
    throttleInterval: 64,
    onResult: (result) => {
      console.log(result);
      const blob = new Blob([result.images[0].content], { type: "image/jpeg" });
      const imageURL = URL.createObjectURL(blob);
      setImage(imageURL);
      setInterfaceTime(result.timings.interface);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const handleOnChange = (value) => {
    if (timer.current) {
      clearTimeout(timer);
    }
    setInput(value);
    const input = {
      ...INPUT_DEFAULTS,
      prompt: value,
      seed: seed ? Number(seed) : Number(randomSpeed()),
    };
    timer.current = setTimeout(() => {
      connection.send(input);
    }, 500);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ai-image-data"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setImages(data);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchData();
  }, []); 
  
  return (
    <div className="h-auto bg-black">
      <Navber />
      <div className="flex h-[65vh] flex-col justify-center items-center text ">
        <h2 className="font-bold text-5xl text-[#FF9431]">
          A Journey Through Imagination
        </h2>
        <h4 className="text-[40px] font-normal text-white mt-7 text-center">
          We illustrate only what you desire
          <br />
          from your imagination!
        </h4>
        <div className="mt-7">
          <input
            placeholder="Enter keyword to search..."
            value={input}
            onChange={(e) => handleOnChange(e.target.value)}
            className=" border-white rounded-l-3xl h-16 w-[700px] p-7"
            // ref={inputRef}
          />
          <button
            // onClick={() => {
            //   imageGenerator();
            // }}
            className="bg-[#FF9431] h-full px-6 rounded-r-3xl text-white font-semibold text-lg"
          >
            Search
          </button>
        </div>
        {image && <Image src={image} width={200} height={200} />}
      </div>
      <div className="h-auto">
      <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg shadow-md overflow-hidden">
            <Image height={500} width={500} src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
      </div>
    </div>
  );
}
