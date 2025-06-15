import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const quizData = [
  {
    question: 'Perbedaan utama antara perintah left dan right adalah ...',
    options: [
      'left memutar bidawang ke arah kanan, sementara right memutar bidawang ke arah kiri.',
      'left memutar bidawang ke arah kiri, sementara right memutar bidawang ke arah kanan.',
      'left dan right hanya digunakan untuk mengubah warna turtle.',
      'Keduanya memindahkan turtle ke posisi (0, 0).'
    ],
    answer: 'left memutar bidawang ke arah kiri, sementara right memutar bidawang ke arah kanan.'
  },
  {
    question: 'Perhatikan kode perintah berikut:```right(90)\nbackward(100)```Jika awalnya Bidawang menghadap ke kanan, posisi bidawang setelah kode dijalankan adalah ...',
    options: [
      '100 piksel di atas titik awal',
      '100 piksel di bawah titik awal',
      '100 piksel ke kanan titik awal',
      '100 piksel ke kiri titik awal'
    ],
    answer: '100 piksel di atas titik awal'
  },
  {
    question: 'Seorang siswa ingin menggambar segitiga dengan menggunakan tiga titik koordinat: (0,0), (100,0), dan (50,100). Urutan perintah setposition yang tepat untuk menggambar bentuk segitiga adalah ...',
    options: [
      'setposition 100 0 → setposition 50 100 → setposition 0 0',
      'setposition 0 0 → setposition 100 100 → setposition 0 100',
      'setposition 0 0 → setposition 50 50 → setposition 0 100',
      'setposition 50 100 → setposition 0 0 → setposition 100 0'
    ],
    answer: 'setposition 100 0 → setposition 50 100 → setposition 0 0'
  },
  {
    question: 'Perhatikan kode perintah berikut:```setx 200```Jika posisi bidawang saat ini adalah (100,50), Setelah kode tersebut dijalankan yang terjadi adalah ...',
    options: [
      'Posisi baru menjadi (200, 50).',
      'Posisi baru menjadi (100, 200).',
      'Posisi baru menjadi (200, 200).',
      'Posisi baru tetap (100, 50).'
    ],
    answer: 'Posisi baru menjadi (200, 50).'
  },
  {
    question: 'Hasil dari menjalankan perintah circle 50 adalah ...',
    options: [
      'Tidak ada lingkaran yang Digambar.',
      'Lingkaran dengan jari-jari 50 akan digambar.',
      'Lingkaran dengan jari-jari 100 akan digambar.',
      'Bidawang akan bergerak maju 50 langakah.'
    ],
    answer: 'Lingkaran dengan jari-jari 50 akan digambar.'
  },
  {
    question: 'Hasil dari penggunaan perintah home saat posisi Bidawang berada di (100, 100) dan menghadap ke barat adalah ...',
    options: [
      'Bidawang tetap di posisi (100, 100).',
      'Bidawang kembali ke posisi (0, 0) dengan arah tetap ke barat.',
      'Bidawang kembali ke posisi (0, 0) dan menghadap ke timur.',
      'Bidawang tetap di posisi (100, 100) tetapi menghadap ke timur.'
    ],
    answer: 'Bidawang kembali ke posisi (0, 0) dan menghadap ke timur.'
  },
  {
    question: 'Jenis data yang dikembalikan oleh perintah position adalah ...',
    options: [
      'Bilangan bulat',
      'Pasangan koordinat (x, y)',
      'Teks berwarna',
      'Derajat arah sudut'
    ],
    answer: 'Pasangan koordinat (x, y)'
  },
  {
    question: 'Perhatikan kode perintah berikut:```setx 50\nsety -75\nprint xcor\nprint ycor```Hasil yang muncul pada Output Log setelah perintah dijalankan adalah ...',
    options: [
      '(50, -75)',
      'x: 50 dan y: -75',
      'xcor = 0 dan ycor = -75',
      'xcor = 50 dan ycor =-75'
    ],
    answer: '(50, -75)'
  },
  {
    question: 'Perhatikan kode perintah berikut:```right 90\nprint heading```Nilai yang akan muncul pada Output Log adalah ...',
    options: [
      '0',
      '90',
      '180',
      '270'
    ],
    answer: '90'
  },
  {
    question: 'Jika arah awal Bidawang adalah 0°, lalu dijalankan kode berikut:```right 45\nleft 90\nprint heading```Nilai yang ditampilkan pada Output Log adalah ...',
    options: [
      '45',
      '90',
      '315',
      '135'
    ],
    answer: '45'
  },
  {
    question: 'Ketika kode perintah pendown tidak dipanggil setelah penup maka yang terjadi adalah ...',
    options: [
      'Bidawang akan terus menggambar saat bergerak.',
      'Bidawang akan berhenti bergerak.',
      'Bidawang tidak akan menggambar garis saat bergerak.',
      'Bidawang akan menggambar lingkaran secara otomatis.'
    ],
    answer: 'Bidawang tidak akan menggambar garis saat bergerak.'
  },
  {
    question: 'Perhatikan kode berikut:```penup\nsetposition 100 100\npendown\nsetposition 200 200```Hasil dari kode perintah tersebut ketika dijalankan adalah ...',
    options: [
      'Bidawang menggambar garis dari titik awal ke (100, 100).',
      'Bidawang menggambar garis dari (100, 100) ke (200, 200).',
      'Bidawang tidak menggambar sama sekali.',
      'Bidawang hanya menggambar lingkaran.'
    ],
    answer: 'Bidawang menggambar garis dari (100, 100) ke (200, 200).'
  },
  {
    question: 'Hasil dari penggunaan fungsi pensize 10 sebelum menggambar adalah ...',
    options: [
      'Mengganti warna garis menjadi hitam.',
      'Mengubah ketebalan garis menjadi 10 piksel.',
      'Membuat garis tidak terlihat.',
      'Menghapus garis yang telah digambar.'
    ],
    answer: 'Mengubah ketebalan garis menjadi 10 piksel.'
  },
  {
    question: 'Nilai yang dikembalikan oleh kode perintah isdown ketika pena berada dalam posisi turun adalah …',
    options: [
      'True',
      'False',
      'None',
      'Error'
    ],
    answer: 'True'
  },
  {
    question: 'Fungsi dari end_fill dalam proses pengisian warna adalah …',
    options: [
      'Mengatur warna isian menjadi transparan.',
      'Menandai akhir area yang akan diisi warna.',
      'Menonaktifkan pengaturan warna pada turtle.',
      'Menghapus warna isian dari bentuk yang digambar.'
    ],
    answer: 'Menandai akhir area yang akan diisi warna.'
  },
  {
    question: 'Ketika kode perintah reset dijalankan setelah menggambar garis, maka hal yang akan terjadi adalah …',
    options: [
      'Semua gambar dihapus, tetapi atribut bidawang tetap sama.',
      'Semua gambar dihapus, dan bidawang kembali ke posisi awal dengan atribut default.',
      'Garis tidak dihapus, tetapi posisi bidawang berubah.',
      'Bidawang akan keluar dari jendela.'
    ],
    answer: 'Semua gambar dihapus, dan bidawang kembali ke posisi awal dengan atribut default.'
  },
  {
    question: 'Perbedaan antara fungsi clear dan reset adalah ...',
    options: [
      'clear menghapus gambar tanpa mengubah posisi atau atribut, sedangkan reset juga mengatur ulang posisi dan atribut bidawang.',
      'clear menghapus gambar beserta posisi bidawang, sedangkan reset hanya menghapus gambar.',
      'clear tidak menghapus gambar, sedangkan reset menghapus gambar.',
      'clear menutup jendela, sedangkan reset tidak.'
    ],
    answer: 'clear menghapus gambar tanpa mengubah posisi atau atribut, sedangkan reset juga mengatur ulang posisi dan atribut bidawang.'
  },
  {
    question: 'Perhatikan kode berikut:```write("Belajar Python!", align="center", font=("Arial", 12, "italic"))```Hasil dari kode perintah tersebut ketika dijalankan adalah ...',
    options: [
      'Teks ditulis di layar dengan font Arial, ukuran 12, dan bergaya italic di posisi kiri bidawang.',
      'Teks ditulis di layar dengan font Arial, ukuran 12, dan bergaya italic di posisi tengah bidawang.',
      'Teks ditulis di layar dengan font Arial, ukuran 12, tetapi tidak bergaya italic.',
      'Tidak ada teks yang ditulis karena font tidak valid.'
    ],
    answer: 'Teks ditulis di layar dengan font Arial, ukuran 12, dan bergaya italic di posisi tengah bidawang.'
  },
  {
    question: 'Manfaat penggunaan perulangan for dalam membuat pola gambar dengan Bidawang adalah ...',
    options: [
      'Menghapus kode secara otomatis',
      'Mengubah arah turtle secara acak',
      'Mempercepat dan mempersingkat kode yang berulang',
      'Menyimpan file hasil gambar'
    ],
    answer: 'Mempercepat dan mempersingkat kode yang berulang'
  },
  {
    question: 'Perhatikan kode berikut:```for 4\n   forward 100\n   left 90```Gambar yang akan dihasilkan saat kode tersebut dijalankan adalah ...',
    options: [
      'Persegi',
      'Lingkaran',
      'Bintang',
      'Segitiga'
    ],
    answer: 'Persegi'
  }
];


const EvaluasiJawab = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hovered, setHovered] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(1200);
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
if (nilaiAkhir >= kkm && progresBelajar === 27) {
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

    // 2. Update nilai evaluasi
    await axios.put(
      `${process.env.REACT_APP_API_ENDPOINT}/api/nilai/evaluasi`,
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
        <p>Nilaimu: <b>${nilaiAkhir}</b></p>
        <p>Kamu telah selesai memperlajari semua materi 🎉</p>
        <p>Pilih "Tutup" jika ingin memeriksa kembali jawabanmu.</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Tutup'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/belajar/evaluasi');
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

} else if (nilaiAkhir >= kkm && progresBelajar > 27) {
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
      <p>Sayangnya kamu belum memenuhi syarat nilai minimal ${kkm}.</p>
      <p><b>Silakan baca ulang materi sebelumnya</b> lalu coba kerjakan ulang kuis ini ya 💪</p>
    `,
    confirmButtonText: 'Mengerti'
  }).then(() => {
    navigate('/belajar/evaluasi');
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
                <span className="text-success">Evaluasi</span>
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
                  <Button variant="warning" style={{width: '100%'}} onClick={() => navigate('/belajar/moredrawingcontrol/kuis')}>
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

export default EvaluasiJawab
