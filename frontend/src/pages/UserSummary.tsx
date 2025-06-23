import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import API from "../api"

export default function UserSummary() {
  const { id } = useParams<{ id: string }>()
  const [balances, setBalances] = useState<any[]>([])

  useEffect(() => {
    API.get(`/users/${id}/balances`).then(res => setBalances(res.data))
  }, [id])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Personal Balance Summary</h2>
      {balances.length === 0 ? (
        <p className="text-gray-500">You have no outstanding balances.</p>
      ) : (
        <div className="space-y-3">
          {balances.map((entry, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded shadow border border-gray-200"
            >
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-blue-700">{entry.group}</span>
              </div>
              <div className="text-gray-800">
                {entry.to
                  ? <>You owe <strong>User #{entry.to}</strong> ₹{entry.amount}</>
                  : <>User <strong>#{entry.from}</strong> owes you ₹{entry.amount}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
