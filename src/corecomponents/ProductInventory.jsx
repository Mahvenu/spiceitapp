import React, { useState, useEffect } from 'react';

const ProductInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const apiUrl = 'https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?service=productInventory';
  const API_URL = 'https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/getInventory?service=inventory';

  
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        // Parse if it's a stringified array
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        setInventoryData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (inventoryData.length === 0) return <p>No data available.</p>;

  // Collect all unique keys across all inventory objects
  const allKeys = Array.from(
    new Set(inventoryData.flatMap(item => Object.keys(item.inventory)))
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Inventory Table</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Product ID</th>
            {allKeys.map(key => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item, index) => (
            <tr key={index}>
              <td>{item.productId}</td>
              {allKeys.map(key => (
                <td key={key}>
                  {item.inventory[key] !== undefined ? item.inventory[key].toString() : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ProductInventory;
