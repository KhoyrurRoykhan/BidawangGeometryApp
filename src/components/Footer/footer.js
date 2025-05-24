import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../Footer/assets/footer.css'

const Footer = () => {
  return (
    <footer className="footer mt-5 bg-dark text-white py-4">
      <Container>
      <p className="mb-0">&copy; 2025 Bidawang BidGeometry.</p>
      </Container>
    </footer>
  )
}

export default Footer;
