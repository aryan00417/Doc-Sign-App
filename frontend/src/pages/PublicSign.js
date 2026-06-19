import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function PublicSign() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const sigId = searchParams.get('sigId')

  const [doc, setDoc] = useState(null)
  const [signature, setSignature] = useState(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null) // 'signed' or 'rejected'
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sign/${token}?sigId=${sigId}`)
        setDoc(res.data.document)
        setSignature(res.data.signature)
      } catch (err) {
        setError('Invalid or expired signing link')
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [token, sigId])

  const handleRespond = async (responseAction) => {
    try {
      await axios.post(`http://localhost:5000/api/sign/${token}/respond`, {
        sigId,
        action: responseAction,
        reason: responseAction === 'rejected' ? reason : null
      })
      setAction(responseAction)
      setDone(true)
    } catch (err) {
      setError('Failed to submit response')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading document...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-10 text-center max-w-md">
        <p className="text-5xl mb-4">{action === 'signed' ? '✅' : '❌'}</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {action === 'signed' ? 'Document Signed!' : 'Document Rejected'}
        </h2>
        <p className="text-gray-500">
          {action === 'signed'
            ? 'Thank you. The sender has been notified.'
            : 'You have rejected this document. The sender has been notified.'}
        </p>
      </div>
    </div>
  )

  const pdfUrl = doc.signedFileUrl
  ? `http://localhost:5000/${doc.signedFileUrl.replace(/\\/g, '/')}`
  : `http://localhost:5000/${doc.fileUrl.replace(/\\/g, '/')}`

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">✍️ DocuSign App</h1>
        <p className="text-sm text-gray-600">
          Signing request for: <strong>{doc.title}</strong>
        </p>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Signer Info */}
        {signature && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              Hi <strong>{signature.signerName}</strong> — you have been requested to sign this document.
            </p>
          </div>
        )}

        {/* PDF Preview */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <iframe
            src={pdfUrl}
            title="Document"
            className="w-full h-[600px] rounded"
          />
        </div>

        {/* Sign or Reject */}
        {signature?.status === 'pending' ? (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-800 mb-4">Your Response</h3>

            {action === null && (
              <div className="flex gap-4">
                <button
  onClick={() => handleRespond('signed')}
  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
>
  ✅ Approve Document
</button>
<button
  onClick={() => setAction('rejecting')}
  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
>
  ❌ Reject Document
</button>
              </div>
            )}

            {action === 'rejecting' && (
              <div className="space-y-3">
                <textarea
                  placeholder="Reason for rejection (optional)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRespond('rejected')}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setAction(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center">
    <p className="text-gray-500">
      {signature 
        ? `This signature request has already been ${signature.status}.`
        : 'Please review the document above and respond below.'
      }
    </p>
    {!signature && (
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => handleRespond('signed')}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          ✅ Approve Document
        </button>
        <button
          onClick={() => setAction('rejecting')}
          className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
        >
          ❌ Reject Document
        </button>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  )
}