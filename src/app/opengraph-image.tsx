import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0c0818 0%, #1a1838 50%, #2a1050 100%)",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, color: "#f8edd4" }}>
          Boombox Warplet
        </div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#94a3b8" }}>
          Whack Warplets on Base · Cash out $BOOM
        </div>
      </div>
    ),
    { ...size }
  );
}
