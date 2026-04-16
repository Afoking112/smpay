# MongoDB Connection Fix TODO - Final Steps

## Plan Breakdown
1. [x] Get non-SRV connection string ✓ `mongodb://adekunbiafolabi:...ac-ngrkczz-shard-00-00.6eae2cf...:27017...`
2. [x] Update `.env` with new MONGODB_URI ✓ (tested)
3. [x] Atlas Network Access ✓ (0.0.0.0/0)
4. [x] `npm run dev` ✓
5. [ ] Test /api/health → **"bad auth : authentication failed"**
6. [ ] [DONE] after auth fix

## 🎉 PROGRESS: SRV Error FIXED! Now "bad auth"

**/api/health shows:** non-SRV connects (no ECONNREFUSED) but authentication failed.

## 🔐 Fix Authentication:
1. **Atlas → Database Access → adekunbiafolabi**
   - Confirm password `adekunbiafolabi` works
   - **Reset password** if unsure → copy exactly (no special chars missed)
2. **Update .env password** to match Atlas exactly:
```
MONGODB_URI="mongodb://adekunbiafolabi:NEW_EXACT_PASSWORD@ac-ngrkczz-shard-00-00.6eae2cf.mongodb.net:27017,ac-ngrkczz-shard-00-01.6eae2cf.mongodb.net:27017,ac-ngrkczz-shard-00-02.6eae2cf.mongodb.net:27017/smpay?ssl=true&replicaSet=atlas-isjtix-shard-0&authSource=admin&retryWrites=true&w=majority"
```
3. Save → `npm run dev` → test /api/health

**Common Issues:**
- Password has @/% → URL encode: @=`%40`, %= `%25`
- User needs "Built-in Role: readWriteAnyDatabase"
- Try `%40` if password has `@`

**Test:** `{"db":{"ok":true,"message":"Database connection established"}}`
