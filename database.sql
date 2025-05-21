

-- Bảng GiaiDau
CREATE TABLE GiaiDau (
    MaGiaiDau VARCHAR(20) PRIMARY KEY,
    TenGiai NVARCHAR(100) NOT NULL,
    ThoiGianBatDau DATETIME NOT NULL,
    ThoiGianKetThuc DATETIME NOT NULL,
    DiaDiem NVARCHAR(100)
);

-- Bảng NguoiDung
CREATE TABLE NguoiDung (
    MaND VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(100) NOT NULL,
    VaiTro VARCHAR(50) NOT NULL
);

-- Bảng DoiBong
CREATE TABLE DoiBong (
    MaDoi VARCHAR(20) PRIMARY KEY,
    TenDoi NVARCHAR(100) NOT NULL,
    NgayThanhLap DATE,
    SoLuongCauThu INT,
    Logo NVARCHAR(255),
    SanNha NVARCHAR(100)
);

-- Bảng CauThu
CREATE TABLE CauThu (
    MaCauThu VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE,
    ViTri NVARCHAR(50),
    SoAo INT,
    MaDoi VARCHAR(20) NOT NULL,
    FOREIGN KEY (MaDoi) REFERENCES DoiBong(MaDoi)
);

-- Bảng TranDau
CREATE TABLE TranDau (
    MaTranDau VARCHAR(20) PRIMARY KEY,
    MaGiaiDau VARCHAR(20),
    MaDoiNha VARCHAR(20),
    MaDoiKhach VARCHAR(20),
    BanThangDoiNha INT,
    BanThangDoiKhach INT,
    ThoiGian DATETIME,
    DiaDiem NVARCHAR(100),
    TrangThai NVARCHAR(20) DEFAULT 'Scheduled',
    FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau),
    FOREIGN KEY (MaDoiNha) REFERENCES DoiBong(MaDoi),
    FOREIGN KEY (MaDoiKhach) REFERENCES DoiBong(MaDoi)
);

-- Bảng LichThiDau
CREATE TABLE LichThiDau (
    MaLich VARCHAR(20) PRIMARY KEY,
    MaGiaiDau VARCHAR(20) NOT NULL,
    MaTran VARCHAR(20),
    NgayThiDau DATETIME NOT NULL,
    FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTranDau)
);

-- Bảng KetQua
CREATE TABLE KetQua (
    MaTranDau VARCHAR(20),
    TiSoDoi1 INT,
    TiSoDoi2 INT,
    GhiChu NVARCHAR(200),
    PRIMARY KEY (MaTranDau),
    FOREIGN KEY (MaTranDau) REFERENCES TranDau(MaTranDau)
);

-- Bảng BaoCaoGiai
CREATE TABLE BaoCaoGiai (
    MaBaoCao VARCHAR(20) PRIMARY KEY,
    MaGiaiDau VARCHAR(20),
    NoiDungBaoCao NVARCHAR(MAX),
    NgayLap DATE,
    VaiTro VARCHAR(50),
    FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau)
);

-- Bảng TranDau_CauThu
CREATE TABLE TranDau_CauThu (
    MaTranDau VARCHAR(20),
    MaCauThu VARCHAR(20),
    PRIMARY KEY (MaTranDau, MaCauThu),
    FOREIGN KEY (MaTranDau) REFERENCES TranDau(MaTranDau),
    FOREIGN KEY (MaCauThu) REFERENCES CauThu(MaCauThu)
);
