import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

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
          background:
            "radial-gradient(circle at 30% 30%, #1b2534 0%, #10141c 45%, #090b10 100%)",
        }}
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 35% 35%, #eff5ff 0%, #dce4f2 45%, #b7c1cf 100%)",
            boxShadow: "0 0 90px rgba(220, 228, 242, 0.25)",
          }}
        />
      </div>
    ),
    size,
  );
}
