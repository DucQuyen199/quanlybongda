
    create database bongda;
    use bongda

    select * from nguoidung;
CREATE TABLE GiaiDau (
    MaGiaiDau VARCHAR(20) PRIMARY KEY,
    TenGiai NVARCHAR(100),
    ThoiGianBatDau DATE,
    ThoiGianKetThuc DATE,
    DiaDiem NVARCHAR(100)
);

-- Bảng NguoiDung
CREATE TABLE NguoiDung (
    MaND VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100),
    TenDangNhap VARCHAR(50),
    MatKhau VARCHAR(100),
    VaiTro VARCHAR(50)
);

CREATE TABLE DoiBong (
    MaCauThu VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100),
    NgaySinh DATE,
    SoLuongCauThu INT,
    Logo NVARCHAR(100)
);


-- Bảng CauThu
CREATE TABLE CauThu (
    MaCauThu VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100),
    NgaySinh DATE,
    ViTri NVARCHAR(50),
    SoAo INT,
    MaDoi VARCHAR(20),
    FOREIGN KEY (MaDoi) REFERENCES DoiBong(MaCauThu)
);

-- Bảng TranDau
CREATE TABLE TranDau (
    MaTran VARCHAR(20) PRIMARY KEY,
    MaDoi1 VARCHAR(20),
    MaDoi2 VARCHAR(20),
    ThoiGianThiDau DATE,
    SanThiDau NVARCHAR(100),
    Vong NVARCHAR(50),
    FOREIGN KEY (MaDoi1) REFERENCES DoiBong(MaCauThu),
    FOREIGN KEY (MaDoi2) REFERENCES DoiBong(MaCauThu)
);

-- Bảng LichThiDau
CREATE TABLE LichThiDau (
    MaLich VARCHAR(20) PRIMARY KEY,
    MaGiaiDau VARCHAR(20),
    MaTran VARCHAR(20),
    NgayThiDau DATE,
    FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTran)
);

-- Bảng KetQua
CREATE TABLE KetQua (
    MaTran VARCHAR(20),
    TiSoDoi1 INT,
    TiSoDoi2 INT,
    GhiChu NVARCHAR(200),
    PRIMARY KEY (MaTran),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTran)
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

-- Bảng TranDau_CauThu (giả định đây là bảng trung gian)
CREATE TABLE TranDau_CauThu (
    MaTran VARCHAR(20),
    MaCauThu VARCHAR(20),
    PRIMARY KEY (MaTran, MaCauThu),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTran),
    FOREIGN KEY (MaCauThu) REFERENCES CauThu(MaCauThu)
);
