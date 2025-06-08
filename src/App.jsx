import { useState } from 'react';
import './App.css';
import './customstyles/spicenav.css';
import Home from './corecomponents/Home';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ContactUs from './corecomponents/ContactUs';
import AboutUs from './corecomponents/AboutUs';
import ProductInventory from './corecomponents/ProductInventory';
import ShoppingCart from './corecomponents/ShoppingCart';
import OrderPlacement from './corecomponents/OrderPlacement';
import CustomerManagement from './corecomponents/CustomerManagement';
import Signup from './corecomponents/Signup';

function App() {
  
  return (
    <>
      <Router>
        <div className='background'>
          <nav>
            <ul className="spice-horizontal-nav">
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
              <Link to="/productinventory">Product Inventory</Link>
              </li>
              <li>
              <Link to="/aboutus">About Us</Link>
              </li>
              <li>
              <Link to="/contactus">Contact Us</Link>
              </li>
              <li>
              <Link to="/orderplacement">Order</Link>
              </li>
              <li>
                <Link to="/customermanagement">Customer Management</Link>
              </li>
              <li>
              <Link to="/shoppingcart" >
              <img src="images/Cart.jpg" alt= "getCartIconPath" className="cart-image"></img></Link>
              </li>
              <li className="spice-horizontal-nav-right">
              <input type="text" placeholder="Search..." style={{ padding: "5px", borderRadius: "5px"}}
              />
              </li>
              
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/productinventory" element={<ProductInventory />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/shoppingcart" element={<ShoppingCart />} />
            <Route path="/orderplacement" element={<OrderPlacement />} />
            <Route path="/customermanagement" element={<CustomerManagement />} />
          </Routes>
          <footer>
            <p>
            © Product Of VJkamps!
            </p>
          </footer>
        </div>
      </Router>

    </>
  );
}

export default App
