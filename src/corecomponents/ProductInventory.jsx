import React, { useState, useEffect } from 'react';

const ProductInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [newItem, setNewItem] = useState({ productId: '', inventory: {} });
  const [loading, setLoading] = useState(true);
  // const apiUrl = 'https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?service=productInventory';
  const API_URL = 'https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/getInventory?service=inventory';
  const API_BASE = 'https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/';

  useEffect(() => {
    fetch(`${API_BASE}/getInventory?service=getInventory`)
    .then((res) => res.json())
    .then((data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setInventoryData(parsed);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Error fetching inventory:', err);
      setLoading(false);
    });
}, []);

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

const handleSave = (item) => {
  fetch(`${API_BASE}/saveInventory?service=saveInventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
    .then((res) => res.json())
    .then(() => alert('Saved successfully!'))
    .catch((err) => console.error('Save error:', err));
};

const handleDelete = (productId) => {
  fetch(`${API_BASE}/deleteInventory?service=deleteInventory&productId=${productId}`, {
    method: 'DELETE',
  })
    .then(() => {
      setInventoryData(prev => prev.filter(item => item.productId !== productId));
    })
    .catch((err) => console.error('Delete error:', err));
};

const handleAddNew = () => {
  if (!newItem.productId) return alert('Product ID is required');
  setInventoryData([...inventoryData, newItem]);
  setNewItem({ productId: '', inventory: {} });
  handleSave(newItem);
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
              <button onClick={() => handleSave(item)}>💾 Save</button>{' '}
              <button onClick={() => handleDelete(item.productId)}>❌ Delete</button>
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
