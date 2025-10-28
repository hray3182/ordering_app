'use client';

import { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';

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
}

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showMobileDialog, setShowMobileDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 每10秒更新
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const fetchOrderDetails = async (orderId: number) => {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    setSelectedOrder(data);
    setShowMobileDialog(true); // 手機版顯示 dialog
  };

  const updateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;

    const res = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      fetchOrders();
      fetchOrderDetails(selectedOrder.id);
    }
  };

  const updatePaymentStatus = async (paid: boolean) => {
    if (!selectedOrder) return;

    const res = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid }),
    });

    if (res.ok) {
      fetchOrders();
      fetchOrderDetails(selectedOrder.id);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '處理中',
      preparing: '準備中',
      ready: '可取餐',
      completed: '已完成',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-white text-black',
      preparing: 'bg-white text-black',
      ready: 'bg-black text-white',
      completed: 'bg-gray-300 text-black',
    };
    return colorMap[status] || 'bg-white text-black';
  };

  const OrderDetailContent = () => {
    if (!selectedOrder) return null;

    return (
      <>
        <div className="mb-4">
          <p className="text-3xl font-bold text-black text-center mb-2">{selectedOrder.orderNumber}</p>
          <p className="text-sm text-gray-600 text-center">
            {new Date(selectedOrder.createdAt).toLocaleString('zh-TW')}
          </p>
        </div>

        {/* Items */}
        <div className="mb-4 border-t-2 border-black pt-4">
          <h3 className="font-bold mb-2 text-black">餐點明細</h3>
          <div className="space-y-2">
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-black">
                  {item.menuItemName} x {item.quantity}
                </span>
                <span className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-black pt-4 mb-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-black">總計</span>
            <span className="text-black">${selectedOrder.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Status - Print Only */}
        <div className="hidden print:block mb-4 border-t-2 border-black pt-4">
          <p className="text-sm text-gray-600 font-medium">付款狀態</p>
          <p className="text-lg font-bold text-black">
            {selectedOrder.paid ? '✓ 已付款' : '○ 未付款'}
          </p>
        </div>

        {/* Payment Status */}
        <div className="mb-4 print:hidden">
          <label className="block text-sm font-bold mb-2 text-black">付款狀態</label>
          <button
            onClick={() => updatePaymentStatus(!selectedOrder.paid)}
            className={`w-full py-3 border-2 border-black font-bold transition-colors ${
              selectedOrder.paid
                ? 'bg-black text-white hover:bg-white hover:text-black'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            {selectedOrder.paid ? '✓ 已付款' : '○ 未付款 (點擊標記已付款)'}
          </button>
        </div>

        {/* Status Update */}
        <div className="mb-4 print:hidden">
          <label className="block text-sm font-bold mb-2 text-black">訂單狀態</label>
          <div className="space-y-2">
            {['pending', 'preparing', 'ready', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => updateOrderStatus(status)}
                className={`w-full py-3 border-2 border-black font-bold transition-colors ${
                  selectedOrder.status === status
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Print Button */}
        <div className="print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
          >
            <Printer size={20} />
            列印訂單
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="p-6">
      <header className="mb-6 pb-4 border-b-2 border-black print:hidden">
        <h1 className="text-3xl font-bold text-black">訂單管理</h1>
        <p className="text-gray-600 mt-1">查看訂單號碼、更新訂單狀態與付款狀態</p>
      </header>

      <div className="print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="border-2 border-black overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-black text-white">
                <h2 className="text-lg font-bold">訂單列表</h2>
              </div>
              <div className="divide-y-2 divide-black max-h-[calc(100vh-200px)] overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => fetchOrderDetails(order.id)}
                    className="p-4 hover:bg-gray-100 cursor-pointer bg-white transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-black">{order.orderNumber}</span>
                          <span className={`px-2 py-1 border-2 border-black text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-black">${order.total.toFixed(2)}</p>
                        <p className={`text-sm font-bold ${order.paid ? 'text-black' : 'text-gray-600'}`}>
                          {order.paid ? '✓ 已付款' : '○ 未付款'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {orders.length === 0 && <p className="text-center text-gray-600 py-8 font-medium">目前沒有訂單</p>}
            </div>
          </div>

          {/* Desktop Order Details Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            {selectedOrder ? (
              <div className="border-2 border-black p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-black">訂單詳情</h2>
                <OrderDetailContent />
              </div>
            ) : (
              <div className="border-2 border-black p-6 text-center">
                <p className="text-gray-600 font-medium">點擊訂單查看詳情</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Only Content */}
      <div className="hidden print:block">
        {selectedOrder && (
          <div className="p-6">
            <OrderDetailContent />
          </div>
        )}
      </div>

      {/* Mobile Dialog */}
      {showMobileDialog && selectedOrder && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 print:hidden" onClick={() => setShowMobileDialog(false)}>
          <div
            className="absolute inset-0 bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-black">訂單詳情</h2>
              <button
                onClick={() => setShowMobileDialog(false)}
                className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <OrderDetailContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
