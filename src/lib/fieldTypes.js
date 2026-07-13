export const FIELD_TYPES = [
  {
    type: 'text',
    label: 'Kısa Metin',
    description: 'Ad, soyad vb. tek satırlık metin girişleri',
    iconName: 'Type',
    defaultProps: {
      label: 'Kısa Metin',
      required: false,
      placeholder: 'Metin giriniz...',
    },
  },
  {
    type: 'number',
    label: 'Sayı Girişi',
    description: 'Yaş, miktar vb. sadece sayısal değerler',
    iconName: 'Hash',
    defaultProps: {
      label: 'Sayı Girişi',
      required: false,
      placeholder: '0',
      min: null,
      max: null,
    },
  },
  {
    type: 'email',
    label: 'E-posta',
    description: 'E-posta formatlı metin giriş alanı',
    iconName: 'Mail',
    defaultProps: {
      label: 'E-posta Adresi',
      required: false,
      placeholder: 'ornek@email.com',
    },
  },
  {
    type: 'phone',
    label: 'Telefon',
    description: 'Maskeli telefon numarası giriş alanı',
    iconName: 'Phone',
    defaultProps: {
      label: 'Cep Telefonu',
      required: false,
      mask: '0 (5__) ___ __ __',
    },
  },
  {
    type: 'date',
    label: 'Tarih Seçici',
    description: 'Takvim üzerinden tarih seçim alanı',
    iconName: 'Calendar',
    defaultProps: {
      label: 'Doğum Tarihi',
      required: false,
      format: 'dd.mm.yyyy',
    },
  },
  {
    type: 'radio',
    label: 'Radyo Butonlar',
    description: 'Çoklu seçenek arasından tekil seçim',
    iconName: 'CircleDot',
    defaultProps: {
      label: 'Seçim Yapınız',
      required: false,
      options: [
        { id: 'opt1', label: 'Seçenek 1' },
        { id: 'opt2', label: 'Seçenek 2' },
      ],
    },
  },
  {
    type: 'checkbox-group',
    label: 'Cilt Tipi',
    description: 'Çoklu seçim yapılabilen checkbox listesi (cilt tipi vb.)',
    iconName: 'Sparkles',
    defaultProps: {
      label: 'Cilt Tipiniz',
      required: false,
      multi: true,
      options: [
        { id: 'opt1', label: 'Hassas Cilt' },
        { id: 'opt2', label: 'Kuru Cilt' },
        { id: 'opt3', label: 'Karma ve Yağlı Cilt' },
      ],
    },
  },
  {
    type: 'select-linked',
    label: 'İl / İlçe',
    description: 'Birbiriyle bağlantılı il ve ilçe seçim kutuları',
    iconName: 'MapPin',
    defaultProps: {
      label: 'Konum Seçiniz',
      required: false,
      dependsOn: null, // "f_il" gibi üst alan ID'si
    },
  },
  {
    type: 'file',
    label: 'Dosya Yükleme',
    description: 'Resim veya belge yükleme alanı',
    iconName: 'Upload',
    defaultProps: {
      label: 'Dosya Yükle',
      required: false,
      accept: '.jpg,.jpeg,.png,.pdf',
    },
  },
  {
    type: 'checkbox',
    label: 'KVKK Onay',
    description: 'KVKK veya kampanya izin onay kutusu',
    iconName: 'ShieldCheck',
    defaultProps: {
      label: 'KVKK Metnini okudum, kabul ediyorum.',
      required: true,
    },
  },
  {
    type: 'info-text',
    label: 'Bilgi Metni',
    description: 'Açıklama veya yasal bilgilendirme metinleri (input değildir)',
    iconName: 'AlignLeft',
    defaultProps: {
      label: 'Bilgilendirme Metni içeriği buraya yazılacaktır.',
      links: [],
    },
  },
];
