// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Inisialisasi Express
const app = express();
const port = 3000;

// Konfigurasi koneksi database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nusflix_manager_411222077'
}).promise();

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// === READ - Semua Data ===
app.get('/api/media', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// === READ - Berdasarkan ID ===
app.get('/api/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM media WHERE id_media = ?', [id]);
    if (rows.length > 0) res.status(200).json(rows[0]);
    else res.status(404).json({ message: 'Media tidak ditemukan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// === CREATE ===
app.post('/api/media', async (req, res) => {
  const { judul, tahun_rilis, genre } = req.body;

  if (!judul || !tahun_rilis || !genre) {
    return res.status(400).json({ message: 'Judul, Tahun Rilis, dan Genre harus diisi!' });
  }

  try {
    const sql = 'INSERT INTO media (judul, tahun_rilis, genre) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [judul, tahun_rilis, genre]);
    const mediabaru = { id_media: result.insertId, judul, tahun_rilis, genre };
    res.status(201).json(mediabaru);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// === UPDATE ===
app.put('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const { judul, tahun_rilis, genre } = req.body;

  if (!judul || !tahun_rilis || !genre) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  try {
    const sql = 'UPDATE media SET judul = ?, tahun_rilis = ?, genre = ? WHERE id_media = ?';
    const [result] = await db.query(sql, [judul, tahun_rilis, genre, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Media tidak ditemukan untuk diperbarui' });
    }

    const updatedMedia = { id_media: parseInt(id), judul, tahun_rilis, genre };
    res.status(200).json(updatedMedia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// === DELETE ===
app.delete('/api/media/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM media WHERE id_media = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Media tidak ditemukan untuk dihapus' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});
