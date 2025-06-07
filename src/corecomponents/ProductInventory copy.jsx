import React, { useState, useEffect } from 'react';
import axios from "axios";

const ProductInventory_old = () => {
  const [cartItems, setCartItems] = useState([]); // To store fetched cart items
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null); // For error handling
  const [loading, setLoading] = useState(true); // State for loading status

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const prodInfoResp = await axios.get("https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?service=productService");
            console.log("product response is ", JSON.stringify(prodInfoResp.data, null, 2));
            setProducts(prodInfoResp.data)
            setLoading(false);
        } catch (err) {
            console.error('Error occurred:', err); // Logs the error object
            console.error('Stack Trace:', err.stack);
            setError(err.message); // Set error state if the request fails
            setLoading(false); // Set loading to false on error
        }
    };
    fetchProducts();
}, []);

if (loading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error}</div>;
}

  return (
    <div>
      <h1>Product Inventory Information</h1>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {(
        <table className="product-inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Inventory Value</th>
              
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productName} >
                <td>{product.productName}</td>
                <td>₹{product.price}</td>
                <td>{product.qty}gms.</td>
                <td>₹{product.price*product.qty/1000}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h4><button className="export">Export Report</button></h4>
    </div>
  );
};

export default ProductInventory_old;
