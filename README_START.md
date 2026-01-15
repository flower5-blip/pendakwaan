# CARA START SISTEM - Quick Guide

## 🚀 Quick Start

### ⭐ RECOMMENDED: Double-click `START.bat`
- ✅ Auto check dependencies
- ✅ Auto install if needed
- ✅ Auto open browser (after 5 seconds)
- ✅ Start development server
- ✅ Clean interface

### Option 2: Double-click `start-dev.bat`
- ✅ Auto check dependencies
- ✅ Auto install if needed
- ✅ Auto open browser
- ✅ Start development server

### Option 3: Double-click `start-dev-quick.bat`
- ✅ Faster start (no dependency check)
- ✅ Auto open browser
- ✅ Start development server

### Option 4: Double-click `start-dev-auto.bat`
- ✅ Full auto mode
- ✅ Install dependencies if needed
- ✅ Auto open browser after 5 seconds
- ✅ Start development server

---

## 📋 Manual Start (Jika .bat tidak berfungsi)

1. Open terminal/command prompt
2. Navigate to project:
   ```bash
   cd app
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start server:
   ```bash
   npm run dev
   ```
5. Open browser:
   ```
   http://localhost:3000
   ```

---

## 🔧 Troubleshooting

### Issue: "Cannot resolve 'tailwindcss'" atau "node_modules doesn't exist"
**Solution:**
1. Run `install-dependencies.bat` untuk install dependencies
2. Or manual: `cd app` → `npm install`
3. Rujuk `FIX_DEPENDENCIES.md` untuk detailed guide

### Issue: "package.json not found"
**Solution:** Run .bat file dari project root directory (bukan dari app folder)

### Issue: "npm is not recognized"
**Solution:** Install Node.js dari https://nodejs.org

### Issue: Browser tidak auto-open
**Solution:** 
- Wait 5 seconds untuk server start
- Or manually open: http://localhost:3000

### Issue: Port 3000 already in use
**Solution:**
- Stop other server running on port 3000
- Or change port in `app/package.json`:
  ```json
  "dev": "next dev -p 3001"
  ```

---

## 📝 Notes

- Server akan start di: `http://localhost:3000`
- Press `Ctrl+C` untuk stop server
- Changes akan auto-reload (hot reload)
- Check browser console untuk errors
- Browser akan auto-open selepas 5 seconds

---

## 🎯 Quick Testing

Selepas server start:
1. Browser akan auto-open ke `/login`
2. Login dengan test users:
   - `io@test.com` / `Test123!`
   - `po@test.com` / `Test123!`
   - `uip@test.com` / `Test123!`
   - `admin@test.com` / `Test123!`
   - `viewer@test.com` / `Test123!`
3. Ikut `ARAHAN_TEST.md` untuk testing

---

**Status:** Ready untuk Testing! 🚀
