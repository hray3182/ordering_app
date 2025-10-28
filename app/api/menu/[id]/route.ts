import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

// GET - 取得單一餐點
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item[0]);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

// PATCH - 更新餐點
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null;
    const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null;
    const available = formData.get('available') ? formData.get('available') === 'true' : null;
    const image = formData.get('image') as File | null;

    // 取得現有餐點資料
    const existing = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== null) updateData.name = name;
    if (description !== null) updateData.description = description;
    if (price !== null) updateData.price = price;
    if (categoryId !== null) updateData.categoryId = categoryId;
    if (available !== null) updateData.available = available;

    // 處理圖片上傳
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${image.name}`;
      const filepath = join(process.cwd(), 'public/uploads/menu-items', filename);

      await writeFile(filepath, buffer);

      // 刪除舊圖片
      if (existing[0].imagePath) {
        try {
          const oldImagePath = join(process.cwd(), 'public', existing[0].imagePath);
          await unlink(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }

      updateData.imagePath = `/uploads/menu-items/${filename}`;
    }

    const updated = await db
      .update(menuItems)
      .set(updateData)
      .where(eq(menuItems.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除餐點
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 取得餐點資料以刪除圖片
    const item = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // 刪除圖片
    if (item[0].imagePath) {
      try {
        const imagePath = join(process.cwd(), 'public', item[0].imagePath);
        await unlink(imagePath);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    await db.delete(menuItems).where(eq(menuItems.id, parseInt(id)));

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
