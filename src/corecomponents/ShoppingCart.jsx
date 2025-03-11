import React, { useState, useEffect } from 'react';

const ProductInventory = () => {
  const [cartItems, setCartItems] = useState([]); // To store fetched cart items
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    // Assuming you have a cart API endpoint returning JSON data
    const apiUrl = 'https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?service=productInventory';

    // Fetch shopping cart data
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON data from response
      })
      .then((data) => {
        setCartItems(data); // Assuming data.items is an array of cart items
      })
      .catch((err) => {
        setError(err.message); // Handle any error
      });
  }, []); // Run only once on mount

  return (
    <div>
      <h1>Your Shopping Cart</h1>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table className="shopping-cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Inventory Value</th>
              
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>₹{item.unitPrice}</td>
                <td>{item.qyt}</td>
                <td>₹{item.inventoryValue}</td> {/* Total price */}
               
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductInventory;
