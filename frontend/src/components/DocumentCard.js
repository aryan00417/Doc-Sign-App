import { useNavigate } from 'react-router-dom'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  signed: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
}

export default function DocumentCard({ doc }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-2xl">📄</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[doc.status]}`}>
          {doc.status.toUpperCase()}
        </span>
      </div>
      <h3 className="font-semibold text-gray-800 truncate">{doc.title}</h3>
      <p className="text-xs text-gray-400">
        {new Date(doc.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })}
      </p>
      <button
        onClick={() => navigate(`/docs/${doc.id}`)}
        className="mt-auto text-sm text-blue-600 hover:underline text-left"
      >
        View & Preview →
      </button>
    </div>
  )
}