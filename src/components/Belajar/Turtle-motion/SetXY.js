import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Accordion, Container, Row, Col, Button, Form, Alert, Card, Image, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs'; // Import ikon Bootstrap
import '../assets/tutor.css';
import '../asset_skulpt/SkulptTurtleRunner.css';
import forward100 from './assets/2turtle-forward.gif';
import backward100 from './assets/2turtle-backward.gif';
// import combinedForwardBackward from './assets/combinedForwardBackward.gif';
import { FaBars } from "react-icons/fa";
import { closeBrackets } from '@codemirror/autocomplete';

// Challange
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from './assets/papuyu-1.png';
import broccoli from './assets/cacingtarget.png';
import map from './assets/4-setx-sety-tilemap.png';
import grid from './assets/3-setposition-b.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";
import Swal from "sweetalert2";

const correctCommands = {
  '1a': 'setx(100)',
  '1b': 'sety(-50)',
  '1c': 'setx(0)'
};

const SetXY = () => {
  //token
  const [activeButton, setActiveButton] = useState("intro-1");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/login");
      }
    }
  };

  //kunci halaman
  const [progresBelajar, setProgresBelajar] = useState(5);
  const [progresTantangan, setProgresTantangan] = useState(0);
  
  useEffect(() => {
    const checkAkses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
        const decoded = jwtDecode(response.data.accessToken);

        const progres = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`, {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`
          }
        });

        const progresBelajar = progres.data.progres_belajar;
        console.log(progresBelajar)
        setProgresBelajar(progres.data.progres_belajar);

        // Cek apakah progres cukup untuk akses halaman ini
        if (progresBelajar < 1) {
          // Redirect ke halaman materi sebelumnya
          navigate('/belajar/pendahuluan');
        }

      } catch (error) {
        console.log(error);
        navigate('/login'); // atau ke halaman login siswa
      }
    };

    checkAkses();
  }, [navigate]);

  const handleNavigate = (path, syarat) => {
    if (syarat) {
      navigate(path);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'Selesaikan materi sebelumnya terlebih dahulu ya 😊',
        confirmButtonColor: '#3085d6',
      });
    }
  };  

  useEffect(() => {
    const fetchProgresTantangan = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-tantangan`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProgresTantangan(response.data.progres_tantangan);
      } catch (error) {
        console.error("Gagal mengambil progres tantangan:", error);
      }
    };
  
    if (token) {
      fetchProgresTantangan();
    }
  }, [token]);

  // Tentukan accordion aktif berdasarkan URL
  const activeAccordionKey = location.pathname.includes("/belajar/turtlemotion") || location.pathname.includes("/belajar/turtlemotion/setxy")
    ? "1"
    : "0";

  // Class untuk tombol aktif
  const getButtonClass = (path) =>
    location.pathname === path ? "btn text-start mb-2 btn-success" : "btn text-start mb-2 btn-outline-success";


  //hh
  const showHint = () => {
    swal({
      title: "Petunjuk Tantangan",
      content: {
        element: "div",
        attributes: {
          innerHTML: `
            <p>Bidawang saat ini berada di tengah layar (titik <b>(0, 0)</b>), sedangkan cacing berada di titik <b>(100, 100)</b>.</p>
            <p>Tugas kamu adalah <b>memindahkan Bidawang</b> menuju ke posisi cacing dengan menggunakan <b>setx</b> dan <b>sety</b>.</p>
          `
        }
      },
      icon: "info"
    });
  };

  //accordion task
  const runAndCheck = () => {
    if (!pythonCode.trim()) return;
  
    const newCommand = pythonCode.trim();
    const newHistory = [...commandHistory, newCommand];
  
    setCommandHistory(newHistory);
    setPythonCode('');
    runit(newCommand);
    checkCode(newHistory); // gunakan history yang sudah termasuk perintah baru
  };

  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeKey, setActiveKey] = useState('1a');

  const normalizeLine = (line) => {
    return line
      .toLowerCase()               // bikin semua huruf kecil biar gak sensi kapital
      .replace(/['"]/g, '"')       // samain semua kutip jadi "
      .replace(/\s+/g, ' ')        // spasi berlebih jadi satu spasi
      .replace(/\s*\(\s*/g, '(')   // hapus spasi sekitar kurung buka
      .replace(/\s*\)\s*/g, ')')   // hapus spasi sekitar kurung tutup
      .replace(/\s*,\s*/g, ',')    // hapus spasi sekitar koma
      .replace(/\s*:\s*/g, ':')    // hapus spasi sekitar titik dua
      .trim();
  };
  
  const checkCode = (customCommands = null) => {
  const allCommands = customCommands ? [...customCommands] : [...commandHistory];
  if (pythonCode.trim() && !customCommands) {
    allCommands.push(pythonCode.trim());
  }

  const parsed = parseSimpleCommands(allCommands.join('\n'));
  const lines = parsed.split('\n').map(line => normalizeLine(line.trim()));

  let newCompletedSteps = [];
  let keys = Object.keys(correctCommands);

  for (let i = 0; i < keys.length; i++) {
    const expectedParsed = normalizeLine(parseSimpleCommands(correctCommands[keys[i]]).trim());
    if (lines[i] === expectedParsed) {
      newCompletedSteps.push(keys[i]);
    } else {
      break;
    }
  }

  setCompletedSteps(newCompletedSteps);

  if (newCompletedSteps.length < keys.length) {
    setActiveKey(keys[newCompletedSteps.length]);
  } else {
    setActiveKey(null);
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Selamat!',
        text: 'Anda telah menyelesaikan seluruh aktivitas ini!',
      });
    }, 1000);
  }
};

  //kuis
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswer2, setSelectedAnswer2] = useState('');
  const [feedback, setFeedback] = useState({ question1: '', question2: '' });
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  const handleAnswerChange = (questionId, answer) => {
    if (questionId === "question1") {
      setSelectedAnswer(answer);
    } else if (questionId === "question2") {
      setSelectedAnswer2(answer);
    }
  };
  
  const handleSubmit = async () => {
    if (currentQuestion === 1) {
      const isCorrect1 = selectedAnswer === 'A';
      setFeedback((prev) => ({ ...prev, question1: isCorrect1 ? 'Benar! Perintah `setx 200` hanya mengubah nilai koordinat x menjadi 200, sementara y tetap 50, sehingga posisi baru adalah (200, 50).' : 'Salah! Perintah `setx` hanya mengubah nilai x saja. Jika posisi awal (100, 50), maka `setx 200` mengubah nilai menjadi 200.' }));
    } else if (currentQuestion === 2) {
      const isCorrect2 = selectedAnswer2 === 'C';
      setFeedback((prev) => ({ ...prev, question2: isCorrect2 ? 'Benar! Perintah `sety -50` memindahkan bidawang secara vertikal ke y = -50, tanpa mengubah posisi x.' : 'Salah! Perintah yang benar untuk memindahkan secara vertikal (y) tanpa mengubah x adalah sety.' }));
  
      if (isCorrect2) {
        try {
          if (Number(progresBelajar) === 5) {
            await axios.put(
              `${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`,
              { progres_belajar: Number(progresBelajar) + 1 },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setProgresBelajar((prev) => Number(prev) + 1);
            Swal.fire({
              icon: 'success',
              title: 'Semua Jawaban Benar!',
              text: 'Materi selanjutnya sudah terbuka 😊',
              confirmButtonColor: '#198754',
            });
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Sudah Diselesaikan',
              text: 'Kamu sudah menyelesaikan materi ini sebelumnya.',
              confirmButtonColor: '#198754',
            });
          }
        } catch (error) {
          console.error("Gagal update progres:", error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Update Progres',
            text: 'Terjadi kesalahan saat memperbarui progres kamu.',
            confirmButtonColor: '#d33',
          });
        }
      }
    }
  };

  const [pythonCode, setPythonCode] = useState(``);
  const [pythonCode1, setPythonCode1] = useState(`

for i in range(100):
  speed(1)
  setx(100)
  speed(0)
  time.sleep(3) 
  reset()

`);
  const [pythonCode2, setPythonCode2] = useState(`

for i in range(100):
  speed(1)
  sety(150)
  speed(0)
  time.sleep(3) 
  reset()

`);

  const [pythonCodeChallanges, setPythonCodeChallanges] = useState(``);

  const [output, setOutput] = useState('');

  const outf = (text) => {
    setOutput((prev) => prev + text);
  };

  const builtinRead = (x) => {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return window.Sk.builtinFiles['files'][x];
  };

  const parseSimpleCommands = (code) => {
    const lines = code.split('\n');
    const parsedLines = [];
    let i = 0;
  
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      const leadingSpaces = line.match(/^\s*/)?.[0] || '';
  
      if (trimmed === '' || trimmed.startsWith('#')) {
        parsedLines.push(line);
        i++;
        continue;
      }
  
      const forMatch = trimmed.match(/^for\s+(\d+)$/);
      if (forMatch) {
        const loopCount = parseInt(forMatch[1]);
        parsedLines.push(`${leadingSpaces}for i in range(${loopCount}):`);
        i++;
  
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextTrimmed = nextLine.trim();
          const nextIndent = nextLine.match(/^\s*/)?.[0].length || 0;
  
          if (nextTrimmed === '' || nextTrimmed.startsWith('#')) {
            parsedLines.push(nextLine);
            i++;
            continue;
          }
  
          if (nextIndent <= leadingSpaces.length) break;
  
          const parts = nextTrimmed.split(/\s+/);
          const cmd = parts[0];
          const args = parts.slice(1);
          const isAllArgsNumeric = args.every(arg => !isNaN(parseFloat(arg)));
          const isStringArg = args.length === 1 && /^["'].*["']$/.test(args[0]);
          const isMixedNumericStringArgs =
            args.length === 2 &&
            !isNaN(parseFloat(args[0])) &&
            /^["'].*["']$/.test(args[1]);
  
          if (nextTrimmed.includes('(') && nextTrimmed.includes(')')) {
            parsedLines.push(nextLine);
          } else if ((isAllArgsNumeric && args.length > 0) || isStringArg || isMixedNumericStringArgs) {
            parsedLines.push(`${nextLine.match(/^\s*/)?.[0] || ''}${cmd}(${args.join(',')})`);
          } else {
            parsedLines.push(nextLine);
          }
          i++;
        }
        continue;
      }
  
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);
      const noArgCommands = ['clear', 'home', 'reset', 'penup', 'pendown', 'showturtle', 'hideturtle', 'begin_fill', 'end_fill'];
      const isAllArgsNumeric = args.every(arg => !isNaN(parseFloat(arg)));
      const isStringArg = args.length === 1 && /^["'].*["']$/.test(args[0]);
      const isMixedNumericStringArgs =
        args.length === 2 &&
        !isNaN(parseFloat(args[0])) &&
        /^["'].*["']$/.test(args[1]);
  
      if (cmd === 'print' && args.length >= 1) {
        const arg = args[0];
        if (arg === 'position') {
          parsedLines.push(`${leadingSpaces}print(position())`);
          i++;
          continue;
        } else if (arg === 'xcor') {
          parsedLines.push(`${leadingSpaces}print(xcor())`);
          i++;
          continue;
        } else if (arg === 'ycor') {
          parsedLines.push(`${leadingSpaces}print(ycor())`);
          i++;
          continue;
        } else if (arg === 'heading') {
          parsedLines.push(`${leadingSpaces}print(heading())`);
          i++;
          continue;
        } else if (arg === 'isdown') {
          parsedLines.push(`${leadingSpaces}print(isdown())`);
          i++;
          continue;
        } else if (arg === 'distance') {
          if (args.length === 3 && !isNaN(args[1]) && !isNaN(args[2])) {
            parsedLines.push(`${leadingSpaces}print(distance(${args[1]},${args[2]}))`);
            i++;
            continue;
          }
        }
      }
  
      if (trimmed.includes('(') && trimmed.includes(')')) {
        parsedLines.push(line);
      } else if (noArgCommands.includes(cmd) && args.length === 0) {
        parsedLines.push(`${leadingSpaces}${cmd}()`);
      } else if ((isAllArgsNumeric && args.length > 0) || isStringArg || isMixedNumericStringArgs) {
        parsedLines.push(`${leadingSpaces}${cmd}(${args.join(',')})`);
      } else {
        parsedLines.push(line);
      }
  
      i++;
    }
  
    return parsedLines.join('\n');
  };
  
  

const [commandHistory, setCommandHistory] = useState([]);

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();

    // Ambil kode dari pythonCode tanpa newline
    const cleaned = pythonCode.replace(/\s*\n\s*/g, '').trim();

    // Optional: pastikan buka-tutup kurung seimbang
    const openParens = (cleaned.match(/\(/g) || []).length;
    const closeParens = (cleaned.match(/\)/g) || []).length;

    if (cleaned && openParens === closeParens) {
      setPythonCode('');
      runit(cleaned);
      const updatedHistory = [...commandHistory, cleaned];
      setCommandHistory(updatedHistory);
      checkCode(updatedHistory);
    }
  }
};

// Fungsi Undo: hapus perintah terakhir dari history
const undoLastCommand = () => {
  if (commandHistory.length === 0) return;

  const newHistory = commandHistory.slice(0, -1);
  setCommandHistory(newHistory);
  checkCode(newHistory);

  // Jalankan ulang kode sesuai history terbaru (atau reset canvas jika kosong)
  if (newHistory.length > 0) {
    runit(newHistory.join('\n'), true); // true = reset canvas sebelum jalankan ulang
  } else {
    runit('', true); // kosong = reset canvas
  }
};


const runit = (code, forceReset = false) => {
  setOutput('');

  const parsedNewCode = parseSimpleCommands(code || pythonCode);
  const parsedHistory = commandHistory.map(cmd => parseSimpleCommands(cmd)).join('\n');

  const imports = "from turtle import *\nshape('turtle')\n";
  let prog = "";

  if (forceReset) {
    // Reset posisi & canvas
    prog = imports + "reset()\nspeed(1)\n" + parsedNewCode;
  } else {
    // Jalankan history dengan speed 0 (tanpa animasi), lalu kode baru dengan speed 1
    prog = imports +
           "reset()\nspeed(0)\n" + parsedHistory +
           "\nspeed(1)\n" + parsedNewCode;
  }

  window.Sk.pre = "output";
  window.Sk.configure({ output: outf, read: builtinRead });
  (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas';

  window.Sk.misceval.asyncToPromise(() =>
    window.Sk.importMainWithBody('<stdin>', false, prog, true)
  ).then(
    () => console.log('success'),
    (err) => setOutput((prev) => prev + err.toString())
  );
};

  const runit1 = (code, forceReset = false) => {
    setOutput('');
    const parsedCode = parseSimpleCommands(code || pythonCode1); // Gunakan kode hasil parse
    const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
    const prog = forceReset ? imports : imports + parsedCode;
  
    window.Sk.pre = "output1";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh1';
  
    window.Sk.misceval.asyncToPromise(() => 
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
        () => console.log('success'),
        (err) => setOutput((prev) => prev + err.toString())
    );
  };

  const runit2 = (code, forceReset = false) => {
    setOutput('');
    const parsedCode = parseSimpleCommands(code || pythonCode2); // Gunakan kode hasil parse
    const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
    const prog = forceReset ? imports : imports + parsedCode;
  
    window.Sk.pre = "output2";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh2';
  
    window.Sk.misceval.asyncToPromise(() => 
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
        () => console.log('success'),
        (err) => setOutput((prev) => prev + err.toString())
    );
  };

  // Jalankan tantangan
  const runitchallanges = (codeInput, forceReset = false) => {
    setOutput('');
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(2)\n";
    const parsedCode = parseSimpleCommands(pythonCodeChallanges); // Tambahkan ini
    const prog = forceReset ? imports : imports + parsedCode;
  
  
    window.Sk.pre = "output4";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';
  
    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {
        checkCodeChallanges(codeInput);
      },
      (err) => setOutput((prev) => prev + err.toString())
    );
  };
  
  // Validasi
  const checkCodeChallanges = (code) => {
    const validSequences = [
      ["setx(100)", "sety(100)"],
      ["sety(100)", "setx(100)"]
    ];
  
    const parsedCode = parseSimpleCommands(code); // 🔧 Tambahan penting
    const userCodeLines = parsedCode
      .trim()
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
  
    if (userCodeLines.length === 0) return;
  
    // Validasi baris demi baris
    for (let i = 0; i < userCodeLines.length; i++) {
      const currentLine = userCodeLines[i];
      const expectedSet = validSequences.filter(seq => seq.length > i).map(seq => seq[i]);
  
      if (!expectedSet.some(expected => expected === currentLine)) {
        return swal("Salah", `Langkah ke-${i + 1} salah. Harusnya: ${expectedSet.join(" atau ")}`, "error").then(() => {
          setPythonCodeChallanges('');
          initializeTurtle();
        });
      }
    }
  
    // Jika semua langkah benar dan jumlahnya sesuai
    const isMatch = validSequences.some(valid =>
      valid.length === userCodeLines.length &&
      valid.every((line, idx) => line === userCodeLines[idx])
    );
  
    if (isMatch) {
      swal("Benar!", "Kamu berhasil menyelesaikan tantangan!", "success").then(async () => {
        try {
          if (progresTantangan === 3) {
            await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-tantangan`, {
              progres_tantangan: progresTantangan + 1
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setProgresTantangan(prev => prev + 1);
          }
        } catch (error) {
          console.error("Gagal update progres tantangan halaman 4:", error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Update Progres Tantangan',
            text: 'Terjadi kesalahan saat memperbarui progres tantangan halaman keempat.',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  };
  
  
    const [hasRun, setHasRun] = useState(false);
  
  

  const initializeTurtle = () => {
    const initCode = `from turtle import *
reset()
shape("turtle")
speed(2)`;
  
    window.Sk.pre = "output4";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';
  
    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody("<stdin>", false, initCode, true)
    ).then(() => {
      console.log("Turtle initialized to default state.");
    });
  };


  const resetCode = () => {
    setPythonCode('');
    setOutput('');
    runit('', true);
};

const resetCodeChallanges = () => {
  setPythonCodeChallanges('');
  setOutput('');
  initializeTurtle(); // Reset posisi turtle
};


  useEffect(() => {
    runit(); // Jalankan kode saat halaman dimuat
    runit1(); // Jalankan kode saat halaman dimuat
    runit2(); // Jalankan kode saat halaman dimuat
    initializeTurtle(); // Jalankan kode saat halaman dimuat
  }, []);

  const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
      setCollapsed(!collapsed);
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768); // Atur sesuai breakpoint yang diinginkan
      };

      handleResize(); // inisialisasi
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  return (
    <div className="pt-3" style={{ fontFamily: 'Verdana, sans-serif',
      display: "flex",
      height: "100vh",
      flexDirection: "row",
      overflow: "hidden", // agar tidak scroll di container utama
      position: "fixed",
      width:'100%'
    }}>
      
      <div className='mt-5'
        style={{
          width: collapsed ? "50px" : "250px",
          transition: "width 0.3s",
          backgroundColor: "#f0f0f0",
          // height: "100vh",
          position: "sticky", // atau fixed jika mau benar-benar di luar alur scroll
          top: 0,
          zIndex: 10,
          flexShrink: 0, // penting agar tidak ikut menyusut
          overflow: 'auto',
          paddingBottom:80
        }}
      >
        <div className="p-1">
          <Button variant="light" onClick={toggleSidebar}>
            <FaBars />
          </Button>
        </div>

        {!collapsed && (
        <Accordion defaultActiveKey={activeAccordionKey} className='p-2'>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Pengenalan</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={getButtonClass("/belajar/pendahuluan")}
                    onClick={() => navigate("/belajar/pendahuluan")}
                  >
                    Pengenalan
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pendahuluan/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pendahuluan/kuis", progresBelajar >= 1)}
                    style={{ pointerEvents: progresBelajar < 1 ? "auto" : "auto", opacity: progresBelajar < 1 ? 0.5 : 1 }}
                  >
                    <span>📋 Kuis: Pengenalan</span>
                    {progresBelajar < 1 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Turtle Motion</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/leftright")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/leftright", progresBelajar >= 2)}
                    style={{ pointerEvents: progresBelajar < 2 ? "auto" : "auto", opacity: progresBelajar < 2 ? 0.5 : 1 }}
                  >
                    <span>Left & Right</span>
                    {progresBelajar < 2 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/forwardbackward")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/forwardbackward", progresBelajar >= 3)}
                    style={{ pointerEvents: progresBelajar < 3 ? "auto" : "auto", opacity: progresBelajar < 3 ? 0.5 : 1 }}
                  >
                    Forward & Backward
                    {progresBelajar < 3 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setposition")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setposition", progresBelajar >= 4)}
                    style={{ pointerEvents: progresBelajar < 4 ? "auto" : "auto", opacity: progresBelajar < 4 ? 0.5 : 1 }}
                  >
                    Set Position
                    {progresBelajar < 4 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setxy")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setxy", progresBelajar >= 5)}
                    style={{ pointerEvents: progresBelajar < 5 ? "auto" : "auto", opacity: progresBelajar < 5 ? 0.5 : 1 }}
                  >
                    Setx & sety
                    {progresBelajar < 5 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setheading")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setheading", progresBelajar >= 6)}
                    style={{ pointerEvents: progresBelajar < 6 ? "auto" : "auto", opacity: progresBelajar < 6 ? 0.5 : 1 }}
                  >
                    Setheading
                    {progresBelajar < 6 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/home")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/home", progresBelajar >= 7)}
                    style={{ pointerEvents: progresBelajar < 7 ? "auto" : "auto", opacity: progresBelajar < 7 ? 0.5 : 1 }}
                  >
                    Home
                    {progresBelajar < 7 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/circle")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/circle", progresBelajar >= 8)}
                    style={{ pointerEvents: progresBelajar < 8 ? "auto" : "auto", opacity: progresBelajar < 8 ? 0.5 : 1 }}
                  >
                    Circle
                    {progresBelajar < 8 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/dot")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/dot", progresBelajar >= 9)}
                    style={{ pointerEvents: progresBelajar < 9 ? "auto" : "auto", opacity: progresBelajar < 9 ? 0.5 : 1 }}
                  >
                    Dot
                    {progresBelajar < 9 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/rangkuman")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/rangkuman", progresBelajar >= 10)}
                    style={{ pointerEvents: progresBelajar < 10 ? "auto" : "auto", opacity: progresBelajar < 10 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 10 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/kuis", progresBelajar >= 10)}
                    style={{ pointerEvents: progresBelajar < 10 ? "auto" : "auto", opacity: progresBelajar < 10 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Pergerakan
                    {progresBelajar < 10 && <span className="ms-2">🔒</span>}
                  </button>

                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Tell State</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/tellstate/position")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/position", progresBelajar >= 11)}
                    style={{ pointerEvents: progresBelajar < 11 ? "auto" : "auto", opacity: progresBelajar < 11 ? 0.5 : 1 }}
                  >
                    Position
                    {progresBelajar < 11 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/xcorycor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/xcorycor", progresBelajar >= 12)}
                    style={{ pointerEvents: progresBelajar < 12 ? "auto" : "auto", opacity: progresBelajar < 12 ? 0.5 : 1 }}
                  >
                    Xcor & Ycor
                    {progresBelajar < 12 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/heading")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/heading", progresBelajar >= 13)}
                    style={{ pointerEvents: progresBelajar < 13 ? "auto" : "auto", opacity: progresBelajar < 13 ? 0.5 : 1 }}
                  >
                    Heading
                    {progresBelajar < 13 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/distance")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/distance", progresBelajar >= 14)}
                    style={{ pointerEvents: progresBelajar < 14 ? "auto" : "auto", opacity: progresBelajar < 14 ? 0.5 : 1 }}
                  >
                    Distance
                    {progresBelajar < 14 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/rangkuman")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/rangkuman", progresBelajar >= 15)}
                    style={{ pointerEvents: progresBelajar < 15 ? "auto" : "auto", opacity: progresBelajar < 15 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 15 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/kuis", progresBelajar >= 15)}
                    style={{ pointerEvents: progresBelajar < 15 ? "auto" : "auto", opacity: progresBelajar < 15 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Mengetahui Status
                    {progresBelajar < 15 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Pen & Color Control</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/pencontrol/penuppendown")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/penuppendown", progresBelajar >= 16)}
                    style={{ pointerEvents: progresBelajar < 16 ? "auto" : "auto", opacity: progresBelajar < 16 ? 0.5 : 1 }}
                  >
                    Pendown & Penup
                    {progresBelajar < 16 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencontrol/pensize")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/pensize", progresBelajar >= 17)}
                    style={{ pointerEvents: progresBelajar < 17 ? "auto" : "auto", opacity: progresBelajar < 17 ? 0.5 : 1 }}
                  >
                    Pensize
                    {progresBelajar < 17 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencontrol/isdown")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/isdown", progresBelajar >= 18)}
                    style={{ pointerEvents: progresBelajar < 18 ? "auto" : "auto", opacity: progresBelajar < 18 ? 0.5 : 1 }}
                  >
                    Isdown
                    {progresBelajar < 18 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/colorcontrol/pencolor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/colorcontrol/pencolor", progresBelajar >= 19)}
                    style={{ pointerEvents: progresBelajar < 19 ? "auto" : "auto", opacity: progresBelajar < 19 ? 0.5 : 1 }}
                  >
                    Pencolor
                    {progresBelajar < 19 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/colorcontrol/fillcolor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/colorcontrol/fillcolor", progresBelajar >= 20)}
                    style={{ pointerEvents: progresBelajar < 20 ? "auto" : "auto", opacity: progresBelajar < 20 ? 0.5 : 1 }}
                  >
                    Pengisian Warna (Fillcolor, Begin_fill, dan End_fill)
                    {progresBelajar < 20 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencolorcontrol/rangkuman")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencolorcontrol/rangkuman", progresBelajar >= 21)}
                    style={{ pointerEvents: progresBelajar < 21 ? "auto" : "auto", opacity: progresBelajar < 21 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 21 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencolorcontrol/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencolorcontrol/kuis", progresBelajar >= 21)}
                    style={{ pointerEvents: progresBelajar < 21 ? "auto" : "auto", opacity: progresBelajar < 21 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Kontrol Pena dan Warna
                    {progresBelajar < 21 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

           
            <Accordion.Item eventKey="4">
              <Accordion.Header>More Drawing Control</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/reset")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/reset", progresBelajar >= 22)}
                    style={{ pointerEvents: progresBelajar < 22 ? "auto" : "auto", opacity: progresBelajar < 22 ? 0.5 : 1 }}
                  >
                    Reset
                    {progresBelajar < 22 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/clear")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/clear", progresBelajar >= 23)}
                    style={{ pointerEvents: progresBelajar < 23 ? "auto" : "auto", opacity: progresBelajar < 23 ? 0.5 : 1 }}
                  >
                    Clear
                    {progresBelajar < 23 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/write")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/write", progresBelajar >= 24)}
                    style={{ pointerEvents: progresBelajar < 24 ? "auto" : "auto", opacity: progresBelajar < 24 ? 0.5 : 1 }}
                  >
                    Write
                    {progresBelajar < 24 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/perulangan/forloop")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/perulangan/forloop", progresBelajar >= 25)}
                    style={{ pointerEvents: progresBelajar < 25 ? "auto" : "auto", opacity: progresBelajar < 25 ? 0.5 : 1 }}
                  >
                    For Loops
                    {progresBelajar < 25 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/rangkuman")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/rangkuman", progresBelajar >= 26)}
                    style={{ pointerEvents: progresBelajar < 26 ? "auto" : "auto", opacity: progresBelajar < 26 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 26 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/kuis", progresBelajar >= 26)}
                    style={{ pointerEvents: progresBelajar < 26 ? "auto" : "auto", opacity: progresBelajar < 26 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Kontrol Gambar Lanjutan
                    {progresBelajar < 26 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="5">
              <Accordion.Header>Evaluasi</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/evaluasi")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/evaluasi", progresBelajar >= 27)}
                    style={{ pointerEvents: progresBelajar < 27 ? "auto" : "auto", opacity: progresBelajar < 27 ? 0.5 : 1 }}
                  >
                    Evaluasi
                    {progresBelajar < 27 && <span className="ms-2">🔒</span>}
                  </button>                  
                </div>
              </Accordion.Body>
            </Accordion.Item>

          </Accordion>
        )}
        </div>

        
        <div className='p-4 mt-5 content' style={{
              flexGrow: 1,
              overflowY: "auto",
              // height: "100vh",
              backgroundColor: "#fff",

            }}>
          
          <div
            style={{
              paddingLeft: isMobile ? 5 : 50,
              paddingRight: isMobile ? 5 : 50,
              paddingBottom: 50,
            }}
          >

            <h2
            style={{
              textAlign: 'center',
              backgroundColor: '#198754',
              color: 'white',
              padding: '10px 20px',
              // borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontWeight: 'bold',
              fontSize: '24px',
              letterSpacing: '1px',
              borderLeft: '10px solid orange' // Border kiri dengan warna oranye
            }}>
              Setx & Sety
            </h2>

            <hr></hr>
            <br/>

            <h4
              style={{
                color: 'black',
                fontSize: '22px',
                fontWeight: 'bold',
                borderLeft: '5px solid #198754',
                paddingLeft: '10px',
                marginBottom: '10px',
              }}
            >
              Tujuan Pembelajaran
            </h4>
            <ol
              style={{
                backgroundColor: '#F9F9F9',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                listStylePosition: 'inside',
              }}
            >
              <li style={{ marginBottom: '8px' }}>
              Memahami cara mengatur posisi bidawang pada sumbu x dan y secara terpisah menggunakan `setx` dan `sety`.
              </li>
            </ol>

            <hr/>

            <p>
            Fungsi <b>setx</b> dan <b>sety</b> digunakan untuk memindahkan Bidawang ke posisi tertentu hanya pada sumbu x (<b>setx</b>) atau sumbu y (<b>sety</b>), tanpa mengubah koordinat lainnya. Perintah ini berguna untuk memindahkan turtle secara horizontal atau vertikal.
            </p>

            <h5 style={{color:'black'}}>1. setx</h5>
            <p>Memindahkan Bidawang ke posisi x yang ditentukan, tanpa mengubah posisi pada sumbu y.</p>
            <Row className="align-items-center">
              <Col md={6}>
                <CodeMirror
                  value={`setx 100`}
                  height="400px"
                  theme="light"
                  extensions={[python()]}
                  editable={false}
                  options={{ readOnly: 'nocursor' }}
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="canvas-section" 
                style={{
                  flex: isMobile ? 'none' : '0 0 400px',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: 400,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  overflowX: isMobile ? 'auto' : 'visible',}}>
                  <div style={{textAlign:'center', width: '100%'}} id="mycanvas-contoh1"></div>
                </div>
              </Col>
            </Row>
            <br></br>
            <p><b>Hasil:</b> Posisi awal Bidawang adalah x=0,y=0. Setelah dijalankan kode tersebut maka nilai x akan menjadi 100. Dan Bidawang akan berpindah ke titik x=100,y=0</p>
            
            <br></br>

            <h5 style={{color:'black'}}>2. sety</h5>
            <p>Memindahkan Bidawang ke posisi y yang ditentukan, tanpa mengubah posisi pada sumbu x.</p>
            <Row className="align-items-center">
              <Col md={6}>
                <CodeMirror
                  value={`sety 150`}
                  height="400px"
                  theme="light"
                  extensions={[python()]}
                  editable={false}
                  options={{ readOnly: 'nocursor' }}
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="canvas-section" 
                style={{
                  flex: isMobile ? 'none' : '0 0 400px',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: 400,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  overflowX: isMobile ? 'auto' : 'visible',}}>
                  <div style={{textAlign:'center', width: '100%'}} id="mycanvas-contoh2"></div>
                </div>
              </Col>
            </Row>
            <br></br>
            <p><b>Hasil:</b> Posisi awal bidawang adalah x=0,y=0. Setelah dijalankan kode tersebut maka nilai y akan menjadi 150. Dan bidawang akan berpindah ke titik x=0,y=150.</p>

            <br />
            <hr />

            <div
            style={{
              backgroundColor: '#F9F9F9',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              // maxWidth: '1000px',
              margin: 'auto',
            }}>
              <h4
              style={{
                color: 'black',
                fontSize: '22px',
                fontWeight: 'bold',
                borderLeft: '5px solid #198754',
                paddingLeft: '10px',
                marginBottom: '15px',
              }}>
                Latihan Menggunakan setx dan sety 🐢
              </h4>
            <p>
            Untuk lebih mudah memahami cara kerja perintah <code>setx</code> dan <code>sety</code>, ikuti instruksi dibawah ini
            </p>
            <ul style={{ color: '#444', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Tuliskan kode pada text editor sesuai instruksi di bawah ini.</li>
              <li>Klik <b>Run Code</b> atau tekan <b>Enter</b> untuk menjalankan perintah.</li>
              <li>Jika perintah yang dijalankan salah, klik <b>Undo</b> terlebih dahulu sebelum mencoba lagi.</li>
            </ul>
            <Row>
                {/* Kolom untuk Accordion */}
                <Col xs={12} md={3} style={{ fontSize: '15px', marginBottom: isMobile ? '20px' : '0' }}>
                  <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                  {[
                    { step: '1a', title: 'Ubah titik x', code: 'setx 100', description: 'Ubah nilai titik X bidawang yang awalnya berada di titik awal (0,0) ubah titik X nya menjadi 100 dengan perintah dibawah ini:' },
                    { step: '1b', title: 'Ubah titik y', code: 'sety -50', description: 'Kemudian lanjutkan untuk mengubah nilai titik Y menjadi -50 dengan perintah dibawah ini:' },
                    { step: '1c', title: 'Ubah titik x', code: 'setx 0', description: 'Lalu ubah lagi nilai titik X menjadi 0 dengan perintah dibawah ini:' }
                  ].map((step, index) => {
                    const isDisabled = index > 0 && !completedSteps.includes(`1${String.fromCharCode(96 + index)}`); // contoh: 1b, 1c
                    const isActive = activeKey === step.step;

                    return (
                      <AccordionItem
                        eventKey={step.step}
                        key={index}
                        style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
                      >
                        <AccordionHeader>
                          <b>{step.title}</b>
                          {completedSteps.includes(step.step) && (
                            <BsCheckCircle style={{ color: 'green', marginLeft: 10 }} />
                          )}
                        </AccordionHeader>
                        <AccordionBody>
                          <p>{step.description}</p>
                          <pre style={{ userSelect: 'none', pointerEvents: 'none' }}>
                            <code draggable={false}>{step.code}</code>
                          </pre>

                        </AccordionBody>
                      </AccordionItem>
                    );
                  })}

                  </Accordion>
                </Col>

                {/* Kolom untuk Editor dan Canvas */}
                <Col xs={12} md={9}>
                  <div className="skulpt-container" style={{ border: '2px solid #ccc',
                    borderRadius: '8px',
                    padding: '15px',
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    gap: '20px',
                    flexWrap: 'wrap',
                    width: '100%',
                    boxSizing: 'border-box', }}
                  >
                    {/* Editor Section */}
              <div
                className="editor-section"
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ width: '100%', maxWidth: '100%' }}>
                  <CodeMirror
                    value={pythonCode}
                    placeholder={'//Ketikan kode disini!'}
                    height="150px"
                    theme="light"
                    extensions={[closeBrackets({ brackets: '' })]}
                    onChange={(value) => setPythonCode(value)}
                    onKeyDown={handleKeyDown}
                    style={{ width: '100%' }}
                  />
                </div>
                <div
                  style={{
                    marginTop: '5px',
                    marginBottom: '5px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="success"
                    disabled={!pythonCode.trim()}
                    onClick={runAndCheck}
                  >
                    Run Code
                  </Button>
                  <Button
                    variant="warning"
                    disabled={commandHistory.length === 0}
                    onClick={undoLastCommand}
                  >
                    Undo
                  </Button>
                  <Button variant="secondary" onClick={resetCode}>
                    <BsArrowClockwise /> Reset
                  </Button>
                </div>
                <pre
                  style={{
                    height: '150px',
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    marginTop: '10px',
                  }}
                >
                  <b>History Commands:</b>
                  <br />
                  {commandHistory.map((cmd, idx) => `> ${cmd}\n`)}
                </pre>
                <pre className="output" style={{ height: 60, overflow: 'auto' }}>
                  {output}
                </pre>
              </div>

              {/* Canvas Section */}
              <div
                className="canvas-section"
                style={{
                  flex: isMobile ? 'none' : '0 0 400px',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: 400,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  overflowX: isMobile ? 'auto' : 'visible',
                }}
              >
                <div id="mycanvas" style={{ width: '100%' }}></div>
              </div>
            </div>
                </Col>
              </Row>
            </div> 

            <br></br>
            <hr/>

            <div
            style={{
              backgroundColor: '#F9F9F9',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              // maxWidth: '1000px',
              margin: 'auto',
              borderLeft: '5px solid #198754',
              borderRight: '5px solid #198754',
            }}>
              <h4
                style={{
                  color: 'black',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  // borderLeft: '5px solid #2DAA9E',
                  // paddingLeft: '10px',
                  marginBottom: '15px',
                  textAlign: 'center',
                }}
              >
                Kesimpulan
              </h4>
              <p>
              Perintah <code>setx</code> dan <code>sety</code> digunakan untuk memindahkan Bidawang secara horizontal atau vertikal tanpa mengubah koordinat lainnya. Perintah ini berguna untuk memindahkan Bidawang ke posisi yang diinginkan dengan lebih fleksibel, terutama saat mengatur pola atau jalur yang spesifik.
              </p>
            </div>
            
            <br/>
            <hr></hr>
            <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
            {/* Tantangan Accordion */}
            <Accordion.Item eventKey="1">
            <Accordion.Header><h4 style={{fontWeight: "bold", color:'black' }}>Tantangan</h4></Accordion.Header>
              <Accordion.Body>
                <p>
                Selesaikan tantangan dibawah ini!
                Klik tombol petunjuk untuk menampilkan petujuk pengerjaan.
                </p>
                <Button className='mb-2' variant="info" onClick={showHint} style={{ color: 'white', fontWeight: 'bold' }}>
                    Petunjuk
                  </Button>

                <div className="skulpt-container" style={{
                      border: "3px solid #ccc",
                      borderRadius: "10px",
                      padding: "15px",
                      // display: "flex",
                      // flexWrap: "wrap",
                      gap: "20px",
                      justifyContent: "center",
                      backgroundColor: "#f9f9f9",
                    }}>
                  <div className="editor-section">
                    <CodeMirror
                      value={pythonCodeChallanges}
                      placeholder={'//Ketikan kode disini!'}
                      height="290px"
                      theme="light"
                      extensions={[python()]}
                      onChange={(value) => setPythonCodeChallanges(value)}
                      style={{
                        border: "2px solid #198754",
                        borderRadius: "8px",
                        padding: "5px",
                      }}
                    />
                    <div style={{ marginTop: '5px', marginBottom: '5px', display: 'flex', gap: '10px' }}>
                      <Button variant="success" onClick={() => runitchallanges(pythonCodeChallanges)}>Run Code</Button>
                      <Button variant="secondary" onClick={resetCodeChallanges}>
                        <BsArrowClockwise /> Reset
                      </Button>
                      </div>
                    <pre className="output"style={{
                        height: "60px",
                        marginTop: '5px',
                        border: "2px solid #ccc",
                        borderRadius: "5px",
                        padding: "5px",
                        backgroundColor: "#fff",
                      }}>
                        {output}
                      </pre>
                  </div>
                  <div className="canvas-section" 
                  style={{
                    position: "relative",
                    width: "400px",
                    height: "405px",
                    borderRadius: "10px",
                    border: "3px solid #198754",
                    // overflow: "hidden"
                  }}>
                    <div id="mycanvas-challanges" style={{ 
                      width: 400, 
                      height: 400, 
                      position: "relative", 
                    }}></div>
                    
                      <img
                          src={map}
                          alt="Map"
                          style={{
                            position: "absolute",
                            left: "0px",
                            top: "0px",
                            width: "400px", // Sesuaikan ukuran jika perlu
                            height: "400px",
                          }}
                      />
                      <img
                          src={grid}
                          alt="Map"
                          style={{
                            position: "absolute",
                            left: "0px",
                            top: "0px",
                            width: "400px", // Sesuaikan ukuran jika perlu
                            height: "400px",
                          }}
                      />
                      <img
                          src={broccoli}
                          alt="Target Broccoli"
                          style={{
                            position: "absolute",
                            left: "275px",
                            top: "75px",
                            width: "50px", // Sesuaikan ukuran jika perlu
                            height: "50px",
                          }}
                      />
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

            <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
            {/* Kuis Accordion */}
            <Accordion.Item eventKey="0">
            <Accordion.Header>
                <h4 style={{ fontWeight: "bold", color:'black' }}>Pertanyaan</h4>
              </Accordion.Header>
              <Accordion.Body>
              <Form>
  {/* SOAL 1 */}
  {currentQuestion === 1 && (
    <Form.Group controlId="question1">
      <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
        <b>Soal 1 dari 2:</b>
        <p>Perhatikan kode perintah dibawah ini:</p>
        <pre><code> setx 200</code></pre>
        <p>Jika posisi bidawang saat ini adalah (100,50), Setelah kode tersebut dijalankan yang terjadi adalah ...</p>
      </Form.Label>

      {[
        { key: 'A', label: 'Posisi baru menjadi (200, 50).' },
        { key: 'B', label: 'Posisi baru menjadi (100, 200).' },
        { key: 'C', label: 'Posisi baru menjadi (200, 200).' },
        { key: 'D', label: 'Posisi baru tetap (100, 50).' },
      ].map(({ key, label }) => (
        <Button
          key={key}
          variant={selectedAnswer === key ? "success" : "outline-success"}
          onClick={() => handleAnswerChange("question1", key)}
          className="w-100 mb-2 text-start"
          style={{
            fontSize: "16px",
            backgroundColor: selectedAnswer === key ? "#2DAA9E" : "",
            borderColor: "#2DAA9E"
          }}
        >
          {key}. {label}
        </Button>
      ))}

      {feedback.question1 && (
        <Alert variant={feedback.question1 === "Benar! Perintah `setx 200` hanya mengubah nilai koordinat x menjadi 200, sementara y tetap 50, sehingga posisi baru adalah (200, 50)." ? "success" : "danger"} className="mt-3">
          {feedback.question1}
        </Alert>
      )}
    </Form.Group>
  )}

  {/* SOAL 2 */}
  {currentQuestion === 2 && (
    <Form.Group controlId="question2">
      <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
        <b>Soal 2 dari 2:</b>
        <p>Perhatikan kode perintah dibawah ini:</p>
        <pre><code>{`setx 100
sety -100`}</code></pre>
        <p>Setelah kode dijalankan, koordinat Bidawang saat ini adalah ...</p>
      </Form.Label>

      {[
        { key: 'A', label: '(100, 0)' },
        { key: 'B', label: '(0, -100)' },
        { key: 'C', label: '(100, -100)' },
        { key: 'D', label: '(-100, 100)' },
      ].map(({ key, label }) => (
        <Button
          key={key}
          variant={selectedAnswer2 === key ? "success" : "outline-success"}
          onClick={() => handleAnswerChange("question2", key)}
          className="w-100 mb-2 text-start"
          style={{
            fontSize: "16px",
            backgroundColor: selectedAnswer2 === key ? "#2DAA9E" : "",
            borderColor: "#2DAA9E"
          }}
        >
          {key}. {label}
        </Button>
      ))}

      {feedback.question2 && (
        <Alert variant={feedback.question2 === "Benar! Perintah `sety -50` memindahkan bidawang secara vertikal ke y = -50, tanpa mengubah posisi x." ? "success" : "danger"} className="mt-3">
          {feedback.question2}
        </Alert>
      )}
    </Form.Group>
  )}

  {/* TOMBOL NAVIGASI */}
  <div className="text-center mt-4 d-flex justify-content-between">
    <Button
      variant="secondary"
      onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
      disabled={currentQuestion === 1}
    >
      Sebelumnya
    </Button>

    <Button
      variant="primary"
      onClick={handleSubmit}
    >
      Periksa Jawaban
    </Button>

    <Button
      variant="secondary"
      onClick={() => setCurrentQuestion((prev) => Math.min(2, prev + 1))}
      disabled={
        (currentQuestion === 1 && feedback.question1 !== "Benar! Perintah `setx 200` hanya mengubah nilai koordinat x menjadi 200, sementara y tetap 50, sehingga posisi baru adalah (200, 50).") ||
        (currentQuestion === 2 && feedback.question2 !== "Benar()")
      }
    >
      Selanjutnya
    </Button>
  </div>
</Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          </div>
        </div>
        
      
    </div>
    
  )
}

export default SetXY
