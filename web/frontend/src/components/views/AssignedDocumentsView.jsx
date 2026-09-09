export default function AssignedDocumentsView({ documents = [], loading, error, refresh, updateStatus }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-[clamp(20px,2.6vw,26px)] font-bold">Assigned to me</div>
        <button
          onClick={refresh}
          disabled={loading}
          className="h-[34px] rounded-[11px] border border-white/[0.16] bg-white/[0.08] px-3 text-[12.5px] font-semibold text-inherit"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && (
        <div role="alert" className="rounded-2xl bg-[#ff6aa8]/[0.12] p-3.5 text-[13px] text-[#ffd4e5]">
          {error}
        </div>
      )}
      {!loading && !error && !documents.length && (
        <div className="rounded-[22px] border border-dashed border-white/20 p-[34px] text-center text-white/[0.58]">
          No documents assigned for review.
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3.5 rounded-[20px] border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.04] px-[18px] py-4"
          >
            <a
              href={`/web/uploads/${doc.file_name}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${doc.title || doc.file_name}`}
              className="block text-inherit no-underline"
            >
              <div className="grid h-11 w-11 cursor-pointer place-items-center rounded-2xl bg-white/[0.09]">
                {doc.file_type === "pdf" ? "▤" : "≡"}
              </div>
            </a>
            <div className="min-w-0 flex-1">
              <a
                href={`/web/uploads/${doc.file_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15.5px] font-semibold text-[#eef0ff] no-underline"
              >
                {doc.title || doc.file_name}
              </a>
              <div className="mt-1.5 text-[12.5px] text-white/[0.58]">
                {doc.project_name || doc.projectName || "Unassigned"} · submitted by {doc.owner_id}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(doc.id, "published")}
                className="h-8 rounded-[9px] border border-[#5fe3a1]/30 bg-[#5fe3a1]/[0.12] px-3 font-semibold text-[#8ff0c0]"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(doc.id, "rejected")}
                className="h-8 rounded-[9px] border border-[#ff6aa8]/30 bg-[#ff6aa8]/[0.12] px-3 font-semibold text-[#ffd4e5]"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
