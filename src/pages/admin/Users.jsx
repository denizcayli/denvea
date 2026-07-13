import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Edit, AlertTriangle, X, Shield, Mail, Phone, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchUsers, addUser, updateUser, deleteUser } from '../../features/users/usersSlice';

export default function Users() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Editor',
    allowedBrands: [],
    phone: '',
    bio: ''
  });

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const brands = [
    { id: 'bioderma', name: 'Bioderma', color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'the-purest', name: 'The Purest', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 'laroche-posay', name: 'La Roche-Posay', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 'cerave', name: 'CeraVe', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  ];

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Editor',
      allowedBrands: [],
      phone: '',
      bio: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, user) => {
    e.stopPropagation(); // Prevent row selection
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      allowedBrands: user.allowedBrands || [],
      phone: user.phone || '',
      bio: user.bio || ''
    });
    setIsModalOpen(true);
  };

  const handleBrandCheckboxChange = (brandId) => {
    const current = [...formData.allowedBrands];
    const index = current.indexOf(brandId);
    if (index === -1) {
      current.push(brandId);
    } else {
      current.splice(index, 1);
    }
    setFormData({ ...formData, allowedBrands: current });
  };

  const handleRoleChange = (roleVal) => {
    if (roleVal === 'Admin') {
      setFormData({
        ...formData,
        role: roleVal,
        allowedBrands: ['bioderma', 'the-purest', 'laroche-posay', 'cerave']
      });
    } else {
      setFormData({
        ...formData,
        role: roleVal,
        allowedBrands: []
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('İsim ve E-posta alanları zorunludur.');
      return;
    }

    if (formData.role === 'Editor' && formData.allowedBrands.length === 0) {
      toast.error('Editör rolü için en az bir markaya yetki verilmelidir.');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      allowedBrands: formData.role === 'Admin' 
        ? ['bioderma', 'the-purest', 'laroche-posay', 'cerave'] 
        : formData.allowedBrands,
      phone: formData.phone || '',
      bio: formData.bio || ''
    };

    if (editingUser) {
      dispatch(updateUser({ id: editingUser.id, userData: payload }))
        .unwrap()
        .then(() => {
          toast.success('Kullanıcı başarıyla güncellendi!');
          setIsModalOpen(false);
          // Sync detail view if selected
          if (selectedUser?.id === editingUser.id) {
            setSelectedUser({ ...selectedUser, ...payload });
          }
        })
        .catch((err) => {
          toast.error(`Güncelleme sırasında hata: ${err}`);
        });
    } else {
      dispatch(addUser(payload))
        .unwrap()
        .then(() => {
          toast.success('Kullanıcı başarıyla eklendi!');
          setIsModalOpen(false);
        })
        .catch((err) => {
          toast.error(`Kullanıcı eklenirken hata: ${err}`);
        });
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent row selection
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      dispatch(deleteUser(deleteConfirmId))
        .unwrap()
        .then(() => {
          toast.success('Kullanıcı başarıyla silindi!');
          if (selectedUser?.id === deleteConfirmId) {
            setSelectedUser(null);
          }
          setDeleteConfirmId(null);
        })
        .catch((err) => {
          toast.error(`Kullanıcı silinirken hata: ${err}`);
        });
    }
  };

  const getBrandName = (brandId) => {
    const map = {
      bioderma: 'Bioderma',
      'the-purest': 'The Purest',
      'laroche-posay': 'La Roche-Posay',
      cerave: 'CeraVe',
    };
    return map[brandId] || brandId;
  };

  return (
    <div className="w-full mx-auto p-8 space-y-6 overflow-y-auto h-full text-slate-800 bg-white lg:bg-transparent">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kullanıcı Yönetimi</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sistem yöneticileri, form editörleri ve marka sahiplerini yönetebilir, yetkilendirme detaylarını görüntüleyebilirsiniz.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Kullanıcı Ekle</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Kullanıcılar yükleniyor...</div>
      ) : users.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Users Table Column */}
          <div className={`space-y-2 flex-1 transition-all duration-300 w-full ${selectedUser ? 'lg:max-w-[65%]' : ''}`}>
            <div className="block md:hidden text-right text-[10px] font-bold text-slate-400 select-none animate-pulse">
              Yatay Kaydırılabilir ↔
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4 md:px-6">Ad Soyad</th>
                      <th className="py-3 px-4 md:px-6">E-posta</th>
                      <th className="py-3 px-4 md:px-6">Rol</th>
                      <th className="py-3 px-4 md:px-6">Yetki Durumu</th>
                      <th className="py-3 px-4 md:px-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {users.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      return (
                        <tr 
                          key={u.id} 
                          onClick={() => setSelectedUser(u)}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-violet-50/40 hover:bg-violet-50/60 border-l-4 border-violet-500' 
                              : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="py-3.5 px-4 md:px-6 font-bold text-slate-900">
                            <div className="flex items-center space-x-2.5">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-6.5 h-6.5 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-6.5 h-6.5 rounded-full bg-violet-100 text-violet-750 flex items-center justify-center font-bold text-[10px] uppercase">
                                  {u.name.charAt(0)}
                                </div>
                              )}
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 md:px-6 text-slate-500">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4 md:px-6">
                            <span className={`px-2 py-0.5 rounded-full border font-bold text-[9px] uppercase tracking-wide ${
                              u.role === 'Admin'
                                ? 'bg-violet-600 border-violet-500 text-white shadow-sm'
                                : u.role === 'Marka Sahibi'
                                ? 'bg-teal-50 border-teal-200 text-teal-700'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 md:px-6">
                            {u.role === 'Admin' ? (
                              <span className="text-[10px] font-semibold text-slate-500">Tüm Markalar</span>
                            ) : u.allowedBrands && u.allowedBrands.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.allowedBrands.map((brandId) => {
                                  const foundBrand = brands.find((b) => b.id === brandId);
                                  const badgeColor = foundBrand ? foundBrand.color : 'bg-slate-50 border-slate-200 text-slate-600';
                                  return (
                                    <span key={brandId} className={`px-2 py-0.5 rounded border text-[9px] font-bold ${badgeColor}`}>
                                      {getBrandName(brandId).toUpperCase()}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-red-500">Kısıtlı / Yetkisiz</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 md:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={(e) => handleOpenEditModal(e, u)}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                                title="Düzenle"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {u.id !== '1' && u.id !== 1 && (
                                <button
                                  onClick={(e) => handleDeleteClick(e, u.id)}
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 transition-all cursor-pointer"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Details Card (Kişi Kartı) */}
          {selectedUser && (
            <div className="w-full lg:w-[35%] bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 shrink-0 animate-fade-in text-slate-800 sticky top-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3.5">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name} 
                      className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-violet-100 text-violet-750 flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                      {selectedUser.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">{selectedUser.name}</h4>
                    <span className={`inline-block px-2 py-0.5 mt-1.5 rounded-full border font-bold text-[9px] uppercase tracking-wide ${
                      selectedUser.role === 'Admin'
                        ? 'bg-violet-600 border-violet-500 text-white shadow-sm'
                        : selectedUser.role === 'Marka Sahibi'
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details List */}
              <div className="space-y-4 font-semibold text-xs">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">E-posta</span>
                  <a 
                    href={`mailto:${selectedUser.email}`} 
                    className="text-violet-600 hover:underline block text-xs break-all font-bold"
                  >
                    {selectedUser.email}
                  </a>
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">İletişim Numarası</span>
                  {selectedUser.phone ? (
                    <a 
                      href={`tel:${selectedUser.phone}`} 
                      className="text-slate-800 hover:underline block font-bold"
                    >
                      {selectedUser.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium italic">Telefon girilmemiş.</span>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Hakkında / Biyografi</span>
                  {selectedUser.bio ? (
                    <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-150">
                      {selectedUser.bio}
                    </p>
                  ) : (
                    <span className="text-slate-400 font-medium italic block">Biyografi belirtilmemiş.</span>
                  )}
                </div>

                {/* Brand mapping */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">İlişkili Markalar</span>
                  {selectedUser.allowedBrands && selectedUser.allowedBrands.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.allowedBrands.map((brandId) => {
                        const foundBrand = brands.find((b) => b.id === brandId);
                        const badgeColor = foundBrand ? foundBrand.color : 'bg-slate-50 border-slate-200 text-slate-600';
                        return (
                          <span key={brandId} className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                            {getBrandName(brandId)}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[10px] font-medium block">Herhangi bir marka ile ilişkisi yok.</span>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-500 bg-white shadow-sm">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700">Kullanıcı Bulunmuyor</h4>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                  placeholder="Örn: Jean-Noël Thorel"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                  placeholder="Örn: jean@naos.com"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-850 cursor-pointer"
                >
                  <option value="Editor">Editor (Kısıtlı Yetkili)</option>
                  <option value="Admin">Admin (Tam Yetkili)</option>
                  <option value="Marka Sahibi">Marka Sahibi (Görünür İletişim)</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">İletişim Numarası (Opsiyonel)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                  placeholder="Örn: +33 1 45 67 89 10"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Biyografi / Detaylı Bilgi</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800 resize-none h-20"
                  placeholder="Marka sahibinin unvanı veya kısa özgeçmişi..."
                />
              </div>

              {/* Brand Checklist (Non-Admin only) */}
              {formData.role !== 'Admin' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">İlişkili Markalar</label>
                  <p className="text-[10px] text-slate-400">Bu kullanıcının yetkili veya sahibi olduğu markaları işaretleyin.</p>
                  
                  <div className="space-y-2 pt-1.5">
                    {brands.map((b) => {
                      const isChecked = formData.allowedBrands.includes(b.id);
                      return (
                        <label 
                          key={b.id} 
                          className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleBrandCheckboxChange(b.id)}
                            className="w-4 h-4 text-violet-600 border-slate-350 rounded focus:ring-violet-500"
                          />
                          <span className="text-xs font-semibold text-slate-700">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-750 text-white transition-colors cursor-pointer"
                >
                  {editingUser ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Kullanıcı Silinecek</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem kullanıcının admin paneline erişimini tamamen sonlandıracaktır.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-650 hover:bg-red-600 text-white transition-colors cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
