# Denvea Proje Teknik Dokümantasyonu

Bu doküman, Denvea platformunun mimari yapısını, kullanılan teknolojileri, dosya/klasör sorumluluklarını ve kurulum/çalıştırma yönergelerini ayrıntılı olarak açıklamaktadır.

---

## 1. Teknolojik Altyapı ve Bağımlılıklar

Proje modern, hızlı ve ölçeklenebilir bir istemci taraflı mimari üzerine kurulmuştur. Kullanılan temel teknolojiler ve üstlendikleri roller şu şekildedir:

### Çekirdek Kütüphaneler
* **React (v19.2.7):** Uygulamanın bileşen tabanlı arayüz mimarisini ve yaşam döngüsü yönetimini sağlar.
* **Vite (v8.1.1):** Hızlı HMR (Hot Module Replacement) desteği sunan, modern JavaScript/TypeScript derleme aracı ve yerel geliştirme sunucusu.
* **React Router DOM (v7.18.1):** Single Page Application (SPA) yönlendirme işlemlerini, korumalı rotaları (Protected Routes) ve parametreli sayfa geçişlerini yönetir.

### Durum Yönetimi (State Management)
* **Redux Toolkit (v2.12.0) & React Redux (v9.3.0):** Kullanıcı oturumu, form listeleri, dinamik form oluşturucu durumu, form yanıtları ve kullanıcı verilerini merkezi bir "store" üzerinde tutar. `createAsyncThunk` ile asenkron API isteklerini asenkron durumlar (pending, fulfilled, rejected) halinde kontrol eder.

### Form Arayüzü ve Veri Doğrulama
* **React Hook Form (v7.81.0):** İstemci tarafında form durumlarını (dirty, touched, errors) performansı düşürmeden (yeniden render etme sıklığını azaltarak) kontrol eder.
* **Zod (v4.4.3) & @hookform/resolvers (v5.4.0):** Form şemalarını dinamik olarak oluşturup doğrulamayı sağlayan şema tabanlı doğrulama motoru.

### Sürükle ve Bırak (Drag and Drop)
* **@dnd-kit/core (v6.3.1) & @dnd-kit/sortable (v10.0.0) & @dnd-kit/utilities (v3.2.2):** Form oluşturma ekranında form alanlarının sıralanabilir yapıda sürüklenip bırakılmasını sağlar.

### Veri Görselleştirme ve Grafik
* **Recharts (v3.9.2):** Dashboard ve analiz sayfalarındaki çizgi, sütun ve pasta grafiklerin duyarlı (responsive) biçimde çizilmesini sağlar.

### API İletişimi ve Mock Sunucu
* **Axios (v1.18.1):** Sunucu isteklerini yöneten HTTP istemcisi.
* **JSON Server (v1.0.0-beta.15):** Yerel geliştirme sırasında mock veritabanı işlevi gören, RESTful API standartlarında çalışan sunucu.

---

## 2. Kurulum ve Çalıştırma Yönergesi

### Ön Gereksinimler
* Node.js v18.0.0 veya üzeri bir sürümün kurulu olması gerekir.

### Adım 1: Proje Bağımlılıklarının Yüklenmesi
Terminal üzerinden proje ana dizinine giderek bağımlılıkları yükleyin:
```bash
npm install
```

### Adım 2: Geliştirme Sunucularının Başlatılması
Projede hem React geliştirme sunucusu hem de JSON Server veritabanı sunucusu çalışmalıdır. İki sunucuyu eşzamanlı olarak başlatmak için:
```bash
npm run dev
```
Bu komut, `package.json` dosyasındaki `"concurrently \"vite\" \"npm run server\""` tanımı sayesinde iki işlemi tek bir terminal ekranında paralel olarak çalıştırır.

* **Frontend Uygulaması:** `http://localhost:5173`
* **Mock REST API:** `http://localhost:3001`

---

## 3. Dizin ve Dosya Analizi

Projenin dosya yapısı modüler ve sorumlulukların ayrılması (Separation of Concerns) prensibine göre kurgulanmıştır.

```text
denvea/
├── db.json                     # Yerel veritabanı dosyası
├── package.json                # Proje bağımlılıkları ve script'leri
├── vite.config.js              # Vite derleyici ayarları
├── eslint.config.js            # Linter kuralları ve stil standartları
└── src/
    ├── main.jsx                # Uygulamanın giriş noktası (React DOM montajı)
    ├── index.css               # Global CSS kuralları ve Tailwind importları
    ├── app/
    │   └── store.js            # Redux store konfigürasyonu ve reducer'ların kaydı
    ├── features/               # Redux durum dilimleri (Slices) ve asenkron işlemler
    │   ├── auth/authSlice.js               # Giriş/çıkış, kullanıcı rolü ve oturum durumları
    │   ├── forms/formsSlice.js             # Form şemalarının listelenmesi, güncellenmesi ve silinmesi
    │   ├── forms/formBuilderSlice.js       # Form tasarım aşamasındaki sürükle-bırak durum yönetimi
    │   ├── submissions/submissionsSlice.js # Formlara gelen kullanıcı yanıtlarının yönetimi
    │   └── users/usersSlice.js             # CRM sistemindeki admin/editör kullanıcı yönetimi
    ├── lib/                    # Ortak kütüphaneler ve yardımcı fonksiyonlar
    │   ├── axiosInstance.js    # Base URL ve ortak interceptor'ları içeren Axios yapısı
    │   ├── turkeyData.js       # İl ve ilçe bağlı seçim listeleri için coğrafi veri tabanı
    │   └── validationSchemas.js # JSON form şemalarından dinamik Zod doğrulama şeması üreten fonksiyon
    ├── layouts/                # Sayfaları çevreleyen şablon yapılar
    │   ├── AdminLayout.jsx     # Sol menü ve üst barı içeren Yönetici Paneli yerleşimi
    │   └── PortalLayout.jsx    # Marka logolarına göre değişen Kullanıcı Portalı yerleşimi
    ├── components/             # Yeniden kullanılabilir küçük arayüz bileşenleri
    │   ├── admin/
    │   │   ├── form-builder/FieldPalette.jsx        # Eklenebilecek form alanları listesi
    │   │   ├── form-builder/FormCanvas.jsx          # Form alanlarının bırakıldığı ve sıralandığı tuval
    │   │   └── form-builder/SortableFieldWrapper.jsx# Sürükle-bırak sensörlerini içeren alan sarmalayıcısı
    │   ├── portal/
    │   │   ├── BrandCard.jsx               # Portal giriş ekranındaki marka seçim kartları
    │   │   └── DynamicFieldRenderer.jsx    # Ziyaretçi tarafındaki dinamik form girdi bileşenleri
    │   └── shared/
    │       └── ProtectedRoute.jsx          # Rol ve oturum kontrolü yapan rota sarmalayıcısı
    ├── pages/                  # Sayfa seviyesindeki büyük bileşenler
    │   ├── admin/
    │   │   ├── Login.jsx           # CRM paneli giriş ekranı
    │   │   ├── Dashboard.jsx       # Genel bakış, performans özetleri ve grafikler
    │   │   ├── FormList.jsx        # Mevcut şablonların listelendiği yönetim ekranı
    │   │   ├── FormBuilder.jsx     # Yeni şablon oluşturma veya güncelleme sayfası
    │   │   ├── FormAnalysis.jsx    # Form bazında detaylı grafiksel istatistik analizleri
    │   │   ├── Submissions.jsx     # Gelen yanıtların listelendiği ve indirildiği filtre ekranı
    │   │   ├── Users.jsx           # Admin/editör kayıt ve yetki atama sayfası
    │   │   └── Settings.jsx        # Genel sistem yapılandırma sayfası
    │   └── portal/
    │       ├── BrandSelect.jsx     # Markaların listelendiği son kullanıcı giriş ekranı
    │       ├── DynamicForm.jsx     # Müşteri formunu çizip doğrulamaları yapan ve gönderen ekran
    │       └── ThankYou.jsx        # Form gönderimi sonrası gösterilen başarı/teşekkür ekranı
    └── routes/
        └── AppRoutes.jsx       # Uygulama rota tanımları ve yetkilendirme eşleştirmeleri
```

---

## 4. Teknik Mimari ve Çözümler

### Çoklu Marka (Multi-Tenant) Tasarımı ve Dinamik CSS Temalandırma
Platform Bioderma, The Purest Solutions, La Roche-Posay ve CeraVe olmak üzere dört markayı aynı kod tabanında yönetir. 
* Dinamik stil yönetimi için markanın rengi ve kenarlık yuvarlaklığı şemadan okunur.
* `DynamicForm.jsx` üzerinde tarayıcının DOM yapısına dinamik CSS değişkenleri enjekte edilir:
  ```javascript
  const themeStyles = {
    '--brand-color': theme.primaryColor || '#9843fb',
    '--brand-color-glow': (theme.primaryColor || '#9843fb') + '1a', // 10% opacity
  };
  ```
* Bu sayede tüm form girdileri, butonlar ve başarı ekranı enjekte edilen CSS değişkenlerine göre (`var(--brand-color)`) renk alır.

### Dinamik Zod Doğrulama Şeması Üretimi
Form oluşturucudan gelen form girdileri değişken yapıda olduğu için, form doğrulama şeması statik olarak yazılamaz. Bu durum `validationSchemas.js` içerisindeki `buildDynamicZodSchema` fonksiyonu ile çözülmüştür:
1. Gelen form şablonunun her bir alanı (`field`) döngüye alınır.
2. Alan tipine göre (`text`, `number`, `phone`, `email`, `radio`, `checkbox-group`, `file`, `checkbox`) uygun bir Zod validatörü oluşturulur:
   * E-posta alanları için `.email()` doğrulayıcısı eklenir.
   * Telefon alanları için sayı harici karakterler temizlenerek 10 veya 11 haneli olması zorunlu tutulur.
   * Dosya yükleme (`file`) alanı için dosya varlığı ve türü kontrol edilir.
3. Zorunlu olmayan alanlar için `.optional().or(z.literal(''))` toleransı atanır.
4. Elde edilen tüm alan doğrulamaları `z.object(schemaFields)` yapısında birleştirilerek `React Hook Form`'a `zodResolver` ile teslim edilir.

### Drag and Drop Entegrasyonu
Form oluşturma arayüzünde kullanılan sürükle-bırak mekanizması `@dnd-kit` ile kurulmuştur:
* Tıklama (click) olayları ile sürükleme (drag) olaylarının çakışmasını engellemek için `PointerSensor` mesafesi 8 piksel olarak yapılandırılmıştır. Böylece 8 pikselden daha kısa hareketler tıklama (seçme, silme işlemleri) olarak kabul edilirken, üzerindeki hareketler sürükleme olarak işlenir.
* Sürükleme sırasında yer değiştiren elemanların dizindeki sıralaması `arrayMove` fonksiyonu kullanılarak Redux state'i üzerinde güncellenir ve veritabanına kaydedilir.

### Rol Tabanlı Güvenlik ve Rota Filtreleme
Uygulamadaki erişim kısıtlamaları `ProtectedRoute.jsx` bileşeni üzerinden yapılır:
* Rotalar `AppRoutes.jsx` üzerinde `allowedRoles` dizisi ile sarmalanır.
* Kullanıcı giriş yapmamışsa otomatik olarak `/login` sayfasına yönlendirilir ve geldiği sayfa hafızada (`location.state`) tutularak giriş sonrası geri döndürülmesi sağlanır.
* Giriş yapmış kullanıcı yetkisiz bir rotaya (örneğin bir editör kullanıcı `/admin/users` sayfasına) gitmeye çalışırsa, arayüzde bir hata bildirimi gösterilir ve kullanıcı dashboard sayfasına yönlendirilir.
* Dashboard ve form yönetimi gibi sayfalarda, kullanıcının `allowedBrands` dizisi taranarak yalnızca izin verilen markaların form ve katılım verileri listelenir.
