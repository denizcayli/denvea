import fs from 'fs';

// Read db.json
const db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

// Update brands with official logo URLs
db.brands = [
  {
    "id": "denvea",
    "name": "Denvea",
    "themeColor": "#14B8A6",
    "concept": "Çatı Şirket, Form Yönetim Paneli",
    "logoUrl": ""
  },
  {
    "id": "bioderma",
    "name": "Bioderma",
    "themeColor": "#C41E3A",
    "concept": "Dermokozmetik, hassas cilt",
    "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bioderma_logo.svg/320px-Bioderma_logo.svg.png"
  },
  {
    "id": "the-purest",
    "name": "The Purest",
    "themeColor": "#2E7D32",
    "concept": "Doğal/saf içerikli cilt bakımı",
    "logoUrl": "https://images.deliveryhero.io/image/darkstores/brand-logos/the_purest_solutions_logo.png"
  },
  {
    "id": "laroche-posay",
    "name": "La Roche-Posay",
    "themeColor": "#0077B6",
    "concept": "Dermatolojik cilt bakımı",
    "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/La_Roche-Posay_logo.svg/320px-La_Roche-Posay_logo.svg.png"
  },
  {
    "id": "cerave",
    "name": "CeraVe",
    "themeColor": "#0A2472",
    "concept": "Seramidli, genel cilt bakımı",
    "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/CeraVe_logo.svg/320px-CeraVe_logo.svg.png"
  }
];

const TURKEY_CITIES = {
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Fatih", "Beyoğlu", "Bakırköy", "Ataşehir", "Sarıyer"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Altındağ", "Etimesgut", "Gölbaşı"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Çeşme", "Urla", "Balçova"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik", "İnegöl"],
  "Antalya": ["Muratpaşa", "Konyaaltı", "Kepez", "Alanya", "Manavgat", "Kemer"]
};
const cities = Object.keys(TURKEY_CITIES);

// Clean out existing submissions if any
db.submissions = [];

// Ensure form_005 (Bioderma) is added to forms if it doesn't exist
const hasForm005 = db.forms.some(f => f.id === 'form_005');
if (!hasForm005) {
  db.forms.push({
    "id": "form_005",
    "brandId": "bioderma",
    "title": "Bioderma Sensibio H2O Tanıtım Günleri",
    "status": "published",
    "theme": {
      "primaryColor": "#C41E3A",
      "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bioderma_logo.svg/320px-Bioderma_logo.svg.png",
      "backgroundStyle": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
        "isLight": false
      }
    },
    "sections": [
      {
        "id": "section_kisisel",
        "title": "Kişisel Bilgiler",
        "fields": [
          { "id": "f_ad", "type": "text", "label": "Adınız", "required": true },
          { "id": "f_soyad", "type": "text", "label": "Soyadınız", "required": true },
          { "id": "f_telefon", "type": "phone", "label": "Cep Telefonu", "required": true, "mask": "0 (5__) ___ __ __" },
          { "id": "f_email", "type": "email", "label": "E-posta Adresi", "required": true },
          { "id": "f_dogum", "type": "date", "label": "Doğum Tarihi", "required": true }
        ]
      },
      {
        "id": "section_etkinlik",
        "title": "Etkinlik Detayları",
        "fields": [
          { "id": "f_il", "type": "select-linked", "label": "İl Seçiniz", "required": true },
          { "id": "f_ilce", "type": "select-linked", "label": "İlçe Seçiniz", "required": true, "dependsOn": "f_il" }
        ]
      },
      {
        "id": "section_cilt",
        "title": "Cilt Bakım Tercihi",
        "fields": [
          {
            "id": "f_cilt_tipi",
            "type": "checkbox-group",
            "label": "Cilt Tipiniz",
            "multi": true,
            "required": true,
            "options": [
              { "id": "opt1", "label": "Hassas Cilt" },
              { "id": "opt2", "label": "Toleranssız Cilt" },
              { "id": "opt3", "label": "Kuru Cilt" },
              { "id": "opt4", "label": "Nemsiz Cilt" }
            ]
          }
        ]
      },
      {
        "id": "section_kvkk",
        "title": "KVKK ve İletişim İzinleri",
        "fields": [
          { "id": "f_kvkk_iletisim", "type": "checkbox", "label": "Kampanya iletileri almak istiyorum.", "required": true }
        ]
      }
    ]
  });
}

// Update other forms' logoUrl values as well
db.forms.forEach(form => {
  const brand = db.brands.find(b => b.id === form.brandId);
  if (brand && brand.logoUrl) {
    if (!form.theme) form.theme = {};
    form.theme.logoUrl = brand.logoUrl;
  }
});

const firstNames = ["Ahmet", "Mehmet", "Mustafa", "Ali", "Can", "Eser", "Bora", "Deniz", "Cem", "Arda", "Ayşe", "Fatma", "Zeynep", "Elif", "Merve", "Ebru", "Gamze", "Selin", "Ece", "Derya", "Emre", "Murat", "Oğuz", "Burak", "Kaan", "Ceren", "Dilek", "Büşra", "Gizem", "Aslı"];
const lastNames = ["Yılmaz", "Kaya", "Şahin", "Demir", "Çelik", "Arslan", "Polat", "Yıldız", "Öztürk", "Aydın", "Özdemir", "Yıldırım", "Kılıç", "Erdoğan", "Şen", "Acar", "Özcan", "Güneş", "Güler", "Koç", "Bulut", "Uzun", "Taş", "Tekin", "Avcı", "Sarı", "Yalçın", "Aslan", "Köse", "Çetin"];

// We will generate 520 submissions in total to give it a realistic bulk feel
const formIds = ["form_001", "form_002", "form_003", "form_004", "form_005"];

for (let i = 1; i <= 520; i++) {
  const formId = formIds[Math.floor(Math.random() * formIds.length)];
  const form = db.forms.find(f => f.id === formId);
  const brandId = form.brandId;

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
  const phone = `0 (5${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}) ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}`;
  const city = cities[Math.floor(Math.random() * cities.length)];
  const districts = TURKEY_CITIES[city];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const birthYear = 1970 + Math.floor(Math.random() * 35);
  const birthDate = `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}.${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}.${birthYear}`;

  const answers = {
    "f_ad": firstName,
    "f_soyad": lastName,
    "f_telefon": phone,
    "f_email": email,
    "f_dogum": birthDate,
    "f_il": city,
    "f_ilce": district
  };

  // Add question specific choices
  if (formId === 'form_002') {
    const opts = ["opt1", "opt2", "opt3"];
    answers["f_urun_tercihi"] = opts[Math.floor(Math.random() * opts.length)];
  } else if (formId === 'form_003') {
    const selected = [];
    const count = 1 + Math.floor(Math.random() * 3);
    for (let c = 0; c < count; c++) {
      const optId = `opt${1 + Math.floor(Math.random() * 13)}`;
      if (!selected.includes(optId)) {
        selected.push(optId);
      }
    }
    answers["f_cilt_tipi"] = selected;
  } else if (formId === 'form_004') {
    const selected = [];
    const count = 1 + Math.floor(Math.random() * 2);
    for (let c = 0; c < count; c++) {
      const optId = `opt${1 + Math.floor(Math.random() * 4)}`;
      if (!selected.includes(optId)) {
        selected.push(optId);
      }
    }
    answers["f_kullanim_amaci"] = selected;
  } else if (formId === 'form_005') {
    const selected = [];
    const count = 1 + Math.floor(Math.random() * 2);
    for (let c = 0; c < count; c++) {
      const optId = `opt${1 + Math.floor(Math.random() * 4)}`;
      if (!selected.includes(optId)) {
        selected.push(optId);
      }
    }
    answers["f_cilt_tipi"] = selected;
  }

  answers["f_kvkk_iletisim"] = true;

  // Timestamps spread over the last 30 days
  const now = new Date();
  const subDate = new Date();
  subDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
  subDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

  db.submissions.push({
    id: `sub_${1000 + i}`,
    formId,
    brandId,
    answers,
    submittedAt: subDate.toISOString()
  });
}

// Write back to db.json
fs.writeFileSync('./db.json', JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully generated 520 mock submissions in db.json!');
