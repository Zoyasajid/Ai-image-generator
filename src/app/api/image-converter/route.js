import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req, res) {
  const { prompt } = await request.json(); 
  console.log(prompt,'prompt')
  let imageUrl = '';

  try {
    // Make a request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',  // Example endpoint; use the correct one
      {
        prompt: prompt || 'A futuristic cityscape with flying cars',  // Use the dynamic prompt
        size: '512x512',  // Image size; adjust as needed
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract image URL from response
    imageUrl = response.data.data[0].url;  // Adjust based on API response
  } catch (error) {
    console.error('Error generating image:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the generated image URL
  return NextResponse.json({ imageUrl });
}
