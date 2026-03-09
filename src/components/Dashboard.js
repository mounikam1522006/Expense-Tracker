import React, { useEffect, useState, useMemo } from "react";
import { getExpenses, addExpense, deleteExpense, updateExpense } from "../lib/api";
import ExpenseForm from "./ExpenseForm";
import BudgetAlert from "./BudgetAlert";
import * as XLSX from "xlsx";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";

const CHART_COLORS = ["#0d9488", "#14b8a6", "#5eead4", "#f59e0b", "#fbbf24", "#6b7280", "#374151", "#111827"];
const CATEGORIES = ["All", "Food & Dining", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

function Dashboard({ user, setUser }) {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [activeView, setActiveView] = useState("list");

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses(user.username);
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing && editing.expenseId) {
        await updateExpense(editing.expenseId, data);
      } else {
        await addExpense(user.username, data);
      }
      setShowForm(false);
      setEditing(null);
      fetchExpenses();
    } catch (err) {
      console.error("Save expense error:", err.response?.status, err.response?.data);
      alert("Failed to save expense: " + (err.response?.data?.message || err.response?.data || err.message || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
    try { await deleteExpense(id); fetchExpenses(); }
    catch { alert("Failed to delete"); }
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filterCategory !== "All" && e.category !== filterCategory) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo && e.date > filterDateTo) return false;
      return true;
    });
  }, [expenses, filterCategory, filterDateFrom, filterDateTo]);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const categoryWise = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const monthlyReport = useMemo(() => {
    const map = {};
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    filtered.forEach((e) => {
      const d = new Date(e.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      map[key] = (map[key] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => {
      const [mA, yA] = a[0].split(" ");
      const [mB, yB] = b[0].split(" ");
      return Number(yA) - Number(yB) || monthNames.indexOf(mA) - monthNames.indexOf(mB);
    });
  }, [filtered]);

  const exportToExcel = () => {
    const data = filtered.map((e) => ({ Date: e.date, Category: e.category, Description: e.description, Amount: e.amount }));
    const catData = categoryWise.map(([cat, amt]) => ({ Category: cat, Total: amt }));
    const monthData = monthlyReport.map(([month, amt]) => ({ Month: month, Total: amt }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Expenses");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(catData), "Category Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthData), "Monthly Report");
    XLSX.writeFile(wb, `expenses_${user.username}.xlsx`);
  };

  const pieData = categoryWise.map(([name, value]) => ({ name, value }));
  const barData = monthlyReport.map(([name, value]) => ({ name, value }));

  const tabStyle = (view) => ({
    flex: 1, padding: 10, borderRadius: 8, fontWeight: "600", border: "none", cursor: "pointer",
    background: activeView === view ? "#fff" : "transparent",
    color: activeView === view ? "#0d9488" : "#888",
    boxShadow: activeView === view ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
  });

  return (
    <div className="dashboard-wrapper">
      <div className="content-container">
        {/* Header */}
        <div className="main-header">
          <div className="user-brand">
            <h1>Expense Tracker</h1>
            <p className="user-email">{user.username}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="logout-btn" onClick={exportToExcel}>📥 Export</button>
            <button className="logout-btn" onClick={() => setUser(null)}>↪ Logout</button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="hero-card">
          <div style={{ fontSize: 16, opacity: 0.9 }}>📉 Total Expenses</div>
          <div className="total-display">₹{total.toFixed(2)}</div>
          <div className="transaction-count">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #f1f5f9", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select className="input-field" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>From</label>
              <input className="input-field" type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>To</label>
              <input className="input-field" type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Budget Alert */}
        <BudgetAlert totalExpense={total} username={user.username} />

        {/* View Tabs */}
        <div className="tab-switcher">
          <button style={tabStyle("list")} onClick={() => setActiveView("list")}>📋 Transactions</button>
          <button style={tabStyle("category")} onClick={() => setActiveView("category")}>📊 Category</button>
          <button style={tabStyle("monthly")} onClick={() => setActiveView("monthly")}>📅 Monthly</button>
          <button style={tabStyle("charts")} onClick={() => setActiveView("charts")}>📈 Charts</button>
        </div>

        {/* Form */}
        {showForm && (
          <ExpenseForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        )}

        {/* Transaction List */}
        {!showForm && activeView === "list" && (
          <>
            {filtered.length === 0 ? (
              <p className="empty-msg">No expenses found.</p>
            ) : (
              filtered.map((exp) => (
                <div className="transaction-card" key={exp.expenseId}>
                  <div>
                    <div className="item-main">
                      <span className="item-amount">₹{exp.amount.toFixed(2)}</span>
                      <span className="item-category">{exp.category}</span>
                    </div>
                    <p className="item-desc">{exp.description}</p>
                    <p className="item-date">{new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="action-icon-btn" onClick={() => { setEditing(exp); setShowForm(true); }}>✏️</button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(exp.expenseId)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Category View */}
        {!showForm && activeView === "category" && (
          <>
            {categoryWise.map(([cat, amt]) => (
              <div className="transaction-card" key={cat}>
                <div>
                  <span style={{ fontWeight: 700 }}>{cat}</span>
                  <p style={{ color: "#888", fontSize: 12 }}>{filtered.filter((e) => e.category === cat).length} transaction(s)</p>
                </div>
                <span style={{ fontWeight: 700 }}>₹{amt.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ background: "#ecfdf5", padding: 20, borderRadius: 16, display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#0d9488" }}>
              <span>Grand Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Monthly View */}
        {!showForm && activeView === "monthly" && (
          <>
            {monthlyReport.map(([month, amt]) => (
              <div className="transaction-card" key={month}>
                <span style={{ fontWeight: 700 }}>{month}</span>
                <span style={{ fontWeight: 700 }}>₹{amt.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ background: "#ecfdf5", padding: 20, borderRadius: 16, display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#0d9488" }}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Charts View */}
        {!showForm && activeView === "charts" && (
          <>
            {pieData.length === 0 ? (
              <p className="empty-msg">No data to chart.</p>
            ) : (
              <>
                <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: "1px solid #f1f5f9", marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Category Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {barData.length > 0 && (
                  <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: "1px solid #f1f5f9", marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Spending</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                        <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* FAB */}
        {!showForm && (
          <button className="fab-btn" onClick={() => { setEditing(null); setShowForm(true); }} style={{ fontSize: 30, fontWeight: 800 }}>+</button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
