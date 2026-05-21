import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050508",
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 40,
            background: "linear-gradient(180deg, #e8954f 0%, #8b5a2b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            color: "#fff8e8",
          }}
        >
          BB
        </div>
      </div>
    ),
    { width: 200, height: 200 }
  );
}
