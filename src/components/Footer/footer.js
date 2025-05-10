import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../Footer/assets/footer.css'

const Footer = () => {
  return (
    <footer className="footer mt-5 bg-dark text-white py-4">
      <Container>
        <Row>
          <Col md={4}>
            <h5>About Us</h5>
            <p>
              We are a company dedicated to providing the best services to our customers. Our mission is to create value and make a difference.
            </p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/home" className="text-white">Home</a></li>
              <li><a href="/services" className="text-white">Services</a></li>
              <li><a href="/about" className="text-white">About</a></li>
              <li><a href="/contact" className="text-white">Contact</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <p>
              Email: contact@company.com<br />
              Phone: +123 456 7890<br />
              Address: 123 Street, City, Country
            </p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="mb-0">&copy; 2024 Your Company. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer;
