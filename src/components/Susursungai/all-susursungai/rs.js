// import React, { useState, useEffect, useRef } from 'react';
// import { Container, Row, Col, Button, Form } from 'react-bootstrap';
// import swal from 'sweetalert'; // Impor SweetAlert
// import boatImage from './assets/papuyu.png'; // Gambar perahu
// import riverTarget from './assets/papuyu.png'; // Gambar target
// import riverBackground from './assets/baritoriver.png'; // Gambar latar belakang sungai
// import { MapContainer, TileLayer } from 'react-leaflet';

// const Baritoriver = () => {
//   const [turtleCommands, setTurtleCommands] = useState('');
//   const canvasRef = useRef(null);
//   const boatImageRef = useRef(null);
//   const riverTargetImageRef = useRef(null);
//   const backgroundImageRef = useRef(null); // Referensi untuk gambar latar belakang

//   const handleCommandChange = (event) => {
//     setTurtleCommands(event.target.value);
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const boatImage = boatImageRef.current;
//     const riverTargetImage = riverTargetImageRef.current;
//     const backgroundImage = backgroundImageRef.current; // Ambil gambar latar belakang

//     // Gambar latar belakang
//     ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

//     // Gambar garis tengah
//     ctx.strokeStyle = 'lightgray';
//     ctx.beginPath();
//     ctx.moveTo(canvas.width / 2, 0);
//     ctx.lineTo(canvas.width / 2, canvas.height);
//     ctx.moveTo(0, canvas.height / 2);
//     ctx.lineTo(canvas.width, canvas.height / 2);
//     ctx.stroke();

//     // Tampilkan perahu dan target di posisi awal
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;

//     // Target (sungai)
//     const riverTarget = { x: 150, y: 150 }; // Posisi target di sungai

//     // Gambar Target di posisi target
//     ctx.drawImage(
//       riverTargetImage,
//       centerX + riverTarget.x - 50, // Ganti dengan ukuran target
//       centerY - riverTarget.y - 50, // Ganti dengan ukuran target
//       100, // Ganti dengan ukuran target
//       100 // Ganti dengan ukuran target
//     );

//     // Gambar Perahu di tengah
//     ctx.drawImage(
//       boatImage,
//       centerX - 50, // Ganti dengan ukuran perahu
//       centerY - 50, // Ganti dengan ukuran perahu
//       100, // Ganti dengan ukuran perahu
//       100 // Ganti dengan ukuran perahu
//     );
//   }, [boatImageRef, riverTargetImageRef]);

//   const executeCommands = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const boatImage = boatImageRef.current;
//     const riverTargetImage = riverTargetImageRef.current;
//     const backgroundImage = backgroundImageRef.current; // Ambil gambar latar belakang

//     // Gambar latar belakang
//     ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

//     ctx.strokeStyle = 'lightgray';
//     ctx.beginPath();
//     ctx.moveTo(canvas.width / 2, 0);
//     ctx.lineTo(canvas.width / 2, canvas.height);
//     ctx.moveTo(0, canvas.height / 2);
//     ctx.lineTo(canvas.width, canvas.height / 2);
//     ctx.stroke();

//     // Posisi target (di sungai)
//     const riverTarget = { x: 150, y: 150 };

//     // Gambar Target
//     ctx.drawImage(
//       riverTargetImage,
//       canvas.width / 2 + riverTarget.x - 50,
//       canvas.height / 2 - riverTarget.y - 50,
//       100,
//       100
//     );

//     // Posisi awal Perahu
//     let currentX = canvas.width / 2;
//     let currentY = canvas.height / 2; 
//     let currentAngle = 90;

//     // Jalur pergerakan
//     const path = [{ x: currentX, y: currentY }];

//     // Eksekusi perintah
//     const commands = turtleCommands.split('\n');
//     commands.forEach((command) => {
//       const parts = command.trim().split(' ');
//       const instruction = parts[0].toLowerCase();
//       const value = parseFloat(parts[1]);

//       switch (instruction) {
//         case 'forward':
//         case 'fd':
//           currentX += value * Math.cos((currentAngle - 90) * Math.PI / 180);
//           currentY += value * Math.sin((currentAngle - 90) * Math.PI / 180);
//           path.push({ x: currentX, y: currentY });
//           break;

//         case 'backward':
//         case 'bk':
//           currentX -= value * Math.cos((currentAngle - 90) * Math.PI / 180);
//           currentY -= value * Math.sin((currentAngle - 90) * Math.PI / 180);
//           path.push({ x: currentX, y: currentY });
//           break;

//         case 'right':
//         case 'rt':
//           currentAngle += value;
//           break;

//         case 'left':
//         case 'lt':
//           currentAngle -= value;
//           break;

//         case 'goto':
//           if (parts.length === 3) {
//             currentX = canvas.width / 2 + parseFloat(parts[1]);
//             currentY = canvas.height / 2 - parseFloat(parts[2]);
//             path.push({ x: currentX, y: currentY });
//           }
//           break;

//         case 'setheading':
//         case 'seth':
//           currentAngle = value;
//           break;

//         default:
//           console.warn('Invalid command:', command);
//       }
//     });

//     // Gambar jalur pergerakan
//     ctx.beginPath();
//     ctx.strokeStyle = 'blue';
//     ctx.lineWidth = 2;
//     ctx.moveTo(path[0].x, path[0].y);
//     path.slice(1).forEach((point) => {
//       ctx.lineTo(point.x, point.y);
//     });
//     ctx.stroke();

//     // Gambar ulang Perahu di posisi akhir
//     ctx.save();
//     ctx.translate(currentX, currentY);
//     ctx.rotate((currentAngle - 90) * Math.PI / 180);

//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = 'high';
//     ctx.drawImage(
//       boatImage,
//       -50, // Ganti dengan ukuran perahu
//       -50, // Ganti dengan ukuran perahu
//       100, // Ganti dengan ukuran perahu
//       100 // Ganti dengan ukuran perahu
//     );
//     ctx.restore();

//     // Debug posisi akhir Perahu
//     console.log(`Boat Final Position: (${currentX.toFixed(2)}, ${currentY.toFixed(2)})`);
//     console.log(`River Target Position: (${canvas.width / 2 + riverTarget.x}, ${canvas.height / 2 - riverTarget.y})`);

//     // Toleransi posisi
//     const tolerance = 2;

//     // **Pengecekan posisi di akhir eksekusi**
//     setTimeout(() => {
//       if (
//         Math.abs(currentX - (canvas.width / 2 + riverTarget.x)) <= tolerance &&
//         Math.abs(currentY - (canvas.height / 2 - riverTarget.y)) <= tolerance
//       ) {
//         swal("Horee!", "Perahu telah mencapai target di Sungai Barito!", "success"); // Menggunakan SweetAlert
//       }
//     }, 0); // Delay sangat kecil untuk memastikan sinkronisasi
//   };

//   return (
//     <Container style={{ marginTop: 100 }}>
//       <Row>
//         <Col md={6}>
//           <Form>
//             <Form.Group controlId="turtleCommands">
//               <Form.Label>Input Turtle Commands</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={10}
//                 value={turtleCommands}
//                 onChange={handleCommandChange}
//                 placeholder={`Enter commands like:
// fd 100
// rt 90
// `}
//               />
//             </Form.Group>
//             <Button variant="primary" onClick={executeCommands}>
//               Execute
//             </Button>
//           </Form>
//         </Col>
//         <Col md={6}>
//           <canvas
//             ref={canvasRef}
//             width={500}
//             height={500}
//             style={{ border: '1px solid black' }}
//           />
//           <img
//             ref={boatImageRef}
//             src={boatImage}
//             alt="Boat"
//             style={{ display: 'none' }}
//           />
//           <img
//             ref={riverTargetImageRef}
//             src={riverTarget}
//             alt="River Target" 
//             style={{ display: 'none' }}
//           />
//           <img
//             ref={backgroundImageRef}
//             src={riverBackground}
//             alt="River Background"
//             style={{ display: 'none' }}
//           />
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default Baritoriver;