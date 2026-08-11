import type { SVGProps } from "react";

/**
 * Line-art icons drawn in the SF Symbols idiom: 24pt grid, ~1.7pt strokes,
 * round caps and joins, optically centered. Weight scales with the label
 * they sit next to because every icon inherits currentColor.
 */

const P: Record<string, React.ReactNode> = {
  /* ---------- prompt types ---------- */
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.2v2M12 18.8v2M4.8 12h-2M21.2 12h-2M6.9 6.9 5.5 5.5M18.5 18.5l-1.4-1.4M17.1 6.9l1.4-1.4M5.5 18.5l1.4-1.4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  personCircle: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="10" r="2.7" />
      <path d="M6.6 18.4a6.1 6.1 0 0 1 10.8 0" />
    </>
  ),
  squareStack: (
    <>
      <rect x="8.4" y="8.4" width="11.4" height="11.4" rx="3" />
      <path d="M15.8 5.4H7.2A2.8 2.8 0 0 0 4.4 8.2v8.6" />
    </>
  ),
  flowSteps: (
    <>
      <circle cx="5.6" cy="18" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="18.4" cy="6" r="2.2" />
      <path d="M7.3 16.4 10.4 13.5M13.7 10.4 16.8 7.6" />
    </>
  ),
  textAlignLeft: <path d="M4.6 6.6h14.8M4.6 11h10.6M4.6 15.4h14.8M4.6 19.8h8" />,
  pencil: (
    <>
      <path d="M16.4 4.9a2 2 0 0 1 2.8 2.8L8.6 18.3l-4 1.2 1.2-4Z" />
      <path d="M15 6.3l2.7 2.7" />
    </>
  ),
  curlyBraces: (
    <path d="M9.4 4.6c-2 0-2.4 1.2-2.4 3S6.6 10.9 5 10.9c1.6 0 2 1.5 2 3.3s.4 3 2.4 3M14.6 4.6c2 0 2.4 1.2 2.4 3s.4 3.3 2 3.3c-1.6 0-2 1.5-2 3.3s-.4 3-2.4 3" />
  ),
  tag: (
    <>
      <path d="M11.1 4.4H18a1.6 1.6 0 0 1 1.6 1.6v6.9a2 2 0 0 1-.6 1.4l-4.7 4.7a2 2 0 0 1-2.8 0l-6.5-6.5a2 2 0 0 1 0-2.8l4.7-4.7a2 2 0 0 1 1.4-.6Z" />
      <circle cx="15.4" cy="8.6" r="1.35" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M3.6 12h16.8" />
      <path d="M12 3.6c2.3 2.3 3.5 5.2 3.5 8.4S14.3 18.1 12 20.4C9.7 18.1 8.5 15.2 8.5 12S9.7 5.9 12 3.6Z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.4l1.5 4.1 4.1 1.5-4.1 1.5L12 14.6l-1.5-4.1L6.4 9l4.1-1.5Z" />
      <path d="M18.2 14.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8ZM6 15.2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6Z" />
    </>
  ),
  chevronCode: <path d="M9.2 8.4 5 12l4.2 3.6M14.8 8.4 19 12l-4.2 3.6M13.2 5.6l-2.4 12.8" />,
  magnifierCode: (
    <>
      <circle cx="11" cy="11" r="6.6" />
      <path d="M15.9 15.9 20.4 20.4" />
      <path d="M10 8.9 8.1 11l1.9 2.1M12.4 8.9 14.3 11l-1.9 2.1" />
    </>
  ),
  docText: (
    <>
      <path d="M6.6 4.4h6.2l4.6 4.6v10.6a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19.6V6A1.6 1.6 0 0 1 6.6 4.4Z" />
      <path d="M12.6 4.6V9h4.6M8.4 13h7.2M8.4 16.6h7.2" />
    </>
  ),
  wrench: (
    <path d="M15.6 3.6a4.9 4.9 0 0 0-3.8 8l-7.3 7.3a1.4 1.4 0 0 0 0 2l.6.6a1.4 1.4 0 0 0 2 0l7.3-7.3a4.9 4.9 0 0 0 5.9-6.9l-2.6 2.6-2.6-.5-.5-2.6 2.6-2.6a4.9 4.9 0 0 0-1.6-.6Z" />
  ),
  photo: (
    <>
      <rect x="3.6" y="5.2" width="16.8" height="13.6" rx="2.6" />
      <circle cx="8.6" cy="10" r="1.5" />
      <path d="M4.2 16.6l4.3-4a1.8 1.8 0 0 1 2.4 0l3 2.8M14.4 15.4l1.6-1.5a1.8 1.8 0 0 1 2.4 0l1.6 1.5" />
    </>
  ),
  film: (
    <>
      <rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.6" />
      <path d="M8 5.6v12.8M16 5.6v12.8M3.6 12h16.8M3.6 8.8h4.2M3.6 15.2h4.2M16.2 8.8h4.2M16.2 15.2h4.2" />
    </>
  ),
  chartBar: (
    <>
      <path d="M4.4 19.6h15.2" />
      <path d="M7.4 19.6v-5.4M12 19.6V7.6M16.6 19.6v-8.4" />
    </>
  ),
  checklist: (
    <>
      <path d="M4.6 7.2 6.2 8.8 9 6" />
      <path d="M4.6 15.2 6.2 16.8 9 14" />
      <path d="M11.8 7.4h7.6M11.8 15.4h7.6" />
    </>
  ),
  wandStars: (
    <>
      <path d="M5.4 18.6 15.6 8.4" />
      <path d="M14.4 7.2l2.4 2.4" />
      <path d="M18.6 3.4l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7ZM7.2 3.8l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5Z" />
    </>
  ),

  /* ---------- categories ---------- */
  megaphone: (
    <>
      <path d="M4.4 10.4 17.6 5.6v12.8L4.4 13.6Z" />
      <path d="M4.4 10.4H3.6v3.2h.8M8.2 12.2v5.4a1.8 1.8 0 0 0 3.6 0v-4M17.8 9.6a2.6 2.6 0 0 1 0 4.8" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3.6l7.4 4.2v8.4L12 20.4 4.6 16.2V7.8Z" />
      <path d="M4.8 7.9 12 12l7.2-4.1M12 12v8.3" />
    </>
  ),
  paintbrush: (
    <>
      <path d="M17.4 3.8a2.4 2.4 0 0 1 3 3l-6.2 5.4-2.2-2.2Z" />
      <path d="M11.4 10.6 7 15a3.6 3.6 0 0 0-1 2.6c0 1-.8 1.8-2 2 1.4 1.2 3 1.8 4.4 1.4 1.6-.4 2.4-1.6 2.6-3l4.2-4.2Z" />
    </>
  ),
  bookOpen: (
    <>
      <path d="M12 6.4v13" />
      <path d="M12 6.4C10.4 5 8.2 4.4 4.6 4.4v12.4c3.6 0 5.8.6 7.4 2 1.6-1.4 3.8-2 7.4-2V4.4c-3.6 0-5.8.6-7.4 2Z" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M6.1 6.1 9.5 9.5M14.5 14.5l3.4 3.4M17.9 6.1 14.5 9.5M9.5 14.5l-3.4 3.4" />
    </>
  ),
  flask: (
    <>
      <path d="M9.4 3.8h5.2M10.2 3.8v5L5.6 17a2.4 2.4 0 0 0 2.1 3.6h8.6a2.4 2.4 0 0 0 2.1-3.6l-4.6-8.2v-5" />
      <path d="M7.3 14.4h9.4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.6" y="7.4" width="16.8" height="12" rx="2.4" />
      <path d="M9 7.2V6a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 6v1.2M3.8 12.4h16.4" />
    </>
  ),
  heart: (
    <path d="M12 19.8S3.8 15 3.8 9.6a4.4 4.4 0 0 1 8.2-2.3 4.4 4.4 0 0 1 8.2 2.3c0 5.4-8.2 10.2-8.2 10.2Z" />
  ),

  /* ---------- interface ---------- */
  magnifier: (
    <>
      <circle cx="11" cy="11" r="6.6" />
      <path d="M15.9 15.9 20.4 20.4" />
    </>
  ),
  xmark: <path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />,
  xmarkCircleFill: (
    <>
      <circle cx="12" cy="12" r="8.6" fill="currentColor" stroke="none" />
      <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" stroke="var(--bg-secondary)" strokeWidth="2" />
    </>
  ),
  checkmark: <path d="M4.8 12.6 9.4 17.2 19.2 7.4" />,
  checkmarkCircleFill: (
    <>
      <circle cx="12" cy="12" r="8.6" fill="currentColor" stroke="none" />
      <path d="M8.2 12.4 10.9 15 15.9 9.4" stroke="var(--bg)" strokeWidth="2" />
    </>
  ),
  chevronRight: <path d="M9.6 5.6 16 12l-6.4 6.4" />,
  chevronLeft: <path d="M14.4 5.6 8 12l6.4 6.4" />,
  chevronDown: <path d="M5.6 9.2 12 15.6l6.4-6.4" />,
  chevronUp: <path d="M5.6 14.8 12 8.4l6.4 6.4" />,
  chevronUpDown: <path d="M8 10.4 12 6.4l4 4M8 13.6 12 17.6l4-4" />,
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  copy: (
    <>
      <rect x="8.6" y="8.6" width="11.2" height="11.2" rx="3" />
      <path d="M15.6 5.6H7.2A2.6 2.6 0 0 0 4.6 8.2v8.4" />
    </>
  ),
  bookmark: <path d="M6.4 5.6a1.6 1.6 0 0 1 1.6-1.6h8a1.6 1.6 0 0 1 1.6 1.6v14.2L12 16l-5.6 3.8Z" />,
  bookmarkFill: (
    <path
      d="M6.4 5.6a1.6 1.6 0 0 1 1.6-1.6h8a1.6 1.6 0 0 1 1.6 1.6v14.2L12 16l-5.6 3.8Z"
      fill="currentColor"
    />
  ),
  share: (
    <>
      <path d="M12 15.4V4.2M8.2 8 12 4.2 15.8 8" />
      <path d="M5.4 13.6v5a1.8 1.8 0 0 0 1.8 1.8h9.6a1.8 1.8 0 0 0 1.8-1.8v-5" />
    </>
  ),
  ellipsis: (
    <g fill="currentColor" stroke="none">
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </g>
  ),
  arrowRight: <path d="M4.6 12h14.8M13.6 6.2 19.4 12l-5.8 5.8" />,
  arrowUpRight: <path d="M7.4 16.6 16.6 7.4M9.4 7.4h7.2v7.2" />,
  arrowClockwise: (
    <>
      <path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.2" />
      <path d="M19.6 4.4v4h-4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
    </>
  ),
  moon: <path d="M20 14.4A8.4 8.4 0 0 1 9.6 4 8.6 8.6 0 1 0 20 14.4Z" />,
  circleHalf: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 3.6a8.4 8.4 0 0 1 0 16.8Z" fill="currentColor" stroke="none" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  signOut: (
    <>
      <path d="M14.4 4.6H7.2A2.6 2.6 0 0 0 4.6 7.2v9.6a2.6 2.6 0 0 0 2.6 2.6h7.2" />
      <path d="M11.6 12h8.2M16.6 8.8 19.8 12l-3.2 3.2" />
    </>
  ),
  sliders: (
    <>
      <path d="M4.6 8.4h9M17.4 8.4h2M4.6 15.6h2M10.6 15.6h8.8" />
      <circle cx="15.2" cy="8.4" r="2.2" />
      <circle cx="8.4" cy="15.6" r="2.2" />
    </>
  ),
  flame: (
    <path d="M12 3.4s4.8 3.6 4.8 8a4.8 4.8 0 0 1-9.6 0c0-1.4.6-2.6 1.4-3.6.2 1.6 1.2 2.4 2 2.4 1.2 0 1.8-1 1.8-2.4 0-1.6-.4-3-.4-4.4Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2V12l3.4 2.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12S6.4 6.2 12 6.2 21.2 12 21.2 12 17.6 17.8 12 17.8 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  fork: (
    <>
      <circle cx="7" cy="6.2" r="2.2" />
      <circle cx="17" cy="6.2" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M7 8.4v1.4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8.4M12 12.8v3" />
    </>
  ),
  trash: (
    <>
      <path d="M4.8 7.4h14.4M9.4 7.2V5.8a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.4" />
      <path d="M6.6 7.4l.8 11a1.8 1.8 0 0 0 1.8 1.6h5.6a1.8 1.8 0 0 0 1.8-1.6l.8-11" />
      <path d="M10.4 11v5.6M13.6 11v5.6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2.6" />
      <path d="M8.2 10.2V8a3.8 3.8 0 0 1 7.6 0v2.2" />
    </>
  ),
  envelope: (
    <>
      <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.6" />
      <path d="M4.2 7.6l6.6 5a2 2 0 0 0 2.4 0l6.6-5" />
    </>
  ),
  atSign: (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M15.8 8.2v4.6a2.6 2.6 0 0 0 5 1 8.6 8.6 0 1 0-3.2 5" />
    </>
  ),
  command: (
    <path d="M8.4 8.4a2 2 0 1 1 2-2v11.2a2 2 0 1 1-2-2h7.2a2 2 0 1 1-2 2V6.4a2 2 0 1 1 2 2Z" />
  ),
  infoCircle: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 10.8v5.4" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  warning: (
    <>
      <path d="M10.6 4.6a1.6 1.6 0 0 1 2.8 0l7 12.4a1.6 1.6 0 0 1-1.4 2.4H5a1.6 1.6 0 0 1-1.4-2.4Z" />
      <path d="M12 9.4v4.2" />
      <circle cx="12" cy="16.4" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  list: (
    <>
      <path d="M9 6.6h10.4M9 12h10.4M9 17.4h10.4" />
      <g fill="currentColor" stroke="none">
        <circle cx="5" cy="6.6" r="1.3" />
        <circle cx="5" cy="12" r="1.3" />
        <circle cx="5" cy="17.4" r="1.3" />
      </g>
    </>
  ),
  grid: (
    <>
      <rect x="4.4" y="4.4" width="6.2" height="6.2" rx="2" />
      <rect x="13.4" y="4.4" width="6.2" height="6.2" rx="2" />
      <rect x="4.4" y="13.4" width="6.2" height="6.2" rx="2" />
      <rect x="13.4" y="13.4" width="6.2" height="6.2" rx="2" />
    </>
  ),
  house: (
    <>
      <path d="M4 10.8 12 4.4l8 6.4v7.6a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18.4Z" />
      <path d="M9.6 20.2v-5.4h4.8v5.4" />
    </>
  ),
  shelf: (
    <>
      <rect x="3.6" y="4.6" width="4.4" height="14.8" rx="1.4" />
      <rect x="9.8" y="4.6" width="4.4" height="14.8" rx="1.4" />
      <path d="M16.4 6.6l4 1.2-3.2 11.4-4-1.2Z" />
    </>
  ),
  star: (
    <path d="M12 4.2l2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.7 5.4-.7Z" />
  ),
  starFill: (
    <path
      d="M12 4.2l2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.7 5.4-.7Z"
      fill="currentColor"
    />
  ),
  paperplane: <path d="M20.4 3.6 3.6 10.2l6.4 2.8 2.8 6.4Zm0 0L10 14" />,
  shield: (
    <>
      <path d="M12 3.8 19.4 6v6c0 4.2-3 7-7.4 8.2C7.6 19 4.6 16.2 4.6 12V6Z" />
      <path d="M9.2 12.2 11.4 14.4 15.2 10" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.8 20.2 8 12 12.2 3.8 8Z" />
      <path d="M3.8 12.4 12 16.6l8.2-4.2M3.8 16.4 12 20.6l8.2-4.2" />
    </>
  ),
  key: (
    <>
      <circle cx="8.4" cy="8.4" r="4" />
      <path d="M11.2 11.2 20 20M17.4 17.4l1.8-1.8M14.8 14.8l1.8-1.8" />
    </>
  ),
};

export type IconName = keyof typeof P;

export const ICON_NAMES = Object.keys(P) as IconName[];

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, strokeWidth = 1.7, ...rest }: IconProps) {
  const glyph = P[name];
  if (!glyph) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
      {...rest}
    >
      {glyph}
    </svg>
  );
}
