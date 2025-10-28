import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// GET - 取得所有餐點 (可選擇性過濾分類)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    let query = db.select().from(menuItems);

    if (categoryId) {
      query = query.where(eq(menuItems.categoryId, parseInt(categoryId))) as any;
    }

    const items = await query.orderBy(asc(menuItems.createdAt));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST - 新增餐點 (含圖片上傳)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const available = formData.get('available') === 'true';
    const image = formData.get('image') as File | null;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and categoryId are required' },
        { status: 400 }
      );
    }

    let imagePath: string | null = null;

    // 處理圖片上傳
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 生成唯一檔名
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${image.name}`;
      const filepath = join(process.cwd(), 'public/uploads/menu-items', filename);

      await writeFile(filepath, buffer);
      imagePath = `/uploads/menu-items/${filename}`;
    }

    const newItem = await db
      .insert(menuItems)
      .values({
        name,
        description: description || null,
        price,
        categoryId,
        available,
        imagePath,
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
