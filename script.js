// Lấy API_URL từ cấu hình chung hoặc gán trực tiếp link Web App của Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbxw9_IwDZqka0NzwFKX9KihjvTP2-EEBsNGzxVBrPn4vQJMXMfwFQtsQTsliPA0xaRa/exec"; 

let hocSinhDangChon = null;

window.onload = function() {
    // Lấy mã trường từ biến toàn cục currentSession (đã được khởi tạo ở đầu trang)
    const maTruong = currentSession.maTruong || '';

    fetch(`${API_URL}?action=layDanhSachLop&maTruong=${encodeURIComponent(maTruong)}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('selectLop');
            if(!select) return;
            select.innerHTML = '<option value="">-- Chọn lớp học --</option>';
            if (data.dsLop) {
                data.dsLop.forEach(lop => {
                    select.innerHTML += `<option value="${lop}">${lop}</option>`;
                });
            }
        })
        .catch(err => console.error("Lỗi tải danh sách lớp:", err));
};

function taiDuLieuLop() {
    const selectLopEl = document.getElementById('selectLop');
    if (!selectLopEl) return;
    const tenLop = selectLopEl.value;
    if(!tenLop) return;

    const maTruong = currentSession.maTruong || '';

    fetch(`${API_URL}?action=kiemTraLop&tenLop=${encodeURIComponent(tenLop)}&maTruong=${encodeURIComponent(maTruong)}`)
        .then(res => res.json())
        .then(data => {
            if (data.chiTietHS) {
                hienThiDanhSachHS(data.chiTietHS);
            }
        })
        .catch(err => console.error("Lỗi tải dữ liệu lớp:", err));
}

function hienThiDanhSachHS(danhSach) {
    const container = document.getElementById('danhSachHSContainer');
    if (!container) return;
    container.innerHTML = '';
    
    if(!danhSach || danhSach.length === 0) {
        container.innerHTML = '<span class="text-sm text-slate-400 italic">Không có học sinh.</span>';
        return;
    }
    
    danhSach.forEach(hs => {
        const soLuongThieu = hs.thieu ? hs.thieu.length : 0;
        const badgeColor = soLuongThieu === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
        
        // Tạo thẻ div bọc danh sách học sinh an toàn
        const div = document.createElement('div');
        div.className = "p-3 bg-slate-50 hover:bg-blue-50 cursor-pointer rounded-xl border border-slate-100 flex justify-between items-center transition mb-2";
        div.innerHTML = `
            <div>
                <p class="text-sm font-semibold text-slate-800">${hs.tenHS}</p>
                <p class="text-xs text-slate-500">Mã: ${hs.maHS}</p>
            </div>
            <span class="text-xs font-bold px-2 py-1 rounded-lg ${badgeColor}">${soLuongThieu} thiếu</span>
        `;
        div.onclick = () => chonHocSinh(hs);
        container.appendChild(div);
    });
}

function chonHocSinh(hs) {
    hocSinhDangChon = hs;
    const card = document.getElementById('chiTietHSCard');
    const khungBR = document.getElementById('khungNhanTinBR');
    const noiDungBR = document.getElementById('noiDungBR');

    if (khungBR) khungBR.classList.remove('hidden');
    if (noiDungBR) noiDungBR.value = hs.ghiChuBR || '';

    if (!card) return;
    if(!hs.thieu || hs.thieu.length === 0) {
        card.innerHTML = `<p class="text-sm text-emerald-600 font-semibold">Học sinh <strong>${hs.tenHS}</strong> đã hoàn thành đầy đủ thông tin từ A đến BQ!</p>`;
    } else {
        let htmlList = hs.thieu.map(c => `<span class="bg-rose-50 text-rose-600 border border-rose-100 text-xs px-2.5 py-1 rounded-lg font-medium">${c}</span>`).join(' ');
        card.innerHTML = `
            <p class="text-sm font-semibold text-slate-800 mb-2">Học sinh: <span class="text-blue-600">${hs.tenHS}</span> còn thiếu các cột sau:</p>
            <div class="flex flex-wrap gap-2">${htmlList}</div>
        `;
    }
}

function luuNoiDungBR() {
    if(!hocSinhDangChon) return;
    const noiDungEl = document.getElementById('noiDungBR');
    if (!noiDungEl) return;
    const noiDung = noiDungEl.value;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ 
            action: 'luuBR', 
            rowNum: hocSinhDangChon.rowNum, 
            noiDung: noiDung,
            maTruong: currentSession.maTruong || '' 
        })
    })
    .then(res => res.json())
    .then(res => {
        alert(res.message || "Đã lưu thành công!");
        hocSinhDangChon.ghiChuBR = noiDung;
        taiDuLieuLop();
    })
    .catch(err => console.error("Lỗi lưu cột BR:", err));
}
