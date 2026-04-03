import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
        }}
      >
        <svg
          width="20"
          height="18"
          viewBox="0 0 284 268"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M142 0L284 268H0L142 0Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
