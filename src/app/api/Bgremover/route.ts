import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

const API_KEY = env.API_KEY;
const API_HOST = 'removed-bg.p.rapidapi.com';

// Helper: Convert base64 string to a Blob
function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function POST(request: NextRequest) {
  try {
    const { image_base64 } = await request.json();

    if (!image_base64) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    // Convert the base64 string to a Blob (assuming a PNG image)
    const imageBlob = base64ToBlob(image_base64, 'image/png');

    // Create FormData and append necessary fields
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('format', 'png');
    formData.append('roi', '0% 0% 100% 100%');
    formData.append('crop', 'true');
    formData.append('crop_margin', '0');
    formData.append('scale', 'original');
    formData.append('position', 'original');
    formData.append('channels', 'rgba');
    formData.append('shadow', 'false');
    formData.append('semitransparency', 'true');

    const url = 'https://removed-bg.p.rapidapi.com/image/matte/v1';
    
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
        // Do NOT manually set Content-Type; let fetch set the boundary for FormData
      },
      body: formData
    } as const; // Use const assertion to ensure type safety

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to process image' },
        { status: response.status }
      );
    }

    const processedImageBlob = await response.blob();
    return new NextResponse(processedImageBlob, {
      headers: {
        'Content-Type': 'image/png'
      }
    });

  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
