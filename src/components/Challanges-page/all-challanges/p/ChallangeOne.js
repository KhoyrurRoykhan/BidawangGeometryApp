import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from '../assets/papuyu-1.png';
import broccoli from '../assets/cacingtarget.png';

const ChallangeOne = () => {
  const [turtleCommands, setTurtleCommands] = useState('');
  const canvasRef = useRef(null);
  const papuyuImageRef = useRef(null);
  const broccoliImageRef = useRef(null);

  const handleCommandChange = (event) => {
    setTurtleCommands(event.target.value);
  };

  const showHint = () => {
    swal(
      "Deskripsi Misi",
      "Bantu Papuyu menghadap ke cacing lezat di posisi 100,100!\n\n" +
        "Tujuan: Papuyu memulai dari posisi 0,0 dan harus diarahkan untuk menghadap langsung ke cacing di posisi 100,100.\n\n" +
        "Instruksi:\n" +
        "1) Gunakan perintah 'left(x)' untuk berbelok ke kiri sebesar x derajat.\n" +
        "2) Gunakan perintah 'right(x)' untuk berbelok ke kanan sebesar x derajat.\n" +
        "3) Setelah sudut Papuyu menghadap ke cacing, misi selesai!\n\n" +
        "Selamat mencoba!",
      "info"
    );
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = 'lightgray'; // Color of the grid lines
    ctx.lineWidth = 0.5; // Thickness of the grid lines
    ctx.fillStyle = 'black'; // Color for the grid numbers
    ctx.font = '10px Arial'; // Font for the grid numbers

    // Draw vertical lines and labels
    for (let x = 0; x <= ctx.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
      ctx.fillText(x - ctx.canvas.width / 2, x, ctx.canvas.height / 2 + 10);
    }

    // Draw horizontal lines and labels
    for (let y = 0; y <= ctx.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
      ctx.fillText((ctx.canvas.height / 2 - y).toString(), ctx.canvas.width / 2 + 5, y + 3);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const papuyuImage = papuyuImageRef.current;
    const broccoliImage = broccoliImageRef.current;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);

    ctx.strokeStyle = 'lightgray';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const broccoliTarget = { x: 100, y: 100 };

    const broccoliImageWidth = 100;
    const broccoliAspectRatio = broccoliImage.width / broccoliImage.height;
    const broccoliImageHeight = broccoliImageWidth / broccoliAspectRatio;

    ctx.drawImage(
      broccoliImage,
      centerX + broccoliTarget.x - broccoliImageWidth / 2,
      centerY - broccoliTarget.y - broccoliImageHeight / 2,
      broccoliImageWidth,
      broccoliImageHeight
    );

    const imageWidth = 500;
    const aspectRatio = papuyuImage.width / papuyuImage.height;
    const imageHeight = imageWidth / aspectRatio;

    ctx.drawImage(
      papuyuImage,
      centerX - imageWidth / 2,
      centerY - imageHeight / 2,
      imageWidth,
      imageHeight
    );

    showHint();
  }, []);

  const executeCommands = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const papuyuImage = papuyuImageRef.current;
    const broccoliImage = broccoliImageRef.current;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);

    ctx.strokeStyle = 'lightgray';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    const broccoliTarget = { x: 100, y: 100 };

    const broccoliImageWidth = 100;
    const broccoliAspectRatio = broccoliImage.width / broccoliImage.height;
    const broccoliImageHeight = broccoliImageWidth / broccoliAspectRatio;

    ctx.drawImage(
      broccoliImage,
      canvas.width / 2 + broccoliTarget.x - broccoliImageWidth / 2,
      canvas.height / 2 - broccoliTarget.y - broccoliImageHeight / 2,
      broccoliImageWidth,
      broccoliImageHeight
    );

    let currentAngle = 90;

    const commands = turtleCommands.split('\n');
    commands.forEach((command) => {
      const parts = command.trim().split('(');
      const instruction = parts[0].toLowerCase();
      const value = parseFloat(parts[1]?.replace(')', ''));

      if (instruction === 'right') {
        currentAngle += value;
      } else if (instruction === 'left') {
        currentAngle -= value;
      } else {
        console.warn('Invalid command:', command);
      }
    });

    const dx = broccoliTarget.x;
    const dy = broccoliTarget.y;
    const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const normalizedCurrentAngle = ((currentAngle % 360) + 360) % 360;
    const normalizedTargetAngle = ((targetAngle % 360) + 360) % 360;

    const initialX = canvas.width / 2;
    const initialY = canvas.height / 2;
    const imageWidth = 500;
    const aspectRatio = papuyuImage.width / papuyuImage.height;
    const imageHeight = imageWidth / aspectRatio;

    ctx.save();
    ctx.translate(initialX, initialY);
    ctx.rotate((normalizedCurrentAngle - 90) * Math.PI / 180);
    ctx.drawImage(
      papuyuImage,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    );
    ctx.restore();

    const angleTolerance = 2;
    if (Math.abs(normalizedCurrentAngle - normalizedTargetAngle) <= angleTolerance) {
      swal("Horee!", "Papuyu berhasil menghadap ke cacing!", "success");
    } else {
      swal(
        "Coba Lagi!",
        "Papuyu belum menghadap ke cacing dengan benar. Periksa perintah Anda.",
        "error"
      );
    }
  };

  return (
    <Container style={{ marginTop: 100 }}>
      <Row>
        <Col md={6} className="d-flex justify-content-end">
          <Form style={{ width: '100%' }}>
            <Form.Group controlId="turtleCommands">
              <Form.Label>Input Turtle Commands</Form.Label>
              <Form.Control
                as="textarea"
                rows={19}
                value={turtleCommands}
                onChange={handleCommandChange}
                placeholder={`Enter commands like:
  right(45)
  left(90)
  `}
              />
            </Form.Group>
            <Button className="mt-2" variant="success" onClick={executeCommands}>
              Execute
            </Button>
            <Button className="mt-2 ms-2" variant="info" onClick={showHint}>
              Show Hint
            </Button>
            <Button className="mt-2 ms-2" variant="primary" href='/tutorial/leftright'>
              Kembali ke Materi
            </Button>
          </Form>
        </Col>
        <Col md={6} className="d-flex justify-content-start">
          <div style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              style={{ border: '1px solid black', display: 'block' }}
            />
            <img
              ref={papuyuImageRef}
              src={papuyu}
              alt="Papuyu"
              style={{ display: 'none' }}
            />
            <img
              ref={broccoliImageRef}
              src={broccoli}
              alt="Broccoli"
              style={{ display: 'none' }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChallangeOne;
