import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import API from "../api/axios";
import { SERVER_URL } from '../utils/config'

export default function SignatureEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  const [totalPages, setTotalPages] = useState(1)
const [selectedPage, setSelectedPage] = useState(1)

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState([]);
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [form, setForm] = useState({ signerName: "", signerEmail: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canvasRef = useRef(null);
  const dragRefs = useRef({});

  const pdfUrl = doc ? `${SERVER_URL}/${doc.fileUrl.replace(/\\/g, "/")}` : null;


  useEffect(() => {
  if (!doc || !pdfUrl) return

  let renderTask = null
  let cancelled = false

  const renderPDF = async () => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise
    setTotalPages(pdf.numPages)

    const page = await pdf.getPage(selectedPage)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.current
    if (!canvas || cancelled) return

    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    renderTask = page.render({ canvasContext: context, viewport })
    try {
      await renderTask.promise
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') console.error(err)
    }
  }

  renderPDF()

  return () => {
    cancelled = true
    if (renderTask) renderTask.cancel()
  }
}, [doc, pdfUrl, selectedPage])
  // Fetch document and existing signatures
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, sigRes] = await Promise.all([
          API.get(`/docs/${id}`),
          API.get(`/signatures/${id}`),
        ]);
        setDoc(docRes.data.document);
        setSavedSignatures(sigRes.data.signatures);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Add a new draggable signature placeholder
const addSignaturePlaceholder = () => {
  if (!form.signerName || !form.signerEmail) {
    return setError('Enter signer name and email first')
  }
  setError('')
  const scrollTop = overlayRef.current ? overlayRef.current.scrollTop : 0
  setSignatures(prev => [...prev, {
    tempId: Date.now(),
    signerName: form.signerName,
    signerEmail: form.signerEmail,
    x: 100,
    y: 100 + scrollTop,
    width: 150,
    height: 50,
    page: selectedPage
  }])
}
  // Track position as user drags
const handleDragStop = (tempId, data) => {
  const scrollTop = overlayRef.current ? overlayRef.current.scrollTop : 0
  setSignatures(prev =>
    prev.map(sig =>
      sig.tempId === tempId
        ? { ...sig, x: data.x, y: data.y + scrollTop }
        : sig
    )
  )
}


  // Remove a placeholder before saving
  const removePlaceholder = (tempId) => {
    setSignatures((prev) => prev.filter((sig) => sig.tempId !== tempId));
  };

  // Save all signature positions to backend
  const saveAll = async () => {
    if (signatures.length === 0) {
      return setError("Add at least one signature field");
    }
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        signatures.map((sig) =>
          API.post("/signatures", {
            documentId: id,
            signerName: sig.signerName,
            signerEmail: sig.signerEmail,
            x: sig.x,
            y: sig.y ,
            page: sig.page,
            width: sig.width,
            height: sig.height,
          })
        )
      );
      setSuccess("Signature fields saved successfully ✅");
      setSignatures([]);
      // Refresh saved signatures
      const res = await API.get(`/signatures/${id}`);
      setSavedSignatures(res.data.signatures);
    } catch (err) {
      setError("Failed to save signatures");
    } finally {
      setSaving(false);
    }
  };

  const [generating, setGenerating] = useState(false);

  const generateSignedPdf = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await API.post(`/docs/${id}/generate-signed-pdf`);
      setSuccess("Signed PDF generated! 🎉");
      setDoc(res.data.document);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate signed PDF");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading editor...</p>;
  if (!doc) return <p className="p-8 text-red-500">Document not found</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(`/docs/${id}`)}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Document
        </button>
        <h1 className="font-bold text-gray-800">
          Signature Editor — {doc.title}
        </h1>
        <button
          onClick={saveAll}
          disabled={saving || signatures.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-40"
        >
          {saving ? "Saving..." : `Save ${signatures.length} Field(s)`}
        </button>
        <button
          onClick={generateSignedPdf}
          disabled={generating || savedSignatures.length === 0}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-40 ml-2"
        >
          {generating ? "Generating..." : "🔏 Generate Signed PDF"}
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Left Panel — Controls */}
        <div className="w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-800 mb-4">Add Signer</h3>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            {success && (
              <p className="text-green-600 text-xs mb-3">{success}</p>
            )}
            <input
              type="text"
              placeholder="Signer Name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.signerName}
              onChange={(e) => setForm({ ...form, signerName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Signer Email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.signerEmail}
              onChange={(e) =>
                setForm({ ...form, signerEmail: e.target.value })
              }
            />
            <button
              onClick={addSignaturePlaceholder}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              + Add Signature Field
            </button>
          </div>

          {/* Pending placements */}
          {signatures.length > 0 && (
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-bold text-gray-800 mb-3">Pending Fields</h3>
              <ul className="space-y-2">
                {signatures.map((sig) => (
                  <li
                    key={sig.tempId}
                    className="flex justify-between items-center text-sm text-gray-600 border-b pb-2"
                  >
                    <span>✏️ {sig.signerName}</span>
                    <button
                      onClick={() => removePlaceholder(sig.tempId)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Already saved signatures */}
         {savedSignatures.length > 0 && (
  <div className="bg-white rounded-xl shadow p-5">
    <h3 className="font-bold text-gray-800 mb-3">Saved Fields</h3>
    <ul className="space-y-2">
      {savedSignatures.map(sig => (
        <li key={sig.id} className="text-sm text-gray-600 border-b pb-2">
          <p className="font-medium">{sig.signerName}</p>
          <p className="text-xs text-gray-400">{sig.signerEmail}</p>
          <p className="text-xs text-gray-400">
            Position: ({Math.round(sig.x)}, {Math.round(sig.y)})
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              sig.status === 'signed'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {sig.status}
            </span>
            
            <button
              onClick={async () => {
                await API.delete(`/signatures/${sig.id}`)
                setSavedSignatures(prev => prev.filter(s => s.id !== sig.id))
              }}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}
        </div>

        {/* Right Panel — PDF with draggable overlays */}
        <div className="flex-1">
          <div
            ref={overlayRef}
            className="relative bg-white rounded-xl shadow overflow-auto"
            style={{ height: "750px" }}
          >
            {/* PDF rendered on canvas — allows overlays to work */}
            <canvas ref={canvasRef} className="block" />
            {/* Page Controls */}
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-4 py-2 bg-gray-50 border-t">
    <button
      onClick={() => setSelectedPage(p => Math.max(1, p - 1))}
      disabled={selectedPage === 1}
      className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-40"
    >
      ← Prev
    </button>
    <span className="text-sm text-gray-600">
      Page {selectedPage} of {totalPages}
    </span>
    <button
      onClick={() => setSelectedPage(p => Math.min(totalPages, p + 1))}
      disabled={selectedPage === totalPages}
      className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-40"
    >
      Next →
    </button>
  </div>
)}
            {signatures.map((sig) => {
              if (!dragRefs.current[sig.tempId]) {
                dragRefs.current[sig.tempId] = React.createRef();
              }
              return (
                <Draggable
                  key={sig.tempId}
                  nodeRef={dragRefs.current[sig.tempId]}
                  defaultPosition={{ x: sig.x, y: sig.y }}
                  bounds={null}
                  onStop={(e, data) => handleDragStop(sig.tempId, data)}
                >
                  <div
                    ref={dragRefs.current[sig.tempId]}
                    className="absolute cursor-move select-none"
                    style={{ width: sig.width, zIndex: 50 }}
                  >
                    <div
                      className="border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-80 rounded px-2 py-1 text-xs text-blue-700 font-medium flex items-center justify-between gap-1"
                      style={{ height: sig.height }}
                    >
                      <span>✍️ {sig.signerName}</span>
                      <button
                        onClick={() => removePlaceholder(sig.tempId)}
                        className="text-red-400 hover:text-red-600 font-bold text-xs leading-none"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </Draggable>
              );
            })}

            {/* Show saved signatures as static overlays */}
            {savedSignatures.map((sig) => (
              <div
                key={sig.id}
                className="absolute pointer-events-none"
                style={{
                  left: sig.x,
                  top: sig.y,
                  width: sig.width,
                  height: sig.height,
                  zIndex: 40,
                }}
              >
                <div className="border-2 border-green-400 bg-green-50 bg-opacity-80 rounded px-2 py-1 text-xs text-green-700 font-medium flex items-center gap-1 h-full">
                  ✅ {sig.signerName}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Drag the blue signature fields to position them on the document
          </p>
        </div>
      </div>
    </div>
  );
}
