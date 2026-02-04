# Product Requirements Document (PRD)
**Project Name:** Home Real Estate - A-List Workflow System  
**Version:** 1.2 (Google Sheets Edition)  
**Last Updated:** 2024-05-22  

---

## 1. บทนำ (Introduction)
### 1.1 ที่มาและความสำคัญ (Background)
ปัจจุบันกระบวนการส่งต่องานระหว่างฝ่ายขาย (Sales) และช่างภาพ (Photographer) ในการจัดการรูปภาพทรัพย์ (Listing) เกรด A-List มีความซับซ้อนและใช้การสื่อสารหลายช่องทาง ทำให้เกิดความล่าช้า ตกหล่น และไม่ทราบสถานะที่แน่ชัดว่าทรัพย์รหัสใดดำเนินการเสร็จสิ้นพร้อมขึ้นเว็บไซต์ประกาศขายแล้ว

### 1.2 วัตถุประสงค์ (Objectives)
1. เพื่อสร้างศูนย์กลางข้อมูล (Centralized Platform) ในการติดตามสถานะรูปภาพทรัพย์
2. เพื่อลดขั้นตอนการสื่อสารที่ซ้ำซ้อนระหว่างทีม
3. เพื่อให้ทีมหลังบ้าน (Admin/Web) ทราบสถานะงานที่พร้อมอัปเดตขึ้นหน้าเว็บได้อย่างรวดเร็ว
4. เพื่อแยกแยะงานที่ต้องแต่งภาพ และไม่ต้องแต่งภาพ ได้อย่างชัดเจน
5. **เพื่อใช้ Google Sheets เป็นฐานข้อมูลหลัก ให้ฝ่ายขายจัดการข้อมูลจำนวนมากได้สะดวก**

---

## 2. กลุ่มผู้ใช้งาน (Target Users & Roles)
1. **Sales (ฝ่ายขาย):** 
   - ผู้คัดเลือกทรัพย์ A-List
   - ผู้สร้างรายการ (Listing) ใหม่เข้าระบบ (สามารถทำผ่าน Google Sheets โดยตรงได้)
2. **Photographer (ช่างภาพ):**
   - ผู้ใช้งานหลักของ Web Application (Kanban Board)
   - ผู้ตรวจสอบคุณภาพรูปภาพและเปลี่ยนสถานะงาน
3. **Admin/Back-office (ผู้ดูแลระบบ/ทีมการตลาด):**
   - ผู้รับงานที่เสร็จสมบูรณ์เพื่อนำไปประกาศบนเว็บไซต์หลัก
   - สามารถดู Report สรุปผ่าน Google Sheets ได้

---

## 3. ขอบเขตของงาน (Scope of Work)
### 3.1 รูปแบบผลิตภัณฑ์ (Product Format)
- **Frontend:** Web Application (Single Page Application - React) สำหรับช่างภาพกดเปลี่ยนสถานะ
- **Backend/Database:** **Google Sheets** (เก็บข้อมูลทั้งหมด)
- **API:** **Google Apps Script** (ตัวเชื่อมระหว่างเว็บกับ Google Sheets)

### 3.2 Workflow & Status (สถานะงาน)
ระบบจะแบ่งสถานะของงานออกเป็น 5 สถานะหลัก ดังนี้:
1. **NEW (รายการใหม่):** Default เมื่อ Sales กรอกลง Sheet
2. **TO_EDIT (ต้องแต่งรูป):** ช่างภาพกดจากเว็บ
3. **NO_EDIT (รูปสวยแล้ว):** ช่างภาพกดจากเว็บ
4. **FINISHED (แต่งเสร็จแล้ว):** ช่างภาพกดจากเว็บ
5. **REJECTED (แก้ไข):** ช่างภาพกดส่งกลับ

---

## 4. ฟังก์ชันการทำงาน (Functional Requirements)

### 4.1 Dashboard & Kanban Board (Web View)
- ดึงข้อมูลจาก Google Sheets มาแสดงเป็นการ์ด
- แสดง: รหัสทรัพย์, ชื่อโครงการ, ทีม, รูป Preview (ถ้ามีใน Sheet), Link Drive

### 4.2 การจัดการรายการ (Listing Management)
- **เพิ่มรายการ (Sales):** 
  - *วิธีที่ 1:* เพิ่มผ่านหน้าเว็บ (ทีละรายการ)
  - *วิธีที่ 2 (แนะนำ):* **Copy-Paste ลง Google Sheets โดยตรง** (รองรับหลายร้อยรายการ)
- **อัปเดตสถานะ (Photographer):** 
  - กดปุ่มในเว็บ -> ระบบจะไปแก้ค่าใน Cell ของ Google Sheets แถวนั้นๆ ให้อัตโนมัติ

---

## 5. โครงสร้างข้อมูล (Google Sheets Schema)

เราจะใช้ Google Sheets 1 ไฟล์ โดยมี Column ดังนี้:

| Column | Header Name | Description |
| :--- | :--- | :--- |
| A | `id` | Unique ID (Gen อัตโนมัติ หรือใช้ Timestamp) |
| B | `code` | รหัสทรัพย์ (เช่น HRE-101) |
| C | `name` | ชื่อโครงการ |
| D | `team` | ทีมขาย |
| E | `drive_link` | ลิงก์ Google Drive |
| F | `status` | สถานะ (NEW, TO_EDIT, FINISHED, etc.) |
| G | `updated_at` | เวลาแก้ไขล่าสุด |

---

## 6. สถาปัตยกรรมระบบ (Technical Architecture)

ระบบจะทำงานในรูปแบบ **Serverless** โดยพึ่งพา Google Ecosystem:

1.  **Database:** Google Spreadsheet
2.  **API Layer:** Google Apps Script (Deploy as Web App)
    - `doGet()`: สำหรับเว็บดึงข้อมูลไปแสดง
    - `doPost()`: สำหรับเว็บส่งคำสั่งขอเปลี่ยนสถานะ
3.  **Frontend:** React App (Hosting บน Vercel/Netlify/GitHub Pages)

### ขั้นตอนการเชื่อมต่อ (Integration Steps)
1. สร้าง Google Sheet และกำหนด Header ตามข้อ 5
2. เปิด Extensions > Apps Script
3. วางโค้ด (ดูไฟล์ `GOOGLE_SHEETS_SETUP.md`)
4. Deploy as Web App (เลือก Execute as Me, Access: Anyone)
5. นำ URL ที่ได้ (Script App URL) มาใส่ใน Config ของ Web Application

---
*End of Document*
