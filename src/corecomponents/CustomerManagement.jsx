import React, { useState, useEffect } from "react";

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", pincode: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                // Optionally, you can get the new customer from response and add it, or just refetch
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
        setCustomers(customers.filter(c => c.id !== id));
        // Optionally, call an API to delete customer here
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
                                    <td>{c.firstName}</td>
                                    <td>{c.lastName}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.address}</td>
                                    <td>{c.pincode}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            Delete
                                        </button>
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