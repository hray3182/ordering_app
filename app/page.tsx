'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Toast from '@/components/Toast';

interface Category {
  id: number;
  name: string;
  displayOrder: number;
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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    if (data.length > 0) {
      setSelectedCategory(data[0].id);
    }
  };

  const fetchMenuItems = async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenuItems(data);
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory && item.available)
    : menuItems.filter((item) => item.available);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imagePath: item.imagePath,
    });
    setToastMessage(`已加入 ${item.name}`);
    setShowToast(true);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const orderData = {
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      const order = await res.json();
      clearCart();
      router.push(`/order/${order.orderNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">點餐系統</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium"
          >
            購物車
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white border-2 border-white text-xs w-6 h-6 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 border-2 border-black whitespace-nowrap transition-colors font-medium ${selectedCategory === category.id
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border-2 border-black overflow-hidden hover:shadow-lg transition">
              {item.imagePath && (
                <div className="relative h-48 bg-gray-200 border-b-2 border-black">
                  <Image
                    src={item.imagePath}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 text-black">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xl font-bold text-black">${item.price}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium"
                  >
                    加入
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-20" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l-4 border-black p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-black">
              <h2 className="text-2xl font-bold text-black">購物車</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-black hover:bg-black hover:text-white border-2 border-black w-10 h-10 flex items-center justify-center text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-600 text-center py-8 font-medium">購物車是空的</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="flex gap-3 border-2 border-black p-3">
                      {item.imagePath && (
                        <div className="relative w-16 h-16 flex-shrink-0 border-2 border-black">
                          <Image
                            src={item.imagePath}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-black">{item.name}</h3>
                        <p className="text-black font-bold">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            className="bg-white border-2 border-black text-black px-3 py-1 hover:bg-black hover:text-white transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-black min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="bg-white border-2 border-black text-black px-3 py-1 hover:bg-black hover:text-white transition-colors font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.menuItemId)}
                            className="ml-auto bg-white text-black border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors font-medium text-sm"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-black pt-4 mt-4">
                  <div className="flex justify-between items-center text-xl font-bold mb-4">
                    <span className="text-black">總計</span>
                    <span className="text-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-4 border-2 border-black font-bold hover:bg-white hover:text-black transition-colors text-lg"
                  >
                    結帳
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
