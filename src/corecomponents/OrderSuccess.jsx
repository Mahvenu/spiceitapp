import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderSuccess() {
    const navigate = useNavigate();
    useEffect(() => {
    const timer = setTimeout(() => {
        navigate("/");
    }, 2000); // Redirect after 2 seconds
    return () => clearTimeout(timer);
}, [navigate]);
    

    return (
        <div className="container my-4" style={{ maxWidth: 600, textAlign: "center", marginTop: 80 }}>
            <h2 className="mb-3" style={{ color: "#28a745", fontWeight: 600 }}>Order Placed Successfully!</h2>
            <div style={{ fontSize: "1.2rem", color: "#555" }}>
                Thank you for your order.<br />
                You will be redirected to the home page shortly.
            </div>
        </div>
    );
}