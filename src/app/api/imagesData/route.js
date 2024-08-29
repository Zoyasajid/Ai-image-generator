import { AiImageSchema } from "@/lib/mongobdModel/imageSchema";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(){
let data = []
try {
    await mongoose.connect(process.env.MONGODB_URI)
   data = await AiImageSchema.find()
  
} catch (error) {
    console.log(error)
}
   
    return NextResponse.json({result:data})
}