import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const quizData = [
  {
    question: 'Perbedaan antara perintah left dan right adalah …',
    options: [
      'left memutar bidawang ke arah kanan, sementara right memutar bidawang ke arah kiri.',
      'left memutar bidawang ke arah kiri, sementara right memutar bidawang ke arah kanan.',
      'left dan right hanya digunakan untuk mengubah warna turtle.',
      'Keduanya memindahkan turtle ke posisi (0, 0).'
    ],
    answer: 'left memutar bidawang ke arah kiri, sementara right memutar bidawang ke arah kanan.'
  },
  {
    question: 'Jika bidawang menghadap ke kanan, lalu diberi perintah left 180, maka arah akhirnya adalah...',
    options: [
      'Kanan',
      'Atas',
      'Kiri',
      'Bawah'
    ],
    answer: 'Kiri'
  },
  {
    question: 'Dampak dari menjalankan perintah backward 50 setelah setheading 90 adalah …',
    options: [
      'Bidawang mundur ke arah barat',
      'Bidawang mundur ke arah selatan',
      'Bidawang maju ke utara',
      'Bidawang diam di tempat'
    ],
    answer: 'Bidawang mundur ke arah selatan'
  },
  {
    question: 'Apa perbedaan antara setposition 50 50 dan setx 50?',
    options: [
      'Keduanya sama',
      'setposition memindahkan ke (50,50), sedangkan setx hanya mengubah nilai X ke 50',
      'setx menghapus gambar',
      'setposition mengatur warna'
    ],
    answer: 'setposition memindahkan ke (50,50), sedangkan setx hanya mengubah nilai X ke 50'
  },
  {
    question: 'Hasil dari menjalankan perintah setx 200 jika posisi awal Bidawang adalah (100, 50) adalah …',
    options: [
      'Posisi baru menjadi (200, 50).',
      'Posisi baru menjadi (100, 200).',
      'Posisi baru menjadi (200, 200).',
      'Posisi baru tetap (100, 50).'
    ],
    answer: 'Posisi baru menjadi (200, 50).'
  },
  {
    question: 'Perhatikan kode perintah dibawah ini:```setheading 180\nforward 100\nhome\n```Arah terakhir Bidawang setelah perintah di atas adalah …',
    options: [
      'Timur',
      'Barat',
      'Utara',
      'Selatan'
    ],
    answer: 'Timur'
  },
  {
    question: 'Perintah home digunakan untuk …',
    options: [
      'Untuk menyimpan posisi.',
      'Untuk menghapus semua jalur.',
      'Untuk mengembalikan posisi awal agar lebih rapi.',
      'Untuk memutar arah ke barat.'
    ],
    answer: 'Untuk mengembalikan posisi awal agar lebih rapi.'
  },
  {
    question: 'Dampak dari menjalankan perintah home ketika posisi awal Bidawang adalah (100, 100) dan arahnya ke barat adalah …',
    options: [
      'Bidawang tetap di posisi (100, 100).',
      'Bidawang kembali ke posisi (0, 0) dengan arah tetap ke barat.',
      'Bidawang kembali ke posisi (0, 0) dan menghadap ke timur.',
      'Bidawang tetap di posisi (100, 100) tetapi menghadap ke timur.'
    ],
    answer: 'Bidawang kembali ke posisi (0, 0) dan menghadap ke timur.'
  },
  {
    question: 'Seorang siswa menggunakan circle 100 180, hasil yang terbentuk adalah...',
    options: [
      'Titik kecil.',
      'Busur setengah lingkaran.',
      'Lingkaran penuh.',
      'Lingkaran warna-warni.'
    ],
    answer: 'Busur setengah lingkaran.'
  },
  {
    question: 'Perintah yang paling tepat untuk menggambar dua titik sejajar secara horizontal dengan jarak 100 piksel adalah …',
    options: [
      'dot 20 → forward 100 → dot 20',
      'dot 20 → sety 100 → dot 20',
      'setx 100 → dot 20 → forward 100',
      'forward 100 → dot 20 → backward 100 → dot 20'
    ],
    answer: 'dot 20 → sety 100 → dot 20'
  }
];


  

const KuisPergerakanJawab = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hovered, setHovered] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = String(timeRemaining % 60).padStart(2, '0');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const hasFinishedRef = useRef(false);
  const answersRef = useRef({});
  const timerRef = useRef(null);

  const [progresBelajar, setProgresBelajar] = useState(27); 
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    Swal.fire({
      title: 'Selamat mengerjakan!',
      text: 'Kerjakan kuis dengan teliti dan semangat 💪',
      icon: 'info',
      confirmButtonText: 'Mulai',
      confirmButtonColor: '#3085d6'
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          if (isDataLoaded) {
            handleFinish();
          } else {
            // ⏳ Tunggu sampai data siap, lalu panggil handleFinish
            const interval = setInterval(() => {
              if (isDataLoaded) {
                clearInterval(interval);
                handleFinish();
              }
            }, 500);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  
    return () => clearInterval(timerRef.current);
  }, [isDataLoaded]);
  

  

useEffect(() => {
  const getTokenAndProgres = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
      setToken(response.data.accessToken);

      const progres = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`, {
        headers: {
          Authorization: `Bearer ${response.data.accessToken}`
        }
      });

      setProgresBelajar(progres.data.progres_belajar);
      setIsDataLoaded(true); // ✅ Set data siap
    } catch (error) {
      console.error("Gagal mengambil token/progres:", error);
      navigate("/login");
    }
  };

  getTokenAndProgres();
}, []);


  const handleOptionClick = (index) => {
    if (!showResult) {
      const updatedAnswers = { ...answers, [current]: index };
      setAnswers(updatedAnswers);
      answersRef.current = updatedAnswers;
    }
  };

  const [kkm, setKkm] = useState(80); // default sementara

  useEffect(() => {
    const fetchKKM = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/kkm/kuis`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setKkm(res.data.kkm);
      } catch (err) {
        console.error("Gagal mengambil KKM:", err);
      }
    };

    if (token) fetchKKM();
  }, [token]);

  const handleFinish = async () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    clearInterval(timerRef.current);

    let sc = 0;
    const wrong = [];

    quizData.forEach((q, idx) => {
      const selected = answersRef.current[idx];
      const selectedOption = q.options[selected];
      if (selectedOption === q.answer) {
        sc += 1;
      } else {
        wrong.push(idx);
      }
    });

    setScore(sc);
    setWrongAnswers(wrong);
    setShowResult(true);

    const nilaiAkhir = (sc / quizData.length) * 100;
    const kkmKuis2 = kkm?.kuis_2 ?? 70;

// ✅ Update progres jika memenuhi syarat
if (nilaiAkhir >= kkmKuis2 && progresBelajar === 10) {
  try {
    // 1. Update progres belajar
    await axios.put(
      `${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`,
      { progres_belajar: progresBelajar + 1 },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setProgresBelajar(prev => prev + 1);

    // 2. Update nilai kuis_1
    await axios.put(
      `${process.env.REACT_APP_API_ENDPOINT}/api/nilai/kuis-2`,
      { nilai: Math.round(nilaiAkhir) }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    Swal.fire({
      icon: 'success',
      title: 'Selesai!',
      html: `
        <p>Nilaimu: <b>${nilaiAkhir}</b></p>
        <p>Materi selanjutnya sudah terbuka 🎉</p>
        <p>Pilih "Tutup" jika ingin memeriksa kembali jawabanmu.</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Tutup'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/belajar/tellstate/position');
      }
    });

  } catch (error) {
    console.error("Gagal update progres:", error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Update Progres',
      text: 'Terjadi kesalahan saat memperbarui progres kamu.',
      confirmButtonColor: '#d33'
    });
  }

} else if (nilaiAkhir >= kkm && progresBelajar > 10) {
  // ⚠️ Sudah pernah menjawab kuis ini sebelumnya
  Swal.fire({
    icon: 'info',
    title: 'Sudah Pernah Menyelesaikan Kuis Ini',
    html: `
      <p>Nilaimu: <b>${nilaiAkhir}</b></p>
      <p>Kamu sudah menyelesaikan kuis ini sebelumnya.</p>
      <p>Tidak ada perubahan pada progres belajar kamu.</p>
    `,
    confirmButtonText: 'Mengerti'
  });

} else {
  // ❌ Nilai belum memenuhi
  Swal.fire({
    title: 'Nilai Belum Memenuhi 😕',
    icon: 'warning',
    html: `
      <p>Nilaimu: <b>${nilaiAkhir}</b></p>
      <p>Sayangnya kamu belum memenuhi syarat nilai minimal ${kkmKuis2}.</p>
      <p><b>Silakan baca ulang materi sebelumnya</b> lalu coba kerjakan ulang kuis ini ya 💪</p>
    `,
    confirmButtonText: 'Mengerti'
  }).then(() => {
    navigate('/belajar/turtlemotion/kuis');
  });
}}


  const isAnswered = (index) => answers.hasOwnProperty(index);
  const isWrong = (index) => wrongAnswers.includes(index);

  return (
    <Container fluid className="p-4" style={{ height: '100vh', fontFamily: 'Verdana, sans-serif' }}>
      <Row className="h-100">
        <Col xs={12} md={4} lg={3} className="mb-4">
          <Card className="w-100">
            <Card.Body className="d-flex flex-column w-100">
              <Card.Title style={{ fontSize: '16px', textAlign: 'left' }}>
                Soal kategori:<br />
                <span className="text-success">Pergerakan Turtle</span>
              </Card.Title>

              <div
                className="mt-3"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {quizData.map((_, i) => (
                  <Button
                    key={i}
                    variant={
                      current === i
                        ? 'secondary'
                        : showResult && answers[i] !== undefined && quizData[i].options[answers[i]] === quizData[i].answer
                        ? 'success'
                        : isWrong(i)
                        ? 'danger'
                        : isAnswered(i)
                          ? 'primary'
                          : 'outline-secondary'
                    }
                    onClick={() => setCurrent(i)}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: 0,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <div
                className="mt-3 w-100"
                style={{
                  fontSize: '14px',
                  textAlign: 'center',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                {timeRemaining > 0 ? `${minutes} menit : ${seconds} detik tersisa` : 'Waktu habis'}
              </div>

              {showResult && (
                <div className="mt-3 text-center">
                  <div className="fw-bold text-primary mb-2">
                    Nilai: {score} / {quizData.length}
                  </div>
                  <Button variant="warning" style={{width: '100%'}} onClick={() => navigate('/belajar/turtlemotion/kuis')}>
                    Kembali ke Materi
                  </Button>
                </div>
              )}

              {!showResult && (
                <Button className="mt-3" variant="danger" onClick={handleFinish}>
                  Selesai
                </Button>
              )}

            
              <div
                className="mt-3"
                style={{
                  fontSize: '13px',
                  color: '#555',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  padding: '10px',
                }}
              >
                <b>Keterangan warna tombol soal:</b>
                <ul style={{ paddingLeft: '0', marginTop: '8px', listStyle: 'none' }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '18px', height: '18px', backgroundColor: '#6c757d', borderRadius: '4px', marginRight: '8px' }}></div>
                    Soal yang sedang dipilih
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '18px', height: '18px', backgroundColor: '#0d6efd', borderRadius: '4px', marginRight: '8px' }}></div>
                    Soal sudah dijawab
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '18px', height: '18px', backgroundColor: '#dc3545', borderRadius: '4px', marginRight: '8px' }}></div>
                    Jawaban salah setelah menekan <b>Selesai</b>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '18px', height: '18px', backgroundColor: '#198754', borderRadius: '4px', marginRight: '8px' }}></div>
                    Jawaban benar setelah menekan <b>Selesai</b>
                  </li>
                </ul>
              </div>
            
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8} lg={9} className="d-flex flex-column">
          <Card className="h-100" style={{ paddingLeft: '50px', paddingRight: '50px', paddingBottom: '30px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
              <Card.Title>
              <div
                className="p-3 mb-3"
                style={{
                  display: "block",
                  backgroundColor: "#d1e7dd",
                  fontSize: "18px",
                  borderRadius: "5px",
                  color: "#0f5132",
                  whiteSpace: "pre-wrap"
                }}
              >
                {(() => {
                  const question = quizData[current].question;
                  const parts = question.split(/```/); // split jadi teks dan kode

                  return parts.map((part, index) => (
                    index % 2 === 0 ? (
                      // bagian teks biasa
                      <span key={index}>{part}<br /></span>
                    ) : (
                      // bagian kode
                      <pre key={index} style={{
                        backgroundColor: '#f8f9fa',
                        padding: '10px',
                        borderRadius: '5px',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        whiteSpace: 'pre-wrap',
                        marginTop: '10px'
                      }}>
                        <code>{part}</code>
                      </pre>
                    )
                  ));
                })()}
                </div>
              </Card.Title>

                <div className="d-flex flex-column gap-2">
                  {quizData[current].options.map((option, i) => {
                    const isSelected = answers[current] === i;
                    const isCorrectAnswer = option === quizData[current].answer;

                    let backgroundColor = '';
                    let textColor = '#198754';

                    if (showResult) {
                      if (isCorrectAnswer) {
                        backgroundColor = '#198754';
                        textColor = '#fff';
                      } else if (isSelected) {
                        backgroundColor = '#dc3545';
                        textColor = '#fff';
                      }
                    } else {
                      backgroundColor = isSelected || hovered === i ? '#198754' : '';
                      textColor = isSelected || hovered === i ? '#fff' : '#198754';
                    }

                    return (
                      <Button
                        key={i}
                        variant="outline-success"
                        onClick={() => handleOptionClick(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        className="w-100 p-2 text-start"
                        style={{
                          fontSize: "16px",
                          backgroundColor,
                          borderColor: "#198754",
                          color: textColor
                        }}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="primary"
                  onClick={() => setCurrent((prev) => Math.min(prev + 1, quizData.length - 1))}
                >
                  Selanjutnya <FaArrowAltCircleRight />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default KuisPergerakanJawab
