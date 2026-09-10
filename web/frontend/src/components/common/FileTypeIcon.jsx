const TYPE_STYLES = {
  pdf: { accent: "#ff8a65", label: "PDF" },
  md: { accent: "#4cc2ff", label: "Markdown" },
};

export function FileTypeMark({ fileType, size = 20 }) {
  const style = TYPE_STYLES[fileType] || { accent: "#c9c9d9", label: "File" };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 2.5H14L19 7.5V19.5C19 20.6 18.1 21.5 17 21.5H6C4.9 21.5 4 20.6 4 19.5V4.5C4 3.4 4.9 2.5 6 2.5Z"
        fill={`${style.accent}26`}
        stroke={style.accent}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 2.5V7.5H19" stroke={style.accent} strokeWidth="1.4" strokeLinejoin="round" />

      {fileType === "pdf" ? (
        <text
          x="11.5"
          y="16.8"
          textAnchor="middle"
          fontSize="6"
          fontWeight="700"
          fill={style.accent}
          fontFamily="'Segoe UI', system-ui, sans-serif"
        >
          PDF
        </text>
      ) : fileType === "md" ? (
        <path
          d="M7 16.5V11.5L9.5 14L12 11.5V16.5M14.5 11.5V16.5L16.5 13.8"
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path d="M8 12.5H16M8 16H13" stroke={style.accent} strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function FileTypeIcon({ fileType, onClick, className = "" }) {
  const label = TYPE_STYLES[fileType]?.label || "File";

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`grid h-11 w-11 flex-none place-items-center rounded-xl border border-white/[0.16] bg-gradient-to-br from-white/[0.2] to-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.32),0_6px_16px_rgba(0,0,0,.3)] backdrop-blur-xl backdrop-saturate-[1.6] transition-transform hover:scale-[1.05] ${className}`}
    >
      <FileTypeMark fileType={fileType} />
    </button>
  );
}