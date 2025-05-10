import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './assets/kategori-grid.css';

const KategoriGrid = () => {
    const categories = [
        'Turtle Motion',
        'Tell Turtle’s state',
        'Settings for measurement',
        'Pen control',
        'Turtle state',
        'Using events',
        'Special Turtle methods',
        'Compound shapes',
      ];
      
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Belajar Turtle</h4>
        <Button variant="outline-dark">View All</Button>
      </div>
      <Row>
        {categories.map((category, index) => (
          <Col xs={12} sm={6} md={4} lg={3} className="mb-3" key={index}>
            <Button className="category-btn w-100 d-flex justify-content-between align-items-center">
              {category}
              <span>&rarr;</span>
            </Button>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Tantangan</h4>
        <Button variant="outline-dark">View All</Button>
      </div>
      <Row>
        {categories.map((category, index) => (
          <Col xs={12} sm={6} md={4} lg={3} className="mb-3" key={index}>
            <Button className="category-btn w-100 d-flex justify-content-between align-items-center">
              {category}
              <span>&rarr;</span>
            </Button>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Susur Sungai</h4>
        <Button variant="outline-dark">View All</Button>
      </div>
      <Row>
        {categories.map((category, index) => (
          <Col xs={12} sm={6} md={4} lg={3} className="mb-3" key={index}>
            <Button className="category-btn w-100 d-flex justify-content-between align-items-center">
              {category}
              <span>&rarr;</span>
            </Button>
          </Col>
        ))}
      </Row>
    </Container>
    
  )
}

export default KategoriGrid;
