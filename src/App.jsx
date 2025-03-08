import { useState } from 'react';
import './App.css';
import './customstyles/spicenav.css';
import Home from './corecomponents/Home';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ContactUs from './corecomponents/ContactUs';
import AboutUs from './corecomponents/AboutUs';
import ProductInventory from './corecomponents/ProductInventory';

function App() {
  
  return (
    <>
      <Router>
        <div>
          <nav>
            <ul className="spice-horizontal-nav">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
              <Link to="/productinventory">Inventory</Link>
              </li>
              <li>
              <Link to="/aboutus">About Us</Link>
              </li>
              <li>
              <Link to="/contactus">Contact Us</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productinventory" element={<ProductInventory />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
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
