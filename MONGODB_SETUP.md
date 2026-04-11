# MongoDB Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for a free account
3. Create a free cluster

## 2. Create Database Access
1. Open `Database Access`
2. Add a database user
3. Give the user read and write access
4. Save the username and password securely

## 3. Create Network Access
1. Open `Network Access`
2. Add your current IP address
3. For development only, you can temporarily allow `0.0.0.0/0`

## 4. Get Your Connection String
1. Click `Connect`
2. Choose `Drivers`
3. Copy the Node.js connection string
4. Replace `<password>` with your actual Atlas password

## 5. Update `.env.local`

Use either of these formats:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/smpay?retryWrites=true&w=majority
JWT_SECRET=use-a-strong-random-secret
```

If SRV lookup fails on your machine, use the non-SRV version instead:

```env
MONGODB_URI=mongodb://USERNAME:PASSWORD@HOST1:27017,HOST2:27017,HOST3:27017/smpay?authSource=admin&replicaSet=YOUR_REPLICA_SET&tls=true&retryWrites=true&w=majority
JWT_SECRET=use-a-strong-random-secret
```

## 6. Test

```bash
npm run dev
```

Then open:

- [http://localhost:3000/signup](http://localhost:3000/signup)
- [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 7. Common Atlas Failures

- `querySrv ECONNREFUSED`: local DNS cannot resolve the SRV record, so switch to a non-SRV connection string
- `Could not connect to any servers ... IP whitelist`: your current machine is not allowed in Atlas Network Access
- authentication error: username or password is incorrect

## Security

- use a strong `JWT_SECRET`
- limit Atlas IP access in production
- keep `.env.local` out of version control
