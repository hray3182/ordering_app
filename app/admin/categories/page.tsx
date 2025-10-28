'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCategoryName,
        displayOrder: categories.length,
      }),
    });

    if (res.ok) {
      setNewCategoryName('');
      setIsAddingCategory(false);
      fetchCategories();
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editName.trim()) return;

    const res = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      setEditingId(null);
      setEditName('');
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('確定要刪除此分類嗎？相關餐點也會被刪除。')) return;

    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchCategories();
    } else {
      const error = await res.json();
      alert(error.error || '刪除失敗');
    }
  };

  return (
    <div className="p-6">
      <header className="mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-3xl font-bold text-black">分類管理</h1>
        <p className="text-gray-600 mt-1">管理餐點分類及排序</p>
      </header>

      <div className="max-w-4xl">
        <div className="border-2 border-black p-6">
          {/* Add Category Button */}
          <div className="mb-6">
            {!isAddingCategory ? (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium"
              >
                + 新增分類
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="分類名稱"
                  className="flex-1 border-2 border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  className="bg-black text-white px-6 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium"
                >
                  儲存
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="bg-white text-black px-6 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors font-medium"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 p-4 border-2 border-black">
                {editingId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border-2 border-black px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                    />
                    <button
                      onClick={() => handleUpdateCategory(category.id)}
                      className="bg-black text-white px-4 py-1 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium"
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName('');
                      }}
                      className="bg-white text-black px-4 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-black">{category.name}</span>
                    <span className="text-sm text-gray-600">排序: {category.displayOrder}</span>
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditName(category.name);
                      }}
                      className="bg-white text-black px-4 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-white text-black px-4 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-gray-500 py-8">尚無分類</p>
          )}
        </div>
      </div>
    </div>
  );
}
