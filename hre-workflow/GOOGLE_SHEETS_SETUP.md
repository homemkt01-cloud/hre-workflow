# คู่มือการตั้งค่า Google Sheets เป็น Backend (Setup Guide)

เพื่อให้เว็บไซต์สามารถ ดึงข้อมูล และ บันทึกข้อมูล ลงใน Google Sheets ได้ ให้ทำตามขั้นตอนนี้ครับ

## 1. เตรียม Google Sheet
1. สร้าง Google Sheet ใหม่
2. ตั้งชื่อ Tab ด้านล่างว่า `Listings` (สำคัญ! ต้องชื่อนี้เป๊ะๆ)
3. สร้างหัวตาราง (Header) ในแถวที่ 1 ดังนี้:
   - Cell A1: `id`
   - Cell B1: `code`
   - Cell C1: `name`
   - Cell D1: `team`
   - Cell E1: `drive_link`
   - Cell F1: `status`
   - Cell G1: `updated_at`
   - Cell H1: `image_url` (เผื่อไว้ใส่ลิงก์รูป Preview)

## 2. ติดตั้ง Script (API)
1. ใน Google Sheet ไปที่เมนู **Extensions (ส่วนขยาย)** > **Apps Script**
2. **ลบโค้ดเก่าในหน้านั้นทิ้งให้หมด** (ให้หน้าจอขาวโล่ง)
3. คัดลอกโค้ดด้านล่างนี้ไปวาง:

```javascript
// ==========================================
// ⬇️ เริ่มคัดลอกตั้งแต่บรรทัดนี้ (START COPY) ⬇️
// ==========================================

function doGet(e) {
  // ดึงข้อมูลจาก Sheet ชื่อ 'Listings'
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Listings');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({error: "Tab 'Listings' not found"}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
     return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = data[0];
  const rows = data.slice(1);
  
  const listings = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(listings))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Listings');
  if (!sheet) return response({ success: false, message: 'Tab Listings not found' });

  // รับข้อมูล JSON จากเว็บ
  let params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    return response({ success: false, message: 'Invalid JSON' });
  }
  
  // กรณี: สร้างรายการใหม่ (Create)
  if (params.action === 'create') {
    const newRow = [
      Utilities.getUuid(), // id
      params.code || '',
      params.name || '',
      params.team || '',
      params.driveLink || '',
      'NEW', // status default
      new Date().toISOString(),
      params.imageUrl || ''
    ];
    sheet.appendRow(newRow);
    return response({ success: true, message: 'Created' });
  }
  
  // กรณี: อัปเดตสถานะ (Update Status)
  if (params.action === 'updateStatus') {
    const data = sheet.getDataRange().getValues();
    const idIndex = 0; // Column A is ID
    const statusIndex = 5; // Column F is Status
    const updatedAtIndex = 6; // Column G is UpdatedAt
    
    // วนหา Row ที่มี ID ตรงกัน
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIndex]) === String(params.id)) {
        // อัปเดต Cell (ต้องบวก 1 เพราะใน Code เริ่มนับ 0 แต่ Sheet เริ่มนับ 1)
        sheet.getRange(i + 1, statusIndex + 1).setValue(params.newStatus);
        sheet.getRange(i + 1, updatedAtIndex + 1).setValue(new Date().toISOString());
        return response({ success: true, message: 'Updated' });
      }
    }
    return response({ success: false, message: 'ID not found' });
  }

  return response({ success: false, message: 'Unknown action' });
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// ⬆️ สิ้นสุดการคัดลอก (END COPY) ⬆️
// ==========================================
```

## 3. Deploy (ทำให้ใช้งานได้จริง)
1. กดปุ่ม **Deploy** (สีฟ้ามุมขวาบน) > เลือก **New deployment**
2. ตรง Select type ให้กดรูปฟันเฟือง ⚙️ > เลือก **Web app**
3. ตั้งค่าตามนี้ (สำคัญมาก!):
   - **Description:** `API v1`
   - **Execute as:** `Me` (อีเมลของคุณเอง)
   - **Who has access:** เลือก `Anyone` (ทุกคน) <--- **จุดนี้สำคัญที่สุด ถ้าไม่เลือก Web จะดึงข้อมูลไม่ได้**
4. กดปุ่ม **Deploy**
   - *หมายเหตุ: หากระบบถามหาการอนุญาตสิทธิ์ (Authorize access) ให้กด Review permissions -> เลือกอีเมล -> กด Advanced -> Go to ... (unsafe) -> Allow*
5. เมื่อเสร็จแล้ว คุณจะได้ **Web App URL** (ลิงก์ยาวๆ ที่ลงท้ายด้วย `/exec`)
6. **คัดลอก URL นั้น** มาใส่ในไฟล์ `App.tsx` บรรทัดที่ 12 ครับ
