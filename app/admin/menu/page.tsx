'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  imagePath: string | null;
  available: boolean;
}

export default function MenuAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchMenuItems = async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenuItems(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('categoryId', formData.categoryId);
    data.append('available', formData.available.toString());
    if (imageFile) {
      data.append('image', imageFile);
    }

    const res = await fetch('/api/menu', {
      method: 'POST',
      body: data,
    });

    if (res.ok) {
      setFormData({ name: '', description: '', price: '', categoryId: '', available: true });
      setImageFile(null);
      setShowAddDialog(false);
      fetchMenuItems();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此餐點嗎？')) return;

    const res = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchMenuItems();
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    const data = new FormData();
    data.append('available', (!item.available).toString());

    const res = await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      body: data,
    });

    if (res.ok) {
      fetchMenuItems();
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory)
    : menuItems;

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || '';
  };

  return (
    <div className="p-6">
      <header className="mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-3xl font-bold text-black">餐點管理</h1>
        <p className="text-gray-600 mt-1">管理餐點資訊、圖片與上架狀態</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Add Item Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium"
            >
              + 新增餐點
            </button>
          </div>

          {/* Filter by Category */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 border-2 border-black whitespace-nowrap transition-colors font-medium ${
                selectedCategory === null ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 border-2 border-black whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === category.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Menu Items - Desktop Table */}
          <div className="hidden lg:block border-2 border-black overflow-hidden">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">圖片</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">名稱</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">分類</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">價格</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">狀態</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredItems.map((item) => (
                  <tr key={item.id} className={!item.available ? 'bg-gray-100' : 'bg-white'}>
                    <td className="px-4 py-3">
                      {item.imagePath ? (
                        <div className="relative w-16 h-16 border-2 border-black">
                          <Image src={item.imagePath} alt={item.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center text-gray-600 text-xs font-medium">
                          無圖片
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-black">{item.name}</div>
                      {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{getCategoryName(item.categoryId)}</td>
                    <td className="px-4 py-3 font-bold text-black">${item.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 border-2 border-black text-xs font-medium ${
                          item.available ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                      >
                        {item.available ? '可供應' : '停售'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className="bg-white text-black px-3 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors text-sm font-medium"
                        >
                          {item.available ? '停售' : '上架'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-white text-black px-3 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors text-sm font-medium"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && <p className="text-center text-gray-600 py-8 font-medium">尚無餐點</p>}
          </div>

          {/* Menu Items - Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className={`border-2 border-black p-4 ${!item.available ? 'bg-gray-100' : 'bg-white'}`}>
                <div className="flex gap-4">
                  {item.imagePath ? (
                    <div className="relative w-20 h-20 border-2 border-black flex-shrink-0">
                      <Image src={item.imagePath} alt={item.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 border-2 border-black flex items-center justify-center text-gray-600 text-xs font-medium flex-shrink-0">
                      無圖片
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-lg mb-1">{item.name}</h3>
                    {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">{getCategoryName(item.categoryId)}</span>
                      <span className="text-xl font-bold text-black">${item.price}</span>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 border-2 border-black text-xs font-medium ${
                        item.available ? 'bg-white text-black' : 'bg-black text-white'
                      }`}
                    >
                      {item.available ? '可供應' : '停售'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleToggleAvailable(item)}
                    className="flex-1 bg-white text-black px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-sm font-medium"
                  >
                    {item.available ? '停售' : '上架'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-white text-black px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-sm font-medium"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && <p className="text-center text-gray-600 py-8 font-medium">尚無餐點</p>}
          </div>
        </div>

        {/* Desktop Sidebar - Add Item Form */}
        <div className="hidden lg:block lg:col-span-1">
          {showAddDialog ? (
            <div className="border-2 border-black p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black">
                <h2 className="text-xl font-bold text-black">新增餐點</h2>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setFormData({ name: '', description: '', price: '', categoryId: '', available: true });
                    setImageFile(null);
                  }}
                  className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">餐點名稱 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">說明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">價格 *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">分類 *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                  >
                    <option value="">選擇分類</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">圖片</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <label className="text-sm font-medium text-black">可供應</label>
                </div>
                <button type="submit" className="w-full bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium">
                  儲存餐點
                </button>
              </form>
            </div>
          ) : (
            <div className="border-2 border-black p-6 text-center sticky top-6">
              <p className="text-gray-600 font-medium">點擊「新增餐點」按鈕開始新增</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dialog */}
      {showAddDialog && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddDialog(false)}>
          <div
            className="absolute inset-0 bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-black">新增餐點</h2>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setFormData({ name: '', description: '', price: '', categoryId: '', available: true });
                  setImageFile(null);
                }}
                className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">餐點名稱 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">說明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">價格 *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">分類 *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                  >
                    <option value="">選擇分類</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">圖片</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <label className="text-sm font-medium text-black">可供應</label>
                </div>
                <button type="submit" className="w-full bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium">
                  儲存餐點
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
