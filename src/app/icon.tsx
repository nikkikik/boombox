import { ImageResponse } from "next/og";

export const size = { width: 1024, height: 1024 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1a1838 0%, #050508 55%, #2a1848 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 720,
            height: 720,
            borderRadius: 160,
            background: "linear-gradient(180deg, #e8954f 0%, #8b5a2b 100%)",
            boxShadow: "0 0 80px rgba(232, 149, 79, 0.45)",
          }}
        >
          <div
            style={{
              fontSize: 200,
              fontWeight: 900,
              color: "#fff8e8",
              letterSpacing: -8,
            }}
          >
            BB
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
