import React, { useState, useEffect } from 'react';
import axios from "axios"; // <-- Add this import



const ProductInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [newItem, setNewItem] = useState({ productId: '', inventory: {} });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptMsg, setPromptMsg] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(false);

  const API_BASE = 'https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/';

  // Fetch inventory data, also when reloadFlag changes
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/getInventory?service=getInventory`)
      .then((res) => res.json())
      .then((data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        setInventoryData(parsed);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [reloadFlag]);

  const allKeys = Array.from(
    new Set(inventoryData.flatMap(item => Object.keys(item.inventory)))
  );

  const handleInputChange = (productId, key, value) => {
    setInventoryData(prev =>
      prev.map(item =>
        item.productId === productId
          ? {
              ...item,
              inventory: {
                ...item.inventory,
                [key]: value,
              },
            }
          : item
      )
    );
  };

  const handleSave = (item, isNew = false) => {
    setPromptMsg("Are you sure you want to save changes?");
    setShowPrompt(true);
    window._pendingSave = { item, isNew };
  };

  const confirmSave = () => {
    const { item, isNew } = window._pendingSave || {};
    fetch(`${API_BASE}/saveInventory?service=saveInventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
      .then((res) => res.json())
      .then(() => {
        setPromptMsg('Saved successfully');
        setTimeout(() => setShowPrompt(false), 1200);
        setReloadFlag(flag => !flag); // <-- Only reload inventory data, not the whole page
        if (isNew) {
          setNewItem({ productId: '', inventory: {} });
        }
      })
      .catch((err) => {
        setPromptMsg('Save failed');
        setTimeout(() => setShowPrompt(false), 1200);
      });
    window._pendingSave = null;
  };

  // Show confirmation prompt before delete
  const handleDelete = (productId) => {
    setPromptMsg("Are you sure you want to delete this item?");
    setShowPrompt(true);
    setPendingDelete(productId);
  };

  const confirmDelete = () => {
    fetch(`${API_BASE}/deleteInventory?service=deleteInventory&productId=${pendingDelete}`, {
      method: 'DELETE',
    })
      .then(() => {
        setPromptMsg('Deleted successfully!');
        setTimeout(() => setShowPrompt(false), 1200);
        setInventoryData(prev => prev.filter(item => item.productId !== pendingDelete));
      })
      .catch((err) => {
        setPromptMsg('Delete failed');
        setTimeout(() => setShowPrompt(false), 1200);
        console.error('Delete error:', err);
      });
    setPendingDelete(null);
  };

  const handleAddNew = () => {
    if (!newItem.productId) return alert('Product ID is required');
    handleSave(newItem, true); // Pass a flag to indicate it's a new item
  };

  const handleNewItemChange = (key, value) => {
    setNewItem((prev) => ({
      ...prev,
      inventory: { ...prev.inventory, [key]: value },
    }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Inventory Management</h2>

      {showPrompt && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: 24,
            borderRadius: 8,
            minWidth: 320,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)"
          }}>
            <h5 style={{ marginBottom: 12 }}>{promptMsg}</h5>
            {promptMsg.startsWith("Are you sure you want to save") && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={confirmSave}
                  style={{
                    background: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    marginRight: 8
                  }}
                >
                  Yes, Save
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  style={{
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            {promptMsg.startsWith("Are you sure you want to delete") && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={confirmDelete}
                  style={{
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    marginRight: 8
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => { setShowPrompt(false); setPendingDelete(null); }}
                  style={{
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Product ID</th>
            {allKeys.map((key) => (
              <th key={key}>{key}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item) => (
            <tr key={item.productId}>
              <td>{item.productId}</td>
              {allKeys.map((key) => (
                <td key={key}>
                  <input
                    value={item.inventory[key] || ''}
                    onChange={(e) => handleInputChange(item.productId, key, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <button type="button" onClick={() => handleSave(item)}>💾</button>{' '}
                <button type="button" onClick={() => handleDelete(item.productId)}>❌</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input
                placeholder="New Product ID"
                value={newItem.productId}
                onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
              />
            </td>
            {allKeys.map((key) => (
              <td key={key}>
                <input
                  placeholder={key}
                  value={newItem.inventory[key] || ''}
                  onChange={(e) => handleNewItemChange(key, e.target.value)}
                />
              </td>
            ))}
            <td>
              <button onClick={handleAddNew}>➕ Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default ProductInventory;
