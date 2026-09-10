const TYPE_STYLES = {
  pdf: {
    accent: "#ff8a65",
    label: "PDF",
  },
  md: {
    accent: "#d7d9e5",
    label: "Markdown",
  },
  markdown: {
    accent: "#d7d9e5",
    label: "Markdown",
  },
  doc: {
    accent: "#5da9ff",
    label: "DOC",
  },
  docx: {
    accent: "#5da9ff",
    label: "DOCX",
  },
  txt: {
    accent: "#d7d9e5",
    label: "Text",
  },
  file: {
    accent: "#d7d9e5",
    label: "File",
  },
};

export function FileTypeMark({ fileType, size = 20 }) {
  const type = (fileType || "file").toLowerCase();
  const style = TYPE_STYLES[type] || TYPE_STYLES.file;

  /* =========================================================
     PDF ICON
     ========================================================= */
  if (type === "pdf") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Document */}
        <path
          d="M6.5 2.75H14L18.5 7.25V19.25C18.5 20.35 17.6 21.25 16.5 21.25H6.5C5.4 21.25 4.5 20.35 4.5 19.25V4.75C4.5 3.65 5.4 2.75 6.5 2.75Z"
          fill={`${style.accent}12`}
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        {/* Folded corner */}
        <path
          d="M14 2.75V7.25H18.5"
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        {/* PDF */}
        <text
          x="11.5"
          y="16.6"
          textAnchor="middle"
          fontSize="5.2"
          fontWeight="700"
          fill={style.accent}
          fontFamily="Arial, Helvetica, sans-serif"
        >
          PDF
        </text>
      </svg>
    );
  }

  /* =========================================================
     README / MARKDOWN ICON
     Original design uses a terminal >_ icon
     ========================================================= */
  if (type === "md" || type === "markdown") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* > */}
        <path
          d="M7 8.5L10.5 12L7 15.5"
          stroke={style.accent}
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* _ */}
        <path
          d="M13 15.5H17"
          stroke={style.accent}
          strokeWidth="1.55"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  /* =========================================================
     TEXT FILE
     ========================================================= */
  if (type === "txt") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.5 3.5H14.5L18 7V20H6.5C5.67 20 5 19.33 5 18.5V5C5 4.17 5.67 3.5 6.5 3.5Z"
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        <path
          d="M14 3.5V7.5H18"
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        <path
          d="M8 11H15"
          stroke={style.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <path
          d="M8 14H15"
          stroke={style.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <path
          d="M8 17H12"
          stroke={style.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  /* =========================================================
     DOC / DOCX
     ========================================================= */
  if (type === "doc" || type === "docx") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.5 2.75H14L18.5 7.25V19.25C18.5 20.35 17.6 21.25 16.5 21.25H6.5C5.4 21.25 4.5 20.35 4.5 19.25V4.75C4.5 3.65 5.4 2.75 6.5 2.75Z"
          fill={`${style.accent}12`}
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        <path
          d="M14 2.75V7.25H18.5"
          stroke={style.accent}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        <path
          d="M8 11H15.5"
          stroke={style.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <path
          d="M8 14H15.5"
          stroke={style.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <path
          d="M8 17H13"
          stroke={style.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  /* =========================================================
     GENERIC FILE
     ========================================================= */
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.5 2.75H14L18.5 7.25V19.25C18.5 20.35 17.6 21.25 16.5 21.25H6.5C5.4 21.25 4.5 20.35 4.5 19.25V4.75C4.5 3.65 5.4 2.75 6.5 2.75Z"
        fill={`${style.accent}12`}
        stroke={style.accent}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      <path
        d="M14 2.75V7.25H18.5"
        stroke={style.accent}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      <path
        d="M8 11H15.5"
        stroke={style.accent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d="M8 14H15.5"
        stroke={style.accent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FileTypeIcon({
  fileType,
  onClick,
  className = "",
}) {
  const type = (fileType || "file").toLowerCase();
  const label = TYPE_STYLES[type]?.label || "File";

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`
        grid
        h-11
        w-11
        flex-none
        place-items-center
        rounded-xl
        border
        border-white/[0.11]
        bg-gradient-to-br
        from-white/[0.12]
        to-white/[0.025]
        shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_5px_14px_rgba(0,0,0,.22)]
        backdrop-blur-xl
        backdrop-saturate-[1.4]
        transition-transform
        hover:scale-[1.05]
        ${className}
      `}
    >
      <FileTypeMark
        fileType={fileType}
        size={22}
      />
    </button>
  );
}