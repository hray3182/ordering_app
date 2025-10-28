'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  menuItemName: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderNumber = params.orderNumber as string;
    fetchOrder(orderNumber);
  }, [params.orderNumber]);

  const fetchOrder = async (orderNumber: string) => {
    try {
      const res = await fetch(`/api/orders/number/${orderNumber}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl font-bold text-black">載入中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4 font-bold text-black">找不到訂單</p>
          <Link href="/" className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-medium inline-block">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white border-2 border-black p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-black mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">訂單已建立</h1>
            <p className="text-gray-600 font-medium">請記住您的訂單號碼</p>
          </div>

          {/* Order Number - Large Display */}
          <div className="bg-white border-2 border-black p-8 mb-6">
            <p className="text-center text-sm text-gray-600 mb-2 font-medium">訂單號碼</p>
            <p className="text-center text-6xl font-bold text-black tracking-wider">
              {order.orderNumber}
            </p>
          </div>

          {/* Order Details */}
          <div className="border-t-2 border-black pt-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-black">訂單明細</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-bold text-black">{item.menuItemName}</span>
                    <span className="text-gray-600 ml-2 font-medium">x {item.quantity}</span>
                  </div>
                  <span className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-black pt-4 mb-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-black">總計</span>
              <span className="text-black">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white border-2 border-black p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-black font-bold">
                {order.paid ? '✓ 已付款' : '請至櫃台付款'}
              </p>
            </div>
          </div>

          {/* Order Status */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 font-medium">訂單狀態</p>
            <p className="text-lg font-bold text-black">
              {order.status === 'pending' && '處理中'}
              {order.status === 'preparing' && '準備中'}
              {order.status === 'ready' && '可取餐'}
              {order.status === 'completed' && '已完成'}
            </p>
          </div>

          {/* Action Button */}
          <div>
            <Link
              href="/"
              className="block w-full bg-black text-white text-center py-3 border-2 border-black font-bold hover:bg-white hover:text-black transition-colors"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
