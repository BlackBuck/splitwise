import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Home() {
  const [groupName, setGroupName] = useState('')
  const [userIds, setUserIds] = useState('1,2,3')
  const [groups, setGroups] = useState<any[]>([])
  const navigate = useNavigate()

  const fetchGroups = async () => {
    const ids = [1, 2, 3] // example, since we lack a group listing API
    const fetched = await Promise.all(ids.map(id => API.get(`/groups/${id}`).then(r => r.data).catch(() => null)))
    setGroups(fetched.filter(Boolean))
  }

  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async () => {
    const res = await API.post('/groups', {
      name: groupName,
      user_ids: userIds.split(',').map(Number)
    })
    navigate(`/group/${res.data.id}`)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Create Group</h2>
      <input value={groupName} onChange={e => setGroupName(e.target.value)} className="border p-1 mr-2" placeholder="Group name" />
      <input value={userIds} onChange={e => setUserIds(e.target.value)} className="border p-1 mr-2" placeholder="User IDs (comma-separated)" />
      <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your Groups</h2><hr></hr>
      <div className="space-y-3">
        {groups.map(group => (
            <div
            key={group.id}
            onClick={() => navigate(`/group/${group.id}`)}
            className="cursor-pointer bg-white p-4 rounded-lg shadow hover:shadow-md border border-gray-200 hover:border-blue-400 transition"
            >
            <div className="text-lg font-semibold text-blue-700">{group.name}</div>
            <div className="text-sm text-gray-600">Group ID: {group.id}</div>
            </div>
        ))}
        </div>

    </div>
  )
}
