# QUICK TEST GUIDE
## Testing Cepat untuk Verify System Working

**Masa:** 15-30 minit  
**Untuk:** Quick verification selepas migrations

---

## ⚡ QUICK TEST (5 Minit)

### 1. Login Test (1 minit)
```
✅ Login dengan test user
✅ Verify redirect to /dashboard
✅ Verify user role displayed
```

### 2. Case Creation Test (2 minit)
```
✅ Create new case
✅ Fill minimum required fields
✅ Submit
✅ Verify case created
```

### 3. Status Change Test (1 minit)
```
✅ Open case
✅ Change status dari 'draf' → 'dalam_siasatan'
✅ Verify status updated
```

### 4. Database Verify (1 minit)
```sql
-- Quick check
SELECT COUNT(*) FROM cases;
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM employers;
```

---

## 🔍 MEDIUM TEST (15 Minit)

### Setup (2 minit)
1. Create 3 test users (IO, PO, Admin)
2. Assign roles

### Test Flow (13 minit)
1. **IO Login** → Create case (3 min)
2. **Add Evidence** (2 min)
3. **Add Statement** (2 min)
4. **Change Status** to 'menunggu_semakan' (1 min)
5. **PO Login** → Review & Approve (2 min)
6. **UIP Login** → Sanction → Route to Compound (2 min)
7. **Create Compound Offer** (1 min)

---

## 📋 FULL TEST (30 Minit)

Ikut **TESTING_GUIDE.md** untuk comprehensive testing.

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "Cannot read property of undefined"
**Fix:** Check browser console, verify data loaded

### Issue: "Policy violation" atau RLS error
**Fix:** 
```sql
-- Check user role
SELECT role FROM profiles WHERE id = auth.uid();
```

### Issue: "Case not found"
**Fix:** Check case_id in URL, verify case exists

### Issue: "Status change not allowed"
**Fix:** Check workflow rules in `lib/workflow.ts`

---

**Quick Start:** Run Quick Test first, then proceed to Medium/Full test!
