import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { desc } from 'drizzle-orm';

// 生成 6 位數訂單號
async function generateOrderNumber(): Promise<string> {
  // 取得最新的訂單號
  const latestOrder = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.id))
    .limit(1);

  let nextNumber = 1;

  if (latestOrder.length > 0 && latestOrder[0].orderNumber) {
    const currentNumber = parseInt(latestOrder[0].orderNumber);
    nextNumber = currentNumber + 1;
  }

  // 格式化為 6 位數字 (例如: 000001)
  return nextNumber.toString().padStart(6, '0');
}

// POST - 結帳建立訂單
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // items: [{ menuItemId, name, quantity, price }]

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // 計算總金額
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // 生成訂單號
    const orderNumber = await generateOrderNumber();

    // 建立訂單
    const newOrder = await db
      .insert(orders)
      .values({
        orderNumber,
        total,
        status: 'pending',
        paid: false,
      })
      .returning();

    const orderId = newOrder[0].id;

    // 建立訂單明細（使用軟引用）
    const orderItemsData = items.map((item: any) => ({
      orderId,
      menuItemId: item.menuItemId, // 軟引用，保留ID作為參考
      menuItemName: item.name, // 直接存儲餐點名稱
      quantity: item.quantity,
      price: item.price,
    }));

    await db.insert(orderItems).values(orderItemsData);

    return NextResponse.json(
      {
        ...newOrder[0],
        items: orderItemsData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
