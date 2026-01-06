import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

// 從環境變數取得 Spreadsheet ID
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const keyPath = path.join(process.cwd(), 'ordering-app-sheet.json');

  if (!fs.existsSync(keyPath)) {
    console.warn('Google Sheets key file not found:', keyPath);
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
}

// 訂單同步到 Google Sheets
export async function appendOrderToSheet(order: {
  orderNumber: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: Date | null;
  items: Array<{
    menuItemName: string;
    quantity: number;
    price: number;
  }>;
}): Promise<boolean> {
  if (!SPREADSHEET_ID) {
    console.warn('GOOGLE_SHEETS_SPREADSHEET_ID not configured, skipping sync');
    return false;
  }

  const sheets = getSheetsClient();
  if (!sheets) return false;

  try {
    // 格式化品項清單
    const itemsText = order.items
      .map((item) => `${item.menuItemName} x${item.quantity}`)
      .join(', ');

    // 格式化時間
    const formattedTime = order.createdAt
      ? new Date(order.createdAt).toLocaleString('zh-TW', {
          timeZone: 'Asia/Taipei',
        })
      : '';

    // 準備要寫入的資料（訂單號加 ' 前綴防止被轉成數字）
    const values = [
      [
        `'${order.orderNumber}`,
        itemsText,
        order.items.reduce((sum, item) => sum + item.quantity, 0), // 總數量
        order.total,
        order.paid ? '已付款' : '未付款',
        order.status,
        formattedTime,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:G', // 預設寫入 Sheet1
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`Order ${order.orderNumber} synced to Google Sheets`);
    return true;
  } catch (error) {
    console.error('Failed to sync order to Google Sheets:', error);
    return false;
  }
}

// 更新 Google Sheets 中的訂單
export async function updateOrderInSheet(
  orderNumber: string,
  updates: { status?: string; paid?: boolean }
): Promise<boolean> {
  if (!SPREADSHEET_ID) {
    console.warn('GOOGLE_SHEETS_SPREADSHEET_ID not configured, skipping update');
    return false;
  }

  const sheets = getSheetsClient();
  if (!sheets) return false;

  try {
    // 先找到訂單所在的行
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:A', // 只讀取訂單號欄位
    });

    const rows = response.data.values;
    if (!rows) {
      console.warn('No data found in sheet');
      return false;
    }

    // 找到訂單號所在的行（+1 因為 Sheets 是 1-indexed）
    // 需要處理可能被轉成數字的情況（例如 "000017" 變成 17）
    const orderNumberAsNum = parseInt(orderNumber, 10).toString();
    const rowIndex = rows.findIndex(
      (row) => row[0] === orderNumber || row[0] === orderNumberAsNum || row[0]?.toString() === orderNumberAsNum
    );
    if (rowIndex === -1) {
      console.warn(`Order ${orderNumber} not found in sheet`);
      return false;
    }

    const rowNumber = rowIndex + 1;

    // 準備更新的資料
    const updateRequests = [];

    if (updates.paid !== undefined) {
      // E 欄是付款狀態
      updateRequests.push(
        sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!E${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[updates.paid ? '已付款' : '未付款']] },
        })
      );
    }

    if (updates.status !== undefined) {
      // F 欄是訂單狀態
      updateRequests.push(
        sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!F${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[updates.status]] },
        })
      );
    }

    await Promise.all(updateRequests);
    console.log(`Order ${orderNumber} updated in Google Sheets`);
    return true;
  } catch (error) {
    console.error('Failed to update order in Google Sheets:', error);
    return false;
  }
}
