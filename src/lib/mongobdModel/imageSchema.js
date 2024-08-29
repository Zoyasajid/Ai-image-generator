import mongoose from "mongoose";
const imageModel = new mongoose.Schema({
    name:String,
    description:String,
    url:String,
})
export const AiImageSchema = mongoose.models.images || mongoose.model("images",imageModel)