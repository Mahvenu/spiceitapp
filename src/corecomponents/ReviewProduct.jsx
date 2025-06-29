import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReviewProduct({ order }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !review.trim()) {
            setError("Please provide a rating and review.");
            return;
        }
        setError("");
        try {
            // await fetch("/api/saveReview", { ... });
            setSuccess("Thank you for your feedback!");
            setTimeout(() => navigate("/userinfo"), 1500);
        } catch {
            setError("Failed to submit review. Please try again.");
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: 500 }}>
            <h2 className="mb-4">Rate &amp; Review Product</h2>
            {order && (
                <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 6, padding: 12, marginBottom: 18 }}>
                    <div><strong>Order ID:</strong> {order.orderId || order.id}</div>
                    <div><strong>Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-GB") : "-"}</div>
                    <div>
                        <strong>Items:</strong>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {order.orderItems?.map((item, i) => (
                                <li key={i}>
                                    {item.name} ({item.size || item.quantity || item.qty || "-"}) x {item.count}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", borderRadius: 8, padding: 24, border: "1px solid #eee" }}>
                <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 500 }}>Your Rating:</label>
                    <div>
                        {[1, 2, 3, 4, 5].map(num => (
                            <span
                                key={num}
                                style={{
                                    cursor: "pointer",
                                    color: num <= rating ? "#ffc107" : "#ccc",
                                    fontSize: "2rem",
                                    marginRight: 4
                                }}
                                onClick={() => setRating(num)}
                                aria-label={`Rate ${num} star${num > 1 ? "s" : ""}`}
                            >★</span>
                        ))}
                    </div>
                </div>
                <div className="mb-3">
                    
                    <textarea
                        className="form-control"
                        rows={4}
                        value={review}
                        onChange={e => setReview(e.target.value)}
                        placeholder="Share your experience..."
                        required
                    />
                </div>
                {error && <div className="alert alert-danger py-1">{error}</div>}
                {success && <div className="alert alert-success py-1">{success}</div>}
                <div className="d-flex justify-content-between">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/userinfo")}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Submit Review
                    </button>
                </div>
            </form>
        </div>
    );
}