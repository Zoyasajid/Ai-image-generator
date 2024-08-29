"use client"

import Image from 'next/image'
import React from 'react'
import logo from '@/../../public/Ai_image-logo.png'
import { usePathname, useRouter } from 'next/navigation'
export default function Navber() {
    const router = useRouter()
    const pathname = usePathname()
  return (
    <div className='bg-[#181b18] h-24 flex justify-between px-12' >
        <Image src={logo} width={450} height={450} onClick={()=>{
        router.push("/")}}/>
     {pathname !== "/create-image" &&
     
     <button className='bg-[#FF9431] my-6 px-5 rounded-xl text-white font-semibold text-lg' onClick={()=>{
        router.push("/create-image")}}>Create Image</button>
     } 
    </div>
  )
}
