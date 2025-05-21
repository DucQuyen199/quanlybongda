-- Bảng GiaiDau
CREATE TABLE GiaiDau (
    MaGiaiDau VARCHAR2(20) PRIMARY KEY,
    TenGiai NVARCHAR2(100),
    ThoiGianBatDau DATE,
    ThoiGianKetThuc DATE,
    DiaDiem NVARCHAR2(100)
);

-- Bảng NguoiDung
CREATE TABLE NguoiDung (
    MaND VARCHAR2(20) PRIMARY KEY,
    HoTen NVARCHAR2(100),
    TenDangNhap VARCHAR2(50),
    MatKhau VARCHAR2(100),
    VaiTro VARCHAR2(50)
);

-- Bảng DoiBong
CREATE TABLE DoiBong (
    MaCauThu VARCHAR2(20) PRIMARY KEY,
    HoTen NVARCHAR2(100),
    NgaySinh DATE,
    SoLuongCauThu NUMBER,
    Logo NVARCHAR2(100)
);

-- Bảng CauThu
CREATE TABLE CauThu (
    MaCauThu VARCHAR2(20) PRIMARY KEY,
    HoTen NVARCHAR2(100),
    NgaySinh DATE,
    ViTri NVARCHAR2(50),
    SoAo NUMBER,
    MaDoi VARCHAR2(20),
    FOREIGN KEY (MaDoi) REFERENCES DoiBong(MaCauThu)
);

-- Bảng TranDau
CREATE TABLE TranDau (
    MaTran VARCHAR2(20) PRIMARY KEY,
    MaDoi1 VARCHAR2(20),
    MaDoi2 VARCHAR2(20),
    ThoiGianThiDau DATE,
    SanThiDau NVARCHAR2(100),
    Vong NVARCHAR2(50),
    FOREIGN KEY (MaDoi1) REFERENCES DoiBong(MaCauThu),
    FOREIGN KEY (MaDoi2) REFERENCES DoiBong(MaCauThu)
);

-- Bảng LichThiDau
CREATE TABLE LichThiDau (
    MaLich VARCHAR2(20) PRIMARY KEY,
    MaGiaiDau VARCHAR2(20),
    MaTran VARCHAR2(20),
    NgayThiDau DATE,
    FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTran)
);

-- Bảng KetQua
CREATE TABLE KetQua (
    MaTran VARCHAR2(20),
    TiSoDoi1 NUMBER,
    TiSoDoi2 NUMBER,
    GhiChu NVARCHAR2(200),
    PRIMARY KEY (MaTran),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTran)
);

-- Bảng BaoCaoGiai
CREATE TABLE BaoCaoGiai (
    MaBaoCao VARCHAR2(20) PRIMARY KEY,
    MaGiaiDau VARCHAR2(20),
    NoiDungBaoCao CLOB,
    NgayLap DATE,
    VaiTro VARCHAR2(50),
    FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau)
);

-- Bảng TranDau_CauThu (giả định đây là bảng trung gian)
CREATE TABLE TranDau_CauThu (
    MaTran VARCHAR2(20),
    MaCauThu VARCHAR2(20),
    PRIMARY KEY (MaTran, MaCauThu),
    FOREIGN KEY (MaTran) REFERENCES TranDau(MaTran),
    FOREIGN KEY (MaCauThu) REFERENCES CauThu(MaCauThu)
);
