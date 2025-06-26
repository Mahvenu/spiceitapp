import React, { useState, useEffect } from "react";

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

const DeleteIcon = ({ onClick, disabled }) => (
    <span
        onClick={disabled ? undefined : onClick}
        style={{
            cursor: disabled ? "not-allowed" : "pointer",
            marginLeft: 8,
            color: "#dc3545",
            fontSize: "1.1em",
            verticalAlign: "middle",
            opacity: disabled ? 0.5 : 1
        }}
        title="Delete"
    >
        <svg width="16" height="16" fill="currentColor" style={{marginBottom: 2}} viewBox="0 0 16 16">
            <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0v-6zm2 .5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zm-3-1a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V4h3V2zm-7 2v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z"/>
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
        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.pincode) {
            setError("All fields are required.");
            return;
        }
        setError("");
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

    const handleDelete = id => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            setCustomers(customers.filter(c => c.id !== id));
            // Optionally, call an API to delete customer here
        }
    };

    const handleEditClick = (idx, c) => {
        setEditIdx(idx);
        setEditCustomer({ ...c });
    };

    const handleEditChange = e => {
        setEditCustomer({ ...editCustomer, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = idx => {
        // Optionally, call an API to update customer here
        setCustomers(customers.map((c, i) => (i === idx ? { ...editCustomer } : c)));
        setEditIdx(null);
        setEditCustomer({});
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
                                        <DeleteIcon
                                            onClick={() => handleDelete(c.id)}
                                            disabled={editIdx === idx}
                                        />
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
        </div>
    );
}