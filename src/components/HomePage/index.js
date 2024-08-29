"use client";

import Navber from "../Navbar";
import * as fal from "@fal-ai/serverless-client";
import Image from "next/image";
import { useState, useRef } from "react";
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
  const [image, setImage] = useState("");
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

  return (
    <div className="h-[100vh] bg-black">
      <Navber />
      <div className="flex   h-2/3 flex-col justify-center items-center text">
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
            Create Image
          </button>
        </div>
        {image && <Image src={image} width={200} height={200} />}
      </div>
    </div>
  );
}
