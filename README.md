# Denvea Form Hub & CRM Portal

Denvea, çoklu marka (multi-tenant) yapısını destekleyen, dinamik form oluşturma, veri toplama, kullanıcı yönetimi ve gelişmiş analitik raporlama özelliklerine sahip modern bir CRM ve form yönetim platformudur.

Kullanıcıların kendi formlarını tasarlayıp yayınlayabilmelerini, bu formlardan gelen yanıtları detaylı grafiklerle analiz edebilmelerini ve markalara özel portal arayüzleri sunabilmelerini sağlar.

---

## Temel Özellikler

### 1. Yönetici (Admin) Paneli
* **Dashboard (Genel Bakış):** Toplam form, veri ve marka istatistikleri. Son 7 günün katılım trend grafiği, marka bazlı katılım dağılımları ve detaylı performans özetleri.
* **Dinamik Form Oluşturucu (Form Builder):** `@dnd-kit` destekli sürükle-bırak arayüzü ile form başlıkları, bölümleri (section) ve alanları tasarlama. Metin, telefon, e-posta, tarih, dosya, tekli/çoklu seçim ogrenci listeleri ve Türkiye il-ilçe bağlı listeleri gibi gelişmiş alan tipleri tanımlama.
* **Katılım ve Yanıt Yönetimi (Submissions):** Gelen form yanıtlarını marka, form türü ve tarih aralığına göre filtreleme. Detaylı yanıt kartları ve Türkçe karakter desteğine uygun (UTF-8 BOM) tek tıkla Excel/CSV dışa aktarım (export).
* **Kullanıcı ve Yetki Yönetimi:** Sisteme yönetici (Admin) veya içerik üretici (Editor) ekleme. Editörler için marka bazlı kısıtlama (`allowedBrands`) atayarak yalnızca izin verilen verileri görmelerini sağlama.
* **Detaylı Raporlama ve Analiz:** Form bazında son 30 günün katılım grafiği, il dağılımı, test/seçim sorularının oranlarını gösteren pasta grafikleri ve son yanıtların listesi.

### 2. Kullanıcı Portalı (Portal)
* **Marka Seçimi:** Bioderma, The Purest Solutions, La Roche-Posay ve CeraVe markaları için optimize edilmiş giriş kapısı.
* **Dinamik Form Arayüzü:** Yönetici panelinde tasarlanan form şemalarını gerçek zamanlı olarak marka renkleri ve biçimlerine (örneğin yuvarlatılmış köşeler, özel marka butonları) göre otomatik tema oluşturarak render eder.
* **Akıllı Doğrulama:** `React Hook Form` ve `Zod` entegrasyonu ile alan gereksinimleri (örneğin telefon formatı, zorunlu alanlar, dosya boyutu/varlığı) form gönderilmeden önce istemci tarafında denetlenir.
* **Teşekkür Sayfası:** Form başarıyla tamamlandığında markanın renk şeması, marka logosu ve yumuşak SVG animasyonlarıyla süslenmiş premium tebrik ekranı.

---

## Teknolojik Altyapı

Denvea, en güncel web teknolojileri ve kütüphaneleri kullanılarak optimize edilmiştir:

| Katman | Teknoloji / Kütüphane | Açıklama |
| :--- | :--- | :--- |
| **Çekirdek** | [React 19](https://react.dev/) & [Vite 8](https://vite.dev/) | Hızlı HMR desteği ve modern bileşen mimarisi |
| **Durum Yönetimi** | [Redux Toolkit](https://redux-toolkit.js.org/) | Merkezi veri akışı, asenkron Thunk aksiyonları |
| **Tasarım & CSS** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS değişkenleri ve premium arayüz tasarımı |
| **Form Yönetimi** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) | Hızlı ve güvenli form yönetimi, şema doğrulama |
| **Grafikler** | [Recharts](https://recharts.org/) | Area, Bar ve Pie (pasta) grafik görselleştirmeleri |
| **Sürükle & Bırak** | [@dnd-kit](https://dnd-kit.com/) | Form tasarlama ekranı için erişilebilir sürükle-bırak |
| **İkonlar** | [Lucide React](https://lucide.dev/) | Modern, tutarlı çizgi ikon seti |
| **API İletişimi** | [Axios](https://axios-http.com/) | Merkezi HTTP istemcisi ve istek yönetimi |
| **Mock Server** | [JSON Server](https://github.com/typicode/json-server) | `db.json` üzerinden canlı veri okuma/yazma simülasyonu |

---

## Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### Ön Gereksinimler
Bilgisayarınızda **Node.js** (v18 veya üzeri önerilir) ve **npm** yüklü olmalıdır.

### 1. Projeyi Kopyalayın ve Dizinine Gidin
```bash
git clone <proje-adresi>
cd denvea
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Uygulamayı Geliştirme Modunda Çalıştırın
Proje, frontend sunucusunu (Vite) ve mock veri sunucusunu (json-server) aynı anda başlatmak üzere `concurrently` kütüphanesini kullanır:
```bash
npm run dev
```

Bu komuttan sonra:
* **Frontend Portali:** `http://localhost:5173` adresinde çalışacaktır.
* **Mock API Sunucusu:** `http://localhost:3001` adresinde veri sağlayacaktır.

---

## Dosya Yapısı ve Mimarisi

```text
denvea/
├── db.json                 # Mock veritabanı (formlar, yanıtlar, kullanıcılar ve markalar)
├── vite.config.js          # Vite yapılandırması
├── src/
│   ├── app/                # Redux store ve global durum yönetimi
│   ├── features/           # Redux slice'ları (auth, forms, submissions, users)
│   ├── layouts/            # Layout bileşenleri (AdminLayout, PortalLayout)
│   ├── lib/                # Ortak yardımcı araçlar (Axios instance, doğrulama şemaları vb.)
│   ├── components/         # Ortak / Paylaşılan arayüz bileşenleri
│   │   ├── admin/          # Admin paneline özel bileşenler (FormBuilder parçaları vb.)
│   │   ├── portal/         # Kullanıcı portalına özel dinamik render bileşenleri
│   │   └── shared/         # Yetkilendirme (ProtectedRoute) gibi ortak bileşenler
│   ├── pages/              # Sayfa bileşenleri (Dashboard, FormList, DynamicForm vb.)
│   ├── routes/             # React Router yönlendirme şeması (AppRoutes)
│   ├── index.css           # Global stiller ve Tailwind CSS direktifleri
│   └── main.jsx            # Uygulama başlangıç noktası (Giriş)
```

---

## Güvenlik ve Rol Yetkilendirmesi

Sistem genelinde iki temel rol bulunmaktadır:
1. **Admin (Yönetici):** Tüm markaların formlarına, yanıtlarına erişebilir, yeni formlar oluşturabilir, kullanıcı ekleyip silebilir ve sistem ayarlarını düzenleyebilir.
2. **Editor (Düzenleyici):** Yalnızca kendisine tanımlanmış olan markaların (`allowedBrands`) formlarını ve yanıtlarını inceleyebilir. Yeni kullanıcı ekleme veya genel sistem ayarlarını değiştirme yetkisi bulunmaz.
