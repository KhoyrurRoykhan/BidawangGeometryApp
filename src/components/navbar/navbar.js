import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { FaGamepad, FaCode, FaBookReader, FaUserCircle } from 'react-icons/fa';
import './assets/navbar.css';
import { useLocation } from 'react-router-dom';


const Navigasibar = () => {
  const [nama, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.nama);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false); // Tetap bisa akses, tapi dianggap tidak login
    }
  };

  const handleLogout = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/api/logout`);
      setIsLoggedIn(false);
      setName('');
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Navbar expand="lg" className="bg-success fixed-top" style={{ fontFamily: 'Verdana, sans-serif' }}>
  <Container>
    <Navbar.Brand href="/" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginRight:20 }}>
      BidGeometry
    </Navbar.Brand>
    
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link style={{ color: 'white', marginRight:10}} href="/belajar/pendahuluan"><FaBookReader /> Belajar Turtle</Nav.Link>
        <Nav.Link style={{ color: 'white', marginRight:10 }} href="/challanges"><FaGamepad /> Tantangan</Nav.Link>
        <Nav.Link style={{ color: 'white' }} href="/texteditor"><FaCode /> Text Editor</Nav.Link>
      </Nav>

      <Nav className="ms-auto align-items-center">
        {!isLoggedIn ? (
          <div className="d-flex flex-column flex-lg-row gap-2">
            <div className="d-grid gap-2 d-lg-flex">
            <Button
              variant="light"
              size="sm"
              className="w-100 w-lg-auto"
              onClick={() => navigate('/login')}
            >
              Masuk
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              className="w-100 w-lg-auto"
              onClick={() => navigate('/register')}
            >
              Daftar
            </Button>
          </div>

          </div>
        ) : (
          <Dropdown align="end">
            <Dropdown.Toggle variant="success" id="dropdown-user" style={{ backgroundColor: 'transparent', border: 'none' }}>
              <FaUserCircle size={28} color="white" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>{nama}</Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Nav>

    </Navbar.Collapse>
  </Container>
</Navbar>

  );
};

export default Navigasibar;
