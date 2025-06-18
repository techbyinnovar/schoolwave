import React from "react";

interface FileObj {
  url: string;
  name?: string;
  type?: string;
}

interface Props {
  files: FileObj[];
}

const AssetPreviewCarousel: React.FC<Props> = ({ files }) => {
  const previewable = files.filter(
    (f) => f.type?.startsWith("image") || f.type?.startsWith("video")
  );
  const [modalOpen, setModalOpen] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);

  if (previewable.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-4">
        {previewable.map((file, i) => (
          <div key={i} className="flex flex-col items-center">
            <button
              type="button"
              className="block focus:outline-none"
              onClick={() => {
                setModalOpen(true);
                setCurrentIdx(i);
              }}
              aria-label={file.name || file.url}
            >
              {file.type?.startsWith("image") ? (
                <img
                  src={file.url}
                  alt={file.name || "Asset image"}
                  className="w-32 h-32 object-cover rounded shadow border"
                  title={file.name || file.url}
                />
              ) : (
                <video
                  src={file.url}
                  className="w-40 h-32 rounded shadow border bg-black"
                  title={file.name || file.url}
                />
              )}
            </button>
            <button
              className="mt-2 px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const response = await fetch(file.url);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = file.name || 'download';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch {
                  alert('Failed to download file.');
                }
              }}
              title="Download file"
            >
              Download
            </button>
          </div>
        ))}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close preview"
            >
              &#10005;
            </button>
            <div className="flex items-center justify-center w-full">
              <button
                className="text-2xl px-2 py-1 hover:bg-gray-200 rounded-l"
                onClick={() =>
                  setCurrentIdx((currentIdx - 1 + previewable.length) % previewable.length)
                }
                aria-label="Previous"
              >
                &#8592;
              </button>
              <div className="mx-4 flex flex-col items-center">
                {previewable[currentIdx].type?.startsWith("image") ? (
                  <img
                    src={previewable[currentIdx].url}
                    alt={previewable[currentIdx].name || "Asset image"}
                    className="max-h-[60vh] max-w-[60vw] rounded shadow border"
                  />
                ) : (
                  <video
                    src={previewable[currentIdx].url}
                    controls
                    className="max-h-[60vh] max-w-[60vw] rounded shadow border bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                <button
                  className="mt-4 px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition"
                  onClick={async () => {
                    try {
                      const response = await fetch(previewable[currentIdx].url);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = previewable[currentIdx].name || 'download';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch {
                      alert('Failed to download file.');
                    }
                  }}
                  title="Download file"
                >
                  Download
                </button>
              </div>
              <button
                className="text-2xl px-2 py-1 hover:bg-gray-200 rounded-r"
                onClick={() => setCurrentIdx((currentIdx + 1) % previewable.length)}
                aria-label="Next"
              >
                &#8594;
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-700 text-center">
              {previewable[currentIdx].name || previewable[currentIdx].url}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetPreviewCarousel;
