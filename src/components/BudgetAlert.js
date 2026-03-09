import React, { useState, useEffect } from "react";

function BudgetAlert({ totalExpense, username }) {
  const [budget, setBudget] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`budget_${username}`);
    if (saved) setBudget(parseFloat(saved));
  }, [username]);

  const handleSave = () => {
    const value = parseFloat(tempBudget);
    if (value > 0) {
      setBudget(value);
      localStorage.setItem(`budget_${username}`, value.toString());
      setIsEditing(false);
      setTempBudget("");
    }
  };

  const percentage = budget > 0 ? (totalExpense / budget) * 100 : 0;
  const isOverBudget = percentage > 100;
  const isNearLimit = percentage > 80 && percentage <= 100;

  if (!budget && !isEditing) {
    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #eee", marginBottom: 20 }}>
        <p>Set a monthly budget to track your spending</p>
        <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ marginTop: 8 }}>💰 Set Budget</button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #eee", marginBottom: 20 }}>
        <p><strong>Set Monthly Budget</strong></p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input type="number" placeholder="Enter amount" value={tempBudget} onChange={(e) => setTempBudget(e.target.value)} className="input-field" style={{ flex: 1 }} />
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
        </div>
      </div>
    );
  }

  const color = isOverBudget ? "#ef4444" : isNearLimit ? "#eab308" : "#22c55e";

  return (
    <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${color}40`, background: `${color}10`, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{isOverBudget ? "⚠️ Over Budget!" : isNearLimit ? "⚡ Near Limit" : "✅ On Track"}</strong>
        <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Edit</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
          <span>₹{totalExpense.toFixed(2)} spent</span>
          <span>₹{budget.toFixed(2)} budget</span>
        </div>
        <div style={{ width: "100%", background: "#eee", borderRadius: 10, height: 10 }}>
          <div style={{ width: `${Math.min(percentage, 100)}%`, background: color, height: 10, borderRadius: 10, transition: "all 0.3s" }} />
        </div>
        <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          {percentage.toFixed(1)}% of budget used
          {!isOverBudget && ` • ₹${(budget - totalExpense).toFixed(2)} remaining`}
        </p>
      </div>
    </div>
  );
}

export default BudgetAlert;
