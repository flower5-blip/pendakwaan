# FIX DEPENDENCIES ISSUE
## Solution untuk "Cannot resolve 'tailwindcss'" Error

**Error:** `Cannot resolve 'tailwindcss'` atau `node_modules doesn't exist`

---

## 🔧 QUICK FIX

### Option 1: Run Install Script (Recommended)

1. **Double-click `install-dependencies.bat`**
   - Script akan install semua dependencies
   - Wait untuk installation complete (2-5 minit)

2. **Selepas installation complete, run `START.bat`**

### Option 2: Manual Install

1. **Open terminal/command prompt**
2. **Navigate to app folder:**
   ```bash
   cd D:\ProjekBuatWeb\Pendakwaan\app
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Wait untuk installation complete**
5. **Run `START.bat`**

---

## ✅ VERIFY INSTALLATION

Selepas install, verify bahawa `node_modules` wujud:

1. **Check folder:**
   ```
   D:\ProjekBuatWeb\Pendakwaan\app\node_modules
   ```
   - Folder ini sepatutnya wujud
   - Sepatutnya ada banyak subfolders (tailwindcss, next, react, etc.)

2. **Check dengan command:**
   ```bash
   cd D:\ProjekBuatWeb\Pendakwaan\app
   dir node_modules
   ```

---

## 🐛 TROUBLESHOOTING

### Issue: "npm is not recognized"
**Solution:**
- Install Node.js dari https://nodejs.org
- Restart terminal/command prompt
- Verify: `npm --version`

### Issue: Installation fails dengan errors
**Solution:**
1. Delete `node_modules` folder (jika wujud)
2. Delete `package-lock.json` (jika wujud)
3. Run `npm install` again

### Issue: "Permission denied"
**Solution:**
- Run terminal/command prompt sebagai Administrator
- Or check folder permissions

### Issue: Installation sangat slow
**Solution:**
- Normal untuk first time installation
- Wait untuk complete (boleh ambil 5-10 minit)
- Check internet connection

---

## 📋 CHECKLIST

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Navigate to `app` folder
- [ ] Run `npm install`
- [ ] Verify `node_modules` folder wujud
- [ ] Run `START.bat`

---

## 🚀 AFTER INSTALLATION

Selepas dependencies installed:

1. **Run `START.bat`**
2. **Wait untuk server start (5-10 seconds)**
3. **Browser akan auto-open**
4. **Ready untuk testing!**

---

**Status:** Follow steps above untuk fix dependencies issue! 🔧
