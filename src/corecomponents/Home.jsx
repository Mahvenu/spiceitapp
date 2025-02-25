import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import '../customstyles/spiceprod.css'
export default function Home() {
    const [products, setProducts] = useState([]); // State to store product data
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for errors

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const prodInfoResp = await axios.get("https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?productName=chillipowder");
                console.log("product response is ", prodInfoResp.data);
                const jsonResp = JSON.parse(prodInfoResp.data)
                setProducts(jsonResp);
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
        <div className="product-list">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loop through the products and display them in the table */}
                    {products.map((product) => (
                        <tr key={product.productName}>
                            <td>{product.productName}</td>
                            <td>{product.qty}</td>
                            <td>${product.price.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};