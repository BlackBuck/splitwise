import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import GroupDetail from './pages/GroupDetail'
import UserSummary from './pages/UserSummary'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname.startsWith('/user') ? 'summary' : 'groups'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">💸 Splitwise Clone</h1>

        <div className="mb-6 border-b border-gray-300">
          <nav className="flex space-x-4">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                current === 'groups'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => navigate('/')}
            >
              Groups
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                current === 'summary'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => navigate('/user/1')}
            >
              Your Summary
            </button>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/user/:id" element={<UserSummary />} />
        </Routes>
      </div>
    </div>
  )
}
