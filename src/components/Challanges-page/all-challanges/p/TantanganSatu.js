import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from '../assets/papuyu-1.png';
import broccoli from '../assets/cacingtarget.png';
import { useNavigate } from "react-router-dom";

const TantanganSatu = () => {
  const navigate = useNavigate();

  const [turtleCommands, setTurtleCommands] = useState('');
  const canvasRef = useRef(null);
  const papuyuImageRef = useRef(null);
  const broccoliImageRef = useRef(null);

  const handleCommandChange = (event) => {
    setTurtleCommands(event.target.value);
  };

  const showHint = () => {
    swal("Deskripsi Misi", 
      "Bantu papuyu menemukan jalannya menuju cacing lezat di posisi 100,100!\n\n" +
      "Tujuan: Kura-kura memulai perjalanan dari posisi 0,0 dan harus menavigasi untuk mencapai posisi 100,100, tempat cacing besar lezat untuk dimakan.\n\n" +
      "Instruksi:\n" +
      "1) Papuyu harus bergerak maju dan mundur sejauh x satuan setiap kali untuk mencapai posisi 100,100.\n" +
      "2) Ia dapat berbelok ke kanan atau ke kiri sebesar x derajat setiap kali untuk mengubah arah.\n" +
      "3) Setelah ia mencapai cacing, ia bisa menikmati makanannya!", 
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
      // Draw x-axis labels
      ctx.fillText(x - ctx.canvas.width / 2, x, ctx.canvas.height / 2 + 10); // Offset for better visibility
    }

    // Draw horizontal lines and labels
    for (let y = 0; y <= ctx.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
      // Draw y-axis labels
      ctx.fillText((ctx.canvas.height / 2 - y).toString(), ctx.canvas.width / 2 + 5, y + 3); // Offset for better visibility
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const papuyuImage = papuyuImageRef.current;
    const broccoliImage = broccoliImageRef.current;

    // Initialize canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx);

    // Draw center lines
    ctx.strokeStyle = 'lightgray';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Display papuyu and broccoli at initial positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Target (Broccoli)
    const broccoliTarget = { x: 100, y: 100 };

    // Papuyu
    const imageWidth = 500; 
    const aspectRatio = papuyuImage.width / papuyuImage.height;
    const imageHeight = imageWidth / aspectRatio;

    // Broccoli
    const broccoliImageWidth = 100;
    const broccoliAspectRatio = broccoliImage.width / broccoliImage.height;
    const broccoliImageHeight = broccoliImageWidth / broccoliAspectRatio;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw Broccoli at target position
    ctx.drawImage(
      broccoliImage,
      centerX + broccoliTarget.x - broccoliImageWidth / 2,
      centerY - broccoliTarget.y - broccoliImageHeight /  2,
      broccoliImageWidth,
      broccoliImageHeight
    );

    // Draw Papuyu at center
    ctx.drawImage(
      papuyuImage,
      centerX - imageWidth / 2,
      centerY - imageHeight / 2,
      imageWidth,
      imageHeight
    );

    // Show hint alert when the component mounts
    showHint();

  }, [papuyuImageRef, broccoliImageRef]);

  const executeCommands = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const papuyuImage = papuyuImageRef.current;
    const broccoliImage = broccoliImageRef.current;
  
    // Clear and redraw canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw grid
    drawGrid(ctx);
  
    ctx.strokeStyle = 'lightgray';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  
    // Target position (Broccoli)
    const broccoliTarget = { x: 100, y: 100 };
  
    // Draw Broccoli
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
  
    // Initial position of Papuyu
    let currentX = canvas.width / 2;
    let currentY = canvas.height / 2;
    let currentAngle = 90;
  
    // Movement path
    const path = [{ x: currentX, y: currentY }];
  
    // Execute commands
    const commands = turtleCommands.split('\n');
    commands.forEach((command) => {
      const parts = command.trim().split(' '); // Correctly declare parts here
      const instruction = parts[0].toLowerCase();
      const value = parseFloat(parts[1]);
  
      switch (instruction) {
        case 'forward':
        case 'fd':
          currentX += value * Math.cos((currentAngle - 90) * Math.PI / 180);
          currentY += value * Math.sin((currentAngle - 90) * Math.PI / 180);
          path.push({ x: currentX, y: currentY });
          break;
  
        case 'backward':
        case 'bk':
          currentX -= value * Math.cos((currentAngle - 90) * Math.PI / 180);
          currentY -= value * Math.sin((currentAngle - 90) * Math.PI / 180);
          path.push({ x: currentX, y: currentY });
          break;
  
        case 'right':
        case 'rt':
          currentAngle += value;
          break;
  
        case 'left':
        case 'lt':
          currentAngle -= value;
          break;
  
        case 'goto':
          if (parts.length === 3) {
            currentX = canvas.width / 2 + parseFloat(parts[1]);
            currentY = canvas.height / 2 - parseFloat(parts[2]);
            path.push({ x: currentX, y: currentY });
          }
          break;
  
        case 'setheading':
        case 'seth':
          currentAngle = value;
          break;
  
        default:
          console.warn('Invalid command:', command);
      }
    });
  
    // Draw movement path
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.moveTo(path[0].x, path[0].y);
    path.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  
    // Redraw Papuyu at final position
    const imageWidth = 500;
    const aspectRatio = papuyuImage.width / papuyuImage.height;
    const imageHeight = imageWidth / aspectRatio;
  
    ctx.save();
    ctx.translate(currentX, currentY);
    ctx.rotate((currentAngle - 90) * Math.PI / 180);
  
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      papuyuImage,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    );
    ctx.restore();
  
    // Debug final position of Papuyu
    console.log(`Papuyu Final Position: (${currentX.toFixed(2)}, ${currentY.toFixed(2)})`);
    console.log(`Broccoli Position: (${canvas.width / 2 + broccoliTarget.x}, ${canvas.height / 2 - broccoliTarget.y})`);
  
    // Tolerance for position checking
    const tolerance = 2;
  
    // Check final position after execution
    setTimeout(() => {
      if (
        Math.abs(currentX - (canvas.width / 2 + broccoliTarget.x)) <= tolerance &&
        Math.abs(currentY - (canvas.height / 2 - broccoliTarget.y)) <= tolerance
      ) {
        swal("Horee!", "Ikan Papuyu telah memakan Cacing!", "success"); // Using SweetAlert
      }
    }, 0); // Very small delay for synchronization
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
  fd 100
  rt 90
  `}
              />
            </Form.Group>
            <Button className='mt-2' variant="success" onClick={executeCommands}>
              Execute
            </Button>
            <Button className='mt-2 ms-2' variant="info" onClick={showHint}>
              Show Hint
            </Button>
            <Button className="mt-2 ms-2" variant="primary" href='/belajarturtle' 
            onClick={() => navigate('/belajarturtle', { state: { activeContent: "menu1.1" } })}>
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

export default TantanganSatu;