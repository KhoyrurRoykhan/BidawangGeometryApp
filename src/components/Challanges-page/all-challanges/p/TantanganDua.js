import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from '../assets/papuyu-1.png';
import broccoli from '../assets/cacingtarget.png';

const TantanganDua = () => {
  const [turtleCommands, setTurtleCommands] = useState('');
  const canvasRef = useRef(null);
  const papuyuImageRef = useRef(null);
  const broccoliImageRef = useRef(null);

  const handleCommandChange = (event) => {
    setTurtleCommands(event.target.value);
  };

  const showHint = () => {
    swal("Deskripsi Misi",
      "Bantu Papuyu menemukan jalannya menuju empat target posisi yang berbeda (100,100), (-100,100), (-100,-100), dan (100,-100)!\n\n" +
      "Tujuan: Papuyu harus mencapai keempat posisi sebelum misinya selesai.\n\n" +
      "Instruksi:\n" +
      "1) Papuyu harus bergerak maju dan mundur sejauh x satuan setiap kali untuk mencapai setiap posisi.\n" +
      "2) Ia dapat berbelok ke kanan atau ke kiri sebesar x derajat setiap kali untuk mengubah arah.\n" +
      "3) Setelah mencapai semua target, Papuyu akan menyelesaikan misinya!", 
      "info"
    );
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = 'lightgray'; // Grid line color
    ctx.lineWidth = 0.5;
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';

    for (let x = 0; x <= ctx.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
      ctx.fillText(x - ctx.canvas.width / 2, x, ctx.canvas.height / 2 + 10);
    }

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

    const targets = [
      { x: 100, y: 100 },
      { x: -100, y: 100 },
      { x: -100, y: -100 },
      { x: 100, y: -100 }
    ];

    const broccoliImageWidth = 100;
    const broccoliAspectRatio = broccoliImage.width / broccoliImage.height;
    const broccoliImageHeight = broccoliImageWidth / broccoliAspectRatio;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    targets.forEach(target => {
      ctx.drawImage(
        broccoliImage,
        centerX + target.x - broccoliImageWidth / 2,
        centerY - target.y - broccoliImageHeight / 2,
        broccoliImageWidth,
        broccoliImageHeight
      );
    });

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
  }, [papuyuImageRef, broccoliImageRef]);

  const executeCommands = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const papuyuImage = papuyuImageRef.current;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);

    const targets = [
      { x: 100, y: 100 },
      { x: -100, y: 100 },
      { x: -100, y: -100 },
      { x: 100, y: -100 }
    ];
    const visitedTargets = new Set();

    const broccoliImage = broccoliImageRef.current;
    const broccoliImageWidth = 100;
    const broccoliAspectRatio = broccoliImage.width / broccoliImage.height;
    const broccoliImageHeight = broccoliImageWidth / broccoliAspectRatio;

    targets.forEach(target => {
      ctx.drawImage(
        broccoliImage,
        canvas.width / 2 + target.x - broccoliImageWidth / 2,
        canvas.height / 2 - target.y - broccoliImageHeight / 2,
        broccoliImageWidth,
        broccoliImageHeight
      );
    });

    let currentX = canvas.width / 2;
    let currentY = canvas.height / 2;
    let currentAngle = 90;

    const commands = turtleCommands.split('\n');
    commands.forEach(command => {
      const parts = command.trim().split(' ');
      const instruction = parts[0].toLowerCase();
      const value = parseFloat(parts[1]);

      switch (instruction) {
        case 'fd':
        case 'forward':
          currentX += value * Math.cos((currentAngle - 90) * Math.PI / 180);
          currentY += value * Math.sin((currentAngle - 90) * Math.PI / 180);
          break;
        case 'bk':
        case 'backward':
          currentX -= value * Math.cos((currentAngle - 90) * Math.PI / 180);
          currentY -= value * Math.sin((currentAngle - 90) * Math.PI / 180);
          break;
        case 'rt':
        case 'right':
          currentAngle += value;
          break;
        case 'lt':
        case 'left':
          currentAngle -= value;
          break;
        default:
          break;
      }

      targets.forEach(target => {
        if (
          Math.abs(currentX - (canvas.width / 2 + target.x)) <= 5 &&
          Math.abs(currentY - (canvas.height / 2 - target.y)) <= 5
        ) {
          visitedTargets.add(`${target.x},${target.y}`);
        }
      });
    });

    const imageWidth = 500;
    const aspectRatio = papuyuImage.width / papuyuImage.height;
    const imageHeight = imageWidth / aspectRatio;

    ctx.save();
    ctx.translate(currentX, currentY);
    ctx.rotate((currentAngle - 90) * Math.PI / 180);
    ctx.drawImage(
      papuyuImage,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    );
    ctx.restore();

    if (visitedTargets.size === targets.length) {
      swal("Horee!", "Papuyu telah mencapai semua target!", "success");
    }
  };

  return (
    <Container style={{ marginTop: 100 }}>
      <Row>
        <Col md={6}>
          <Form>
            <Form.Group controlId="turtleCommands">
              <Form.Label>Input Turtle Commands</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={turtleCommands}
                onChange={handleCommandChange}
                placeholder="Masukkan perintah seperti: fd 100\nrt 90"
              />
            </Form.Group>
            <Button className="mt-2" variant="success" onClick={executeCommands}>
              Eksekusi
            </Button>
            <Button className="mt-2 ms-2" variant="info" onClick={showHint}>
              Petunjuk
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{ border: '1px solid black' }}
          />
          <img ref={papuyuImageRef} src={papuyu} alt="Papuyu" style={{ display: 'none' }} />
          <img ref={broccoliImageRef} src={broccoli} alt="Broccoli" style={{ display: 'none' }} />
        </Col>
      </Row>
    </Container>
  );
};

export default TantanganDua;
