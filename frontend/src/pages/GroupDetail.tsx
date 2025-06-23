import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const groupId = parseInt(id || "");
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paid_by: "",
    split_type: "equal",
    splits: "{}",
  });

  const fetchGroup = async () => {
    const res = await API.get(`/groups/${groupId}`);
    setGroup(res.data);
  };

  const fetchExpenses = async () => {
    const res = await API.get(`/groups/${groupId}/expenses`);
    setExpenses(res.data);
  };

  const fetchBalances = async () => {
    const res = await API.get(`/groups/${groupId}/balances`);
    setBalances(res.data);
  };

  useEffect(() => {
    fetchGroup();
    fetchExpenses();
    fetchBalances();
  }, [groupId]);

  const handleAddExpense = async () => {
    const description = form.description.trim();
    const amount = parseFloat(form.amount);
    const paid_by = parseInt(form.paid_by);

    // Validate inputs
    if (!description || isNaN(amount) || isNaN(paid_by)) {
      alert("Please fill out description, amount, and paid_by correctly.");
      return;
    }

    // Prepare splits if needed
    let splitsObj: Record<number, number> | null = null;

    if (form.split_type === "percentage") {
      try {
        const parsed = JSON.parse(form.splits);
        const total = Object.values(parsed).reduce(
          (acc: number, val) => acc + Number(val),
          0
        );

        if (total !== 100) {
          alert("Percentages must add up to 100.");
          return;
        }

        splitsObj = Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [parseInt(k), Number(v)])
        );
      } catch (err) {
        alert("Invalid JSON in splits.");
        return;
      }
    }

    // Send to backend
    try {
      await API.post(`/groups/${groupId}/expenses`, {
        description,
        amount,
        paid_by,
        split_type: form.split_type,
        splits: splitsObj,
      });

      // Reset form + reload expenses and balances
      setForm({
        description: "",
        amount: "",
        paid_by: "",
        split_type: "equal",
        splits: "{}",
      });
      fetchExpenses();
      fetchBalances();
    } catch (err: any) {
      if (err.response) {
        console.error("Error resonse:", err.response.data);
      } else if (err.request) {
        console.error("No response from server: ", err.request);
      } else {
        console.error("unexpected error: ", err.message);
      }
      console.error("Error adding expense:", err);
      alert(err?.response?.data?.detail || "Failed to add expense.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Group: {group?.name}</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Add Expense</h3>
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="border p-1 mr-2"
        />
        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          className="border p-1 mr-2"
          type="number"
        />
        <input
          placeholder="Paid by (user ID)"
          value={form.paid_by}
          onChange={(e) => setForm((f) => ({ ...f, paid_by: e.target.value }))}
          className="border p-1 mr-2"
          type="number"
        />
        <select
          value={form.split_type}
          onChange={(e) =>
            setForm((f) => ({ ...f, split_type: e.target.value }))
          }
          className="border p-1 mr-2"
        >
          <option value="equal">Equal</option>
          <option value="percentage">Percentage</option>
        </select>
        {form.split_type === "percentage" && (
          <input
            placeholder='{"1": 50, "2": 50}'
            value={form.splits}
            onChange={(e) => setForm((f) => ({ ...f, splits: e.target.value }))}
            className="border p-1 mr-2"
          />
        )}
        <button
          onClick={handleAddExpense}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Expenses</h3>
        {expenses.map((exp, i) => (
          <div
            className="bg-white p-3 rounded shadow mb-2 border"
            id={`expense ` + i}
          >
            <div className="font-semibold">{exp.description}</div>
            <div className="text-sm text-gray-600">
              ₹{exp.amount} • Paid by User #{exp.paid_by} • Split:{" "}
              {exp.split_type}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2 text-blue-700">
          Group Balances
        </h3>

        {balances.length === 0 ? (
          <p className="text-gray-500">No balances to show yet.</p>
        ) : (
          <div className="space-y-3">
            {balances.map((balance: any, i: number) => (
              <div
                key={i}
                className="bg-white p-4 rounded shadow border border-gray-200"
              >
                <div className="font-medium text-blue-600 mb-2">
                  User #{balance.user} owes:
                </div>
                {balance.owes.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nothing to anyone.</p>
                ) : (
                  <ul className="list-disc ml-5 text-gray-800 text-sm space-y-1">
                    {balance.owes.map((entry: any, j: number) => (
                      <li key={j}>
                        User #{entry.user} –{" "}
                        <span className="text-red-600 font-semibold">
                          ₹{entry.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
