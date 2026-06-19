import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/DocumentCard'

const STATUS_FILTERS = ['all', 'pending', 'signed', 'approved', 'rejected']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await API.get('/docs')
        setDocuments(res.data.documents)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = filter === 'all'
    ? documents
    : documents.filter(d => d.status === filter)

  const counts = {
  all: documents.length,
  pending: documents.filter(d => d.status === 'pending').length,
  signed: documents.filter(d => d.status === 'signed').length,
  approved: documents.filter(d => d.status === 'approved').length,
  rejected: documents.filter(d => d.status === 'rejected').length,
}

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">✍️ DocuSign App</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👋 {user?.name}</span>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + Upload PDF
          </button>
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: counts.all, color: 'blue' },
            { label: 'Pending', count: counts.pending, color: 'yellow' },
            { label: 'Signed', count: counts.signed, color: 'green' },
            { label: 'Rejected', count: counts.rejected, color: 'red' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{count}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {s} ({counts[s] ?? documents.length})
            </button>
          ))}
        </div>

        {/* Document Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Documents</h2>
        {loading ? (
          <p className="text-gray-500">Loading documents...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-lg">No {filter !== 'all' ? filter : ''} documents yet</p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Upload your first PDF
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}