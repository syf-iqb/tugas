const API = '/api/produk';
const $ = id => document.getElementById(id);
let kodeProdukEdit = null;

const form = $('formProduk');
const tabel = $('dataProduk');
const pesan = $('pesan');

function tampilPesan(teks) {
    pesan.textContent = teks;
}
async function muatData() {
    try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Gagal mengambil data');

    const data = await res.json();
    tampilkanTabel(data);
    } 
    catch (error) {
    tampilPesan(error.message);
    }
}

function tampilkanTabel(data) {
  tabel.replaceChildren();
  data.forEach(m => {
    const tr = document.createElement('tr');
    
    [m.kode_produk, m.nama_produk, m.harga, m.stok].forEach(nilai => {
      const td = document.createElement('td');
      td.textContent = nilai;
      tr.appendChild(td);
    });
    
    const aksi = document.createElement('td');
    
    // TAMBAHAN: Tombol Beli
    const beli = document.createElement('button');
    beli.textContent = 'Beli';
    beli.onclick = () => beliProduk(m.kode_produk);

    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => mulaiEdit(m);

    const hapus = document.createElement('button');
    hapus.textContent = 'Hapus';
    hapus.onclick = () => hapusData(m.kode_produk);

    aksi.append(beli, edit, hapus); // Masukkan tombol beli ke dalam aksi
    tr.appendChild(aksi);
    tabel.appendChild(tr);
  });
}

async function beliProduk(kode_produk) {
  // Munculkan popup sederhana untuk meminta jumlah yang ingin dibeli
  const jumlah_beli = prompt(`Berapa jumlah produk ${kode_produk} yang ingin dibeli?`, "1");
  
  // Validasi input
  if (!jumlah_beli || isNaN(jumlah_beli) || jumlah_beli <= 0) {
    tampilPesan('Jumlah beli tidak valid atau dibatalkan.');
    return;
  }

  try {
    const url = API + '/' + encodeURIComponent(kode_produk) + '/beli';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah_beli: parseInt(jumlah_beli) })
    });
    
    const dataRes = await res.json();
    if (!res.ok) throw new Error(dataRes.pesan || 'Gagal melakukan transaksi');
    
    await muatData(); // Refresh tabel agar stok terbaru langsung tampil
    tampilPesan('Transaksi berhasil: ' + dataRes.pesan);
  } catch (err) {
    tampilPesan(err.message);
  }
}

async function simpanData(data) {
  try {
    const url = kodeProdukEdit
      ? API + '/' + encodeURIComponent(kodeProdukEdit) : API;
    const res = await fetch(url, {
      method: kodeProdukEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Gagal menyimpan data');
    batalEdit();
    await muatData();
    tampilPesan('Data berhasil disimpan');
  } catch (err) { tampilPesan(err.message); }
}

function mulaiEdit(m) {
  kodeProdukEdit = m.kode_produk;
  $('kode_produk').value = m.kode_produk;
  $('kode_produk').disabled = true;
  $('nama_produk').value = m.nama_produk;
  $('harga').value = m.harga;
  $('stok').value = m.stok;
  $('btnSimpan').textContent = 'Perbarui';
}

function batalEdit() {
  kodeProdukEdit = null;
  form.reset();
  $('kode_produk').disabled = false;
  $('btnSimpan').textContent = 'Simpan';
}

async function hapusData(kode_produk) {
  if (!confirm('Hapus produk ' + kode_produk + '?')) return;
  try {
    const url = API + '/' + encodeURIComponent(kode_produk);
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus');
    if (kodeProdukEdit === kode_produk ) batalEdit();
    await muatData();
    tampilPesan('Data berhasil dihapus');
  } catch (err) {
    tampilPesan(err.message);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    kode_produk: $('kode_produk').value.trim(),
    nama_produk: $('nama_produk').value.trim(),
    harga: $('harga').value.trim(),
    stok: $('stok').value.trim()
  };

  await simpanData(data);
});

$('btnBatal').addEventListener('click', batalEdit);
muatData();
