import { ImageResponse } from "next/og";
import { PROFILE } from "@/config/profile";

export const alt = `${PROFILE.os.name} – ${PROFILE.name}`;
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#15161a",
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 85% 20%, rgba(168,85,247,0.25), transparent 40%), radial-gradient(circle at 50% 110%, rgba(59,130,246,0.35), transparent 50%)",
          fontFamily: "sans-serif",
          color: "#f4f4f5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 760,
            borderRadius: 24,
            backgroundColor: "rgba(34,35,40,0.85)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 999, background: "#ff5f57" }} />
            <div style={{ width: 16, height: 16, borderRadius: 999, background: "#febc2e" }} />
            <div style={{ width: 16, height: 16, borderRadius: 999, background: "#28c840" }} />
            <div style={{ marginLeft: 16, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>README.md</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: "44px 48px 48px" }}>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
              {PROFILE.name}
            </div>
            <div style={{ marginTop: 14, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>
              {`${PROFILE.role} · ${PROFILE.location}`}
            </div>
            <div style={{ marginTop: 34, fontSize: 24, color: "rgba(255,255,255,0.55)" }}>
              {PROFILE.tagline}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {`${PROFILE.os.name} ${PROFILE.os.version} · ${PROFILE.links.site.replace("https://", "")}`}
        </div>
      </div>
    ),
    size
  );
}
