import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from "axios";
import { useNavigate } from "react-router-dom";


const quizData = [
  {
    question: 'Apa yang terjadi jika metode pendown tidak dipanggil setelah penup?',
    options: [
      'Bidawang akan terus menggambar saat bergerak.',
      'Bidawang akan berhenti bergerak.',
      'Bidawang tidak akan menggambar garis saat bergerak.',
      'Bidawang akan menggambar lingkaran secara otomatis.'
    ],
    answer: 'Bidawang tidak akan menggambar garis saat bergerak.'
  },
  {
    question: 'Perhatikan kode berikut:\npenup\nsetposition 100 100\npendown\nsetposition 200 200\nApa yang terjadi setelah kode tersebut dijalankan?',
    options: [
      'Bidawang menggambar garis dari titik awal ke (100, 100).',
      'Bidawang menggambar garis dari (100, 100) ke (200, 200).',
      'Bidawang tidak menggambar sama sekali.',
      'Bidawang hanya menggambar lingkaran.'
    ],
    answer: 'Bidawang menggambar garis dari (100, 100) ke (200, 200).'
  },
  {
    question: 'Apa efek dari penggunaan perintah pensize 10 sebelum menggambar?',
    options: [
      'Mengganti warna garis menjadi hitam.',
      'Mengubah ketebalan garis menjadi 10 piksel.',
      'Membuat garis tidak terlihat.',
      'Menghapus garis yang telah digambar.'
    ],
    answer: 'Mengubah ketebalan garis menjadi 10 piksel.'
  },
  {
    question: 'Jika kode berikut dijalankan:\npensize 5\ncircle 30\npensize 2\ncircle 50\nApa yang akan terlihat pada hasil akhir?',
    options: [
      'Dua lingkaran dengan ketebalan garis yang sama.',
      'Lingkaran pertama memiliki garis lebih tebal daripada lingkaran kedua.',
      'Lingkaran kedua memiliki garis lebih tebal daripada lingkaran pertama.',
      'Tidak ada lingkaran yang digambar.'
    ],
    answer: 'Lingkaran pertama memiliki garis lebih tebal daripada lingkaran kedua.'
  },
  {
    question: 'Apa yang dikembalikan oleh metode isdown jika pena sedang dalam posisi turun?',
    options: [
      'True',
      'False',
      'None',
      'Error'
    ],
    answer: 'True'
  },
  {
    question: 'Perhatikan kode berikut:\npendown\nprint isdown\npenup\nprint isdown\nApa output dari kode tersebut?',
    options: [
      'True, False',
      'False, True',
      'True, True',
      'False, False'
    ],
    answer: 'True, False'
  },
  {
    question: 'Apa yang terjadi jika kode berikut dijalankan?\npencolor "red"\nforward 100',
    options: [
      'Bidawang menggambar garis merah sepanjang 100 piksel.',
      'Bidawang menggambar garis hitam sepanjang 100 piksel.',
      'Bidawang menggambar garis tanpa warna sepanjang 100 piksel.',
      'Bidawang tidak menggambar garis.'
    ],
    answer: 'Bidawang menggambar garis merah sepanjang 100 piksel.'
  },
  {
    question: 'Apa format yang tidak valid untuk parameter warna dalam fungsi pencolor?',
    options: [
      '"blue"',
      '"#00FF00"',
      '(1,0,0)',
      '"bold_red"'
    ],
    answer: '"bold_red"'
  },
  {
    question: 'Perhatikan kode berikut:\nforward 100\nbegin_fill\ncircle 50\nend_fill\nApa hasil dari kode tersebut?',
    options: [
      'Sebuah lingkaran dengan warna garis kuning tanpa isian.',
      'Sebuah lingkaran dengan warna isian kuning.',
      'Sebuah lingkaran dengan warna garis hitam dan isian kuning.',
      'Tidak ada lingkaran yang digambar.'
    ],
    answer: 'Sebuah lingkaran dengan warna garis hitam dan isian kuning.'
  },
  {
    question: 'Apa fungsi dari end_fill dalam proses pengisian warna?',
    options: [
      'Mengatur warna isian menjadi transparan.',
      'Menandai akhir area yang akan diisi warna.',
      'Menonaktifkan pengaturan warna pada turtle.',
      'Menghapus warna isian dari bentuk yang digambar.'
    ],
    answer: 'Menandai akhir area yang akan diisi warna.'
  }
];



const KuisPenColorControlJawab = () => {
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

// ✅ Update progres jika memenuhi syarat
if (nilaiAkhir >= kkm && progresBelajar === 21) {
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

    // 2. Update nilai kuis_4
    await axios.put(
      `${process.env.REACT_APP_API_ENDPOINT}/api/nilai/kuis-4`,
      { nilai: Math.round(nilaiAkhir) }, // Jika kamu ingin integer
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
        <p>Nilaimu: <strong>${nilaiAkhir}</strong> </p>
        <p>Materi selanjutnya sudah terbuka 🎉</p>
        <p>Pilih "Tutup" jika ingin memeriksa kembali jawabanmu.</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Tutup'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/belajar/moredrawingcontrol/reset');
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

} else if (nilaiAkhir >= kkm && progresBelajar > 21) {
  // ⚠️ Sudah pernah menjawab kuis ini sebelumnya
  Swal.fire({
    icon: 'info',
    title: 'Sudah Pernah Menyelesaikan Kuis Ini',
    html: `
      <p>Nilaimu: <strong>${nilaiAkhir}</strong></p>
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
      <p>Nilaimu: <strong>${nilaiAkhir}</strong></p>
      <p>Sayangnya kamu belum memenuhi syarat nilai minimal ${kkm}.</p>
      <p><strong>Silakan baca ulang materi sebelumnya</strong> lalu coba kerjakan ulang kuis ini ya 💪</p>
    `,
    confirmButtonText: 'Mengerti'
  }).then(() => {
    navigate('/belajar/pencontrol/penuppendown');
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
                <span className="text-success">Kontrol Pena dan Warna</span>
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
                        : isWrong(i)
                        ? 'danger'
                        : isAnswered(i)
                          ? 'success'
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
                <div className="mt-2 text-center fw-bold text-primary">
                  Nilai: {score} / {quizData.length}
                </div>
              )}

              {!showResult && (
                <Button className="mt-3" variant="danger" onClick={handleFinish}>
                  Selesai
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8} lg={9} className="d-flex flex-column">
          <Card className="h-100" style={{ paddingLeft: '50px', paddingRight: '50px', paddingBottom: '30px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title as="h4" className="mb-4">
                  <div
                    className="p-3 mb-3"
                    style={{
                      display: "block",
                      backgroundColor: "#d1e7dd",
                      fontSize: "18px",
                      borderRadius: "5px",
                      color: "#0f5132"
                    }}
                  >
                    {quizData[current].question}
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

export default KuisPenColorControlJawab
