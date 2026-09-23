import Svg, { Path } from "react-native-svg";

const PATHS = {
  drop: "M12 2C6 9 4 13 4 16.5a8 8 0 0016 0C20 13 18 9 12 2z",
  home: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
  grid: "M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z",
  bag: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  user: "M20 21a8 8 0 10-16 0 M12 12a4 4 0 100-8 4 4 0 000 8z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:
    "M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22",
  mail: "M2 4h20v16H2z M2 4l10 9 10-9",
  lock: "M7 11V7a5 5 0 0110 0v4 M3 11h18v11H3z",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  trash: "M3 6h18 M19 6l-1 14H6L5 6 M10 11v6 M14 11v6 M9 6V4h6v2",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  back: "M19 12H5 M12 19l-7-7 7-7",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35",
  map: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  water: "M12 2C6 9 4 13 4 16a8 8 0 0016 0c0-3-2-7-8-14z M12 18a3 3 0 01-3-3",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  ok: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z",
  clock: "M12 2a10 10 0 100 20 10 10 0 000-20z M12 6v6l4 2",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
};

export default function Ic({ n, size = 20, color = "currentColor" }) {
  const raw = PATHS[n] || "";
  const segments = raw.split(" M ").map((seg, i) => (i === 0 ? seg : "M " + seg));
  const resolvedColor = color === "currentColor" ? "#111827" : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {segments.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={resolvedColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
