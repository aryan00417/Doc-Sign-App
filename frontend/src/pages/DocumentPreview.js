import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function DocumentPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await API.get(`/docs/${id}`)
        setDoc(res.data.document)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [id])

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>
  if (!doc) return <p className="p-8 text-red-500">Document not found</p>

  const pdfUrl = `http://localhost:5000/${doc.fileUrl.replace(/\\/g, '/')}`

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </button>
        <h1 className="font-bold text-gray-800">{doc.title}</h1>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          doc.status === 'signed' ? 'bg-green-100 text-green-700' :
          doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {doc.status.toUpperCase()}
        </span>
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

        {/* Audit Log */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">Audit Trail</h3>
          {doc.auditLogs.length === 0 ? (
            <p className="text-gray-400 text-sm">No audit logs yet</p>
          ) : (
            <ul className="space-y-2">
              {doc.auditLogs.map((log) => (
                <li key={log.id} className="text-sm text-gray-600 flex justify-between border-b pb-2">
                  <span>🔹 {log.action}</span>
                  <span className="text-gray-400">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}