const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/produk', async (req, res) => {
try {
    const [rows] = await db.query('SELECT * FROM produk');
    res.json(rows);
} catch (err) {
    res.status(500).json({ pesan: 'Gagal mengambil data' });
}
});

app.post('/api/produk', async (req, res) => {
  const { kode_produk, nama_produk, harga, stok } = req.body;
  if (!kode_produk || !nama_produk || !harga || !stok)
    return res.status(400).json({ pesan: 'Isi semua kolom' });
  try {
    await db.execute(
    'INSERT INTO produk (kode_produk,nama_produk,harga,stok) VALUES (?,?,?,?)',
    [kode_produk, nama_produk, harga, stok]
    );
    res.status(201).json({ pesan: 'Data ditambahkan' });
  } catch (err) {
    res.status(400).json({ pesan: 'Kode produk sudah ada / data salah' });
  }
});

app.put('/api/produk/:kode_produk', async (req, res) => {
  const { nama_produk, harga, stok } = req.body;
  if (!nama_produk || !harga || !stok)
    return res.status(400).json({ pesan: 'Isi semua kolom' });
  try {
    const [hasil] = await db.execute(
      'UPDATE produk SET nama_produk=?,harga=?,stok=? WHERE kode_produk=?',
      [nama_produk, harga, stok, req.params.kode_produk]
    );
    if (!hasil.affectedRows) return res.sendStatus(404);
    res.json({ pesan: 'Data diperbarui' });
  } catch (err) { res.sendStatus(500); }
});

app.delete('/api/produk/:kode_produk', async (req, res) => {
  try {
    const [hasil] = await db.execute(
    'DELETE FROM produk WHERE kode_produk=?', [req.params.kode_produk]
    );
    if (!hasil.affectedRows) return res.sendStatus(404);
    res.json({ pesan: 'Data dihapus' });
  } catch (err) { res.sendStatus(500); }
});

// Mengurangi jumlah stok
app.post('/api/produk/:kode_produk/beli', async (req, res) => {
  const { jumlah_beli } = req.body;
  const kode_produk = req.params.kode_produk;

  if (!jumlah_beli || jumlah_beli <= 0) {
    return res.status(400).json({ pesan: 'Masukkan jumlah beli yang valid' });
  }
  try {
    const [rows] = await db.execute('SELECT stok FROM produk WHERE kode_produk=?', [kode_produk]);
    if (rows.length === 0) return res.status(404).json({ pesan: 'Produk tidak ditemukan' });    
    const stok_saat_ini = rows[0].stok;
    if (stok_saat_ini < jumlah_beli) {
      return res.status(400).json({ pesan: 'Stok tidak mencukupi untuk transaksi ini' });
    }
    await db.execute(
      'UPDATE produk SET stok = stok - ? WHERE kode_produk = ?',
      [jumlah_beli, kode_produk]
    );
    res.json({ pesan: 'Transaksi berhasil, stok telah dikurangi' });
  } catch (err) {
    res.status(500).json({ pesan: 'Terjadi kesalahan saat memproses transaksi' });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));
