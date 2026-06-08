import { useState } from 'react'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) {
      return setError('Please provide a title and select a PDF')
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('pdf', file)

    try {
      setLoading(true)
      await API.post('/docs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Document</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Document Title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="pdf-input"
            />
            <label htmlFor="pdf-input" className="cursor-pointer">
              <p className="text-4xl mb-2">📄</p>
              <p className="text-gray-500 text-sm">
                {file ? file.name : 'Click to select a PDF'}
              </p>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-sm text-gray-500 hover:underline w-full text-center"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}