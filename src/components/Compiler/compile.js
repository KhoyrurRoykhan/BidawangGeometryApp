import React, { useState, useRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python'; // Gunakan mode Python
// import './assets/tutor.css'; // Gaya CSS untuk layout

const Compile = () => {
  const [code, setCode] = useState(`forward(100)\nleft(90)\nforward(100)`); // Contoh kode Python
  const canvasRef = useRef(null);

  // Fungsi untuk menjalankan kode Python dan menggambar hasil di kanvas
  const runTurtleCode = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan kanvas sebelum menggambar

    // Setup turtle simulation
    let turtle = {
      x: 200,
      y: 200,
      angle: 0, // Menggunakan derajat
    };

    // Fungsi untuk menggambar hasil perintah turtle
    const drawLine = (turtle, distance) => {
      const radianAngle = (turtle.angle * Math.PI) / 180;
      const newX = turtle.x + Math.cos(radianAngle) * distance;
      const newY = turtle.y + Math.sin(radianAngle) * distance;

      // Gambar garis dari posisi turtle saat ini
      context.beginPath();
      context.moveTo(turtle.x, turtle.y);
      context.lineTo(newX, newY);
      context.stroke();

      // Update posisi turtle
      turtle.x = newX;
      turtle.y = newY;
    };

    const turnLeft = (turtle, angle) => {
      turtle.angle -= angle; // Putar ke kiri
    };

    const turnRight = (turtle, angle) => {
      turtle.angle += angle; // Putar ke kanan
    };

    // Pastikan Skulpt sudah terdefinisi sebelum mencoba menjalankan kode
    if (typeof window.Sk !== 'undefined') {
      // Menjalankan kode Python yang dimasukkan pengguna menggunakan Skulpt
      const builtin = {
        forward: (dist) => drawLine(turtle, dist),
        left: (ang) => turnLeft(turtle, ang),
        right: (ang) => turnRight(turtle, ang),
      };

      try {
        // Gunakan Skulpt untuk mengeksekusi kode Python
        window.Sk.configure({
          output: (text) => console.log(text),
          read: (filename) => {
            if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][filename] === undefined) {
              throw `File tidak ditemukan: '${filename}'`;
            }
            return window.Sk.builtinFiles["files"][filename];
          },
          execLimit: 5000, // Batas waktu eksekusi 5 detik
          __future__: window.Sk.python3
        });

        // Ubah kode Python input dari pengguna menjadi format yang dapat dieksekusi
        window.Sk.misceval.asyncToPromise(() =>
          window.Sk.importMainWithBody("<stdin>", false, code, true)
        ).then((module) => {
          console.log('Eksekusi selesai');
        }).catch((err) => {
          console.error("Error saat menjalankan kode", err);
        });
      } catch (err) {
        console.error("Error saat menjalankan kode", err);
      }
    } else {
      console.error("Skulpt belum ter-load.");
    }
  };

  return (
    <div className="turtle-container" style={{ display: 'flex', marginTop: '20px' }}>
      {/* Editor Kode */}
      <div className="code-editor" style={{ width: '50%', paddingRight: '10px' }}>
        <CodeMirror
          value={code}
          options={{
            mode: 'python',
            theme: 'material',
            lineNumbers: true,
          }}
          onBeforeChange={(editor, data, value) => {
            setCode(value); // Update kode Python berdasarkan input pengguna
          }}
        />
        <button onClick={runTurtleCode} style={{ marginTop: '10px' }}>Run</button>
      </div>

      {/* Output Kanvas Turtle */}
      <div className="canvas-output" style={{ width: '50%', position: 'relative' }}>
        <canvas ref={canvasRef} width="400" height="400" style={{ border: '1px solid black' }}>
          Browser Anda tidak mendukung tag kanvas HTML5.
        </canvas>
      </div>
    </div>
  );
};

export default Compile;
