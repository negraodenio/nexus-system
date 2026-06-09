import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
          border: '2px solid #3b82f6', // Tailwind blue-500
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}
      >
        <span style={{ 
          color: 'transparent',
          backgroundImage: 'linear-gradient(to right, #60a5fa, #2563eb)', // blue-400 to blue-600
          backgroundClip: 'text',
          marginLeft: '2px', // slight optical adjustment
        }}>
          N
        </span>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
