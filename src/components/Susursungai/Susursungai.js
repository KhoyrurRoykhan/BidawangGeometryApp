import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const sungai = [
    { id: 1, name: 'Sungai Barito', link: '#' },
    { id: 2, name: 'Sungai Martapura', link: '#' },
    { id: 3, name: 'Sungai Basirih', link: '#' },
    { id: 4, name: 'Sungai Antasan', link: '#' },
    { id: 5, name: 'Sungai Vetran', link: '#' },
    { id: 6, name: 'Sungai Belitung Darat', link: '#' },
    { id: 7, name: 'Sungai ....', link: '#' },
    { id: 8, name: 'Sungai ....', link: '#' },
    { id: 9, name: 'Sungai ....', link: '#' },
    { id: 10, name: 'Sungai ....', link: '#' },
    { id: 11, name: 'Sungai ....', link: '#' },
    { id: 12, name: 'Sungai ....', link: '#' }
  ];

const Susursungai = () => {
  return (
    <Container style={{marginTop:100}}>
      <h2 className='mb-3'>Susur Sungai</h2>
      <Row>
        {sungai.map((challenge, index) => (
          <Col key={challenge.id} md={6} lg={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>
                  <a href={challenge.link} className="text-primary text-decoration-none">
                    {challenge.id}. {challenge.name}
                  </a>
                </Card.Title>
                {challenge.id === 1 ? (
                  <div className="star-rating mb-2">
                    {Array(5).fill().map((_, i) => (
                      <span key={i} className="text-warning">★</span>
                    ))}
                  </div>
                ) : (
                  <Card.Text className="text-muted">
                    You don't have score for this challenge yet
                  </Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Susursungai
