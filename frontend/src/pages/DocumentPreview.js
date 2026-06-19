import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SERVER_URL } from '../utils/config'

import API from "../api/axios";

export default function DocumentPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false)
const [emailForm, setEmailForm] = useState({
  senderEmail: '',
  senderPassword: '',
  receiverEmail: '',
  receiverName: ''
})
const [emailStatus, setEmailStatus] = useState('')
const [emailError, setEmailError] = useState('')
const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await API.get(`/docs/${id}`);
        setDoc(res.data.document);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);
const handleSendForReview = async () => {
  setSendingEmail(true)
  setEmailError('')
  setEmailStatus('')
  try {
    await API.post('/sign/send', {
      documentId: doc.id,
      ...emailForm
    })
    setEmailStatus('Review request sent successfully! ✅')
    setShowEmailModal(false)
  } catch (err) {
    setEmailError(err.response?.data?.message || 'Failed to send email')
  } finally {
    setSendingEmail(false)
  }
}
  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (!doc) return <p className="p-8 text-red-500">Document not found</p>;

  const pdfUrl = `${SERVER_URL}/${doc.fileUrl.replace(/\\/g, "/")}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Dashboard
        </button>
        <h1 className="font-bold text-gray-800">{doc.title}</h1>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
  doc.status === 'approved' ? 'bg-green-100 text-green-700' :
  doc.status === 'signed' ? 'bg-blue-100 text-blue-700' :
  doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
  'bg-yellow-100 text-yellow-700'
}`}
        >
          {doc.status.toUpperCase()}
        </span>
        <button
          onClick={() => navigate(`/docs/${doc.id}/editor`)}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
        >
          ✍️ Add Signatures
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
  {/* PDF Preview */}
  <div className="bg-white rounded-xl shadow p-4 mb-6">
    <iframe
      src={pdfUrl}
      title="PDF Preview"
      className="w-full h-[600px] rounded"
    />
  </div>

  {/* Signed PDF Download */}
  {doc.signedFileUrl && (
    <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center justify-between">
      <p className="text-sm text-gray-600">✅ Signed version available</p>
      <a
        href={`${SERVER_URL}/${doc.signedFileUrl.replace(/\\/g, "/")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
      >
        📥 Download Signed PDF
      </a>
    </div>
  )}
        

        {/* Audit Log */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">Audit Trail</h3>
          {doc.auditLogs.length === 0 ? (
            <p className="text-gray-400 text-sm">No audit logs yet</p>
          ) : (
            <ul className="space-y-2">
              {doc.auditLogs.map((log) => (
                <li
                  key={log.id}
                  className="text-sm text-gray-600 flex justify-between border-b pb-2"
                >
                  <span>🔹 {log.action}</span>
                  <span className="text-gray-400">
                    {new Date(log.timestamp).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Send for Review Button — only shows after signed */}
{doc.status === 'signed' && (
  <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center justify-between">
    <p className="text-sm text-gray-600">📨 Ready to send for review</p>
    <button
      onClick={() => setShowEmailModal(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
    >
      Send for Review
    </button>
  </div>
)}

{emailStatus && (
  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
    <p className="text-green-700 text-sm">{emailStatus}</p>
  </div>
)}

{/* Email Modal */}
{showEmailModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Send Document for Review</h3>

      {emailError && (
        <p className="text-red-500 text-sm mb-4">{emailError}</p>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 font-medium">Your Gmail</label>
          <input
            type="email"
            placeholder="your.email@gmail.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={emailForm.senderEmail}
            onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 font-medium">Gmail App Password</label>
          <input
            type="password"
            placeholder="16-character app password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={emailForm.senderPassword}
            onChange={(e) => setEmailForm({ ...emailForm, senderPassword: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">Get this from Google Account → Security → App Passwords</p>
        </div>
        <div>
          <label className="text-sm text-gray-600 font-medium">Reviewer's Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={emailForm.receiverName}
            onChange={(e) => setEmailForm({ ...emailForm, receiverName: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 font-medium">Reviewer's Email</label>
          <input
            type="email"
            placeholder="reviewer@email.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={emailForm.receiverEmail}
            onChange={(e) => setEmailForm({ ...emailForm, receiverEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSendForReview}
          disabled={sendingEmail}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {sendingEmail ? 'Sending...' : 'Send Review Request'}
        </button>
        <button
          onClick={() => {
            setShowEmailModal(false)
            setEmailError('')
          }}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
