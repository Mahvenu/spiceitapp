import React, { useState, useEffect } from "react";
import axios from "axios"; // <-- Add this import

if (!window.__axios_refresh_interceptor_set) {
    axios.interceptors.response.use(
        response => {
            const method = response.config?.method?.toLowerCase();
            if (["put", "post", "delete"].includes(method)) {
                window.location.href = window.location.pathname;
            }
            return response;
        },
        error => {
            const method = error.config?.method?.toLowerCase();
            if (["put", "post", "delete"].includes(method)) {
                window.location.href = window.location.pathname;
            }
            return Promise.reject(error);
        }
    );
    window.__axios_refresh_interceptor_set = true;
}

const EditIcon = ({ onClick }) => (
    <span
        onClick={onClick}
        style={{
            cursor: "pointer",
            marginLeft: 8,
            color: "#007bff",
            fontSize: "1.1em",
            verticalAlign: "middle"
        }}
        title="Edit"
    >
        <svg width="16" height="16" fill="currentColor" style={{marginBottom: 2}} viewBox="0 0 16 16">
            <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.439 9.439a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l9.439-9.439zm.708-.708a1.5 1.5 0 0 0-2.121 0l-9.439 9.439a1.5 1.5 0 0 0-.329.504l-1.5 4a1.5 1.5 0 0 0 1.95 1.95l4-1.5a1.5 1.5 0 0 0 .504-.329l9.439-9.439a1.5 1.5 0 0 0 0-2.121l-2.292-2.292z"/>
        </svg>
    </span>
);

const SaveIcon = ({ onClick }) => (
    <span
        onClick={onClick}
        style={{
            cursor: "pointer",
            marginLeft: 8,
            color: "#28a745",
            fontSize: "1.1em",
            verticalAlign: "middle"
        }}
        title="Save"
    >
        <svg width="16" height="16" fill="currentColor" style={{marginBottom: 2}} viewBox="0 0 16 16">
            <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4.414A2 2 0 0 0 15.414 3L13 0.586A2 2 0 0 0 11.586 0H2zm10 1.5V4a1 1 0 0 0 1 1h2.5L12 1.5zM2 2h9.586A1 1 0 0 1 13 2.414V5a2 2 0 0 1-2 2H2V2zm0 12a1 1 0 0 1-1-1V8h12v5a1 1 0 0 1-1 1H2z"/>
            <path d="M10.854 7.146a.5.5 0 0 0-.708 0L7.5 9.793 6.354 8.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0 0-.708z"/>
        </svg>
    </span>
);

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", pincode: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [editIdx, setEditIdx] = useState(null);
    const [editCustomer, setEditCustomer] = useState({});
    const [showEditPrompt, setShowEditPrompt] = useState(false);
    const [pendingEditIdx, setPendingEditIdx] = useState(null);

    // Fetch customers on mount
    useEffect(() => {
        setLoading(true);
        fetch("https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/getCustomerDetails?service=getCustomer")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCustomers(data);
                } else if (Array.isArray(data.customers)) {
                    setCustomers(data.customers);
                } else {
                    setCustomers([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setCustomers([]);
                setLoading(false);
            });
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = async e => {
        e.preventDefault();
        setError("");
        // Check if phone number already exists
        const phoneExists = customers.some(
            c => c.phone && c.phone.trim() === form.phone.trim()
        );
        if (phoneExists) {
            setError("A customer with this phone number already exists.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/saveCustomerDetails?service=saveCustomer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (response.ok) {
                setCustomers(prev => [
                    ...prev,
                    { id: Date.now(), ...form }
                ]);
                setForm({ firstName: "", lastName: "", email: "", phone: "", address: "", pincode: "" });
            } else {
                setError("Failed to save customer.");
            }
        } catch {
            setError("Failed to save customer.");
        }
        setLoading(false);
    };

    const handleEditClick = (idx, c) => {
        setEditIdx(idx);
        setEditCustomer({ ...c });
    };

    const handleEditChange = e => {
        setEditCustomer({ ...editCustomer, [e.target.name]: e.target.value });
    };

    // Show confirmation prompt before saving edit
    const handleSaveEdit = idx => {
        setPendingEditIdx(idx);
        setShowEditPrompt(true);
    };

    const confirmSaveEdit = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/saveCustomerDetails?service=saveCustomer",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editCustomer)
                }
            );
            if (response.ok) {
                setCustomers(customers.map((c, i) => (i === pendingEditIdx ? { ...editCustomer } : c)));
                setEditIdx(null);
                setEditCustomer({});
                setShowEditPrompt(false);
                setPendingEditIdx(null);
            } else {
                // Optionally show error
            }
        } catch {
            // Optionally show error
        }
        setLoading(false);
    };

    const cancelSaveEdit = () => {
        setShowEditPrompt(false);
        setPendingEditIdx(null);
    };

    return (
        <div className="container my-4">
            <h2>Customer Management</h2>
            <form className="row g-3 mb-4" onSubmit={handleAdd}>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        name="address"
                        placeholder="Address"
                        value={form.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-1">
                    <input
                        type="text"
                        className="form-control"
                        name="pincode"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-1">
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>Add</button>
                </div>
                {error && (
                    <div className="col-12">
                        <div className="alert alert-danger py-1 my-1">{error}</div>
                    </div>
                )}
            </form>
            <div className="table-responsive">
                <table className="table table-striped align-middle text-center">
                    <thead style={{ backgroundColor: "#e9ecef" }}>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Pincode</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center">Loading...</td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">No customers found.</td>
                            </tr>
                        ) : (
                            customers.map((c, idx) => (
                                <tr key={c.id || idx}>
                                    <td>
                                        {editIdx === idx ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="firstName"
                                                value={editCustomer.firstName}
                                                onChange={handleEditChange}
                                            />
                                        ) : c.firstName}
                                    </td>
                                    <td>
                                        {editIdx === idx ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="lastName"
                                                value={editCustomer.lastName}
                                                onChange={handleEditChange}
                                            />
                                        ) : c.lastName}
                                    </td>
                                    <td>
                                        {editIdx === idx ? (
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={editCustomer.email}
                                                onChange={handleEditChange}
                                            />
                                        ) : c.email}
                                    </td>
                                    <td>
                                        {editIdx === idx ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="phone"
                                                value={editCustomer.phone}
                                                onChange={handleEditChange}
                                            />
                                        ) : c.phone}
                                    </td>
                                    <td>
                                        {editIdx === idx ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="address"
                                                value={editCustomer.address}
                                                onChange={handleEditChange}
                                            />
                                        ) : c.address}
                                    </td>
                                    <td>
                                        {editIdx === idx ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="pincode"
                                                value={editCustomer.pincode}
                                                onChange={handleEditChange}
                                            />
                                        ) : c.pincode}
                                    </td>
                                    <td>
                                        {editIdx === idx ? (
                                            <SaveIcon onClick={() => handleSaveEdit(idx)} />
                                        ) : (
                                            <EditIcon onClick={() => handleEditClick(idx, c)} />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Confirmation Prompt for Edit */}
            {showEditPrompt && (
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
                        <h5 style={{ marginBottom: 12 }}>Are you sure you want to save these changes?</h5>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button className="btn btn-secondary" onClick={cancelSaveEdit}>No</button>
                            <button className="btn btn-primary" onClick={confirmSaveEdit}>Yes, Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}