import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Add a prop for all reviews and user info if needed
export default function ReviewProduct({ order, allReviews = [], user }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [userReviews, setUserReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Filter reviews for this user and order if allReviews and user are provided
        if (allReviews && user) {
            const filtered = allReviews.filter(
                r => r.userId === user.id && (!order || r.orderId === (order.orderId || order.id))
            );
            setUserReviews(filtered);
        }
    }, [allReviews, user, order]);

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
        <div className="container my-5" style={{ maxWidth: 700 }}>
            <h2 className="mb-4">
                <span>Rate</span> & Review
            </h2>
            {/* Show all order details for the selected order */}
            {order && (
                <div style={{ background: "#f8f9fa", border: "1px solid", borderRadius: 6, padding: 12, marginBottom: 18 }}>
                    <div><strong>Order ID:</strong> {order.orderId || order.id}</div>
                    <div><strong>Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-GB") : "-"}</div>
                    <div>
                        <strong>Items:</strong>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {order.orderItems?.map((item, i) => (
                                <li key={i}>
                                    {item.count} {item.name} ({item.size || item.quantity || item.qty || "-"})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div><strong>Delivery Mode:</strong> {order.deliveryMode || "-"}</div>
                    <div><strong>Delivery Address:</strong> {order.deliveryAddress || "-"}</div>
                    <div><strong>Order Status:</strong> {order.status || "-"}</div>
                </div>
            )}

            {/* Show previous feedback for this order by the signed-in user */}
            {userReviews.length > 0 && (
                <div style={{ background: "#e9f7ef", border: "1px solid #b2dfdb", borderRadius: 6, padding: 12, marginBottom: 18 }}>
                    <strong>Your Previous Feedback:</strong>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {userReviews.map((r, i) => (
                            <li key={i}>
                                <span style={{ color: "#ffc107" }}>{"★".repeat(r.rating)}</span>
                                <span style={{ marginLeft: 8 }}>{r.review}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Feedback form */}
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