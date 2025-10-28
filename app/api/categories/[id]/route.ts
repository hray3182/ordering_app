import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - 取得單一分類
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PATCH - 更新分類
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayOrder } = body;

    const updateData: { name?: string; displayOrder?: number } = {};
    if (name !== undefined) updateData.name = name;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const updated = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除分類
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    // 刪除該分類下的所有餐點（使用軟引用，不再有外鍵約束問題）
    await db
      .delete(menuItems)
      .where(eq(menuItems.categoryId, categoryId));

    // 刪除分類
    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
