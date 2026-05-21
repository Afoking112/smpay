# SM Pay

SM Pay is a Next.js fintech starter focused on wallet funding, airtime and data purchases, and transaction visibility.

## Current Product Scope

- User signup and login with JWT-based GraphQL auth
- Admin signup and login foundation
- Wallet balance and recent transaction dashboard
- Paystack wallet funding flow with verification support
- VTU-backed airtime and data purchase actions
- Health endpoint for environment and database diagnostics

## Stack

- Next.js App Router
- Apollo Client and Apollo Server
- MongoDB with Mongoose
- Paystack
- VTU service integration
- Tailwind CSS

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Review and update the existing `.env` file:

```bash
notepad .env
```

3. Make sure `.env` includes the required environment variables:

```env
MONGODB_URI=
JWT_SECRET=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
VTPASS_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
SMTP_FROM=
```

For Gmail SMTP, `SMTP_PASS` must be a Gmail App Password, not the normal account password.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` starts the app in development
- `npm run build` creates the production build
- `npm run start` runs the production server
- `npm run lint` runs ESLint

## Routes

- `/` landing page
- `/signup` user signup
- `/login` user login
- `/dashboard` authenticated user dashboard
- `/admin/signup` canonical admin signup route
- `/admin/login` canonical admin login route
- `/Adminsignup` legacy admin signup route
- `/Adminlogin` legacy admin login route
- `/about` product overview
- `/contact` support and partnership contact page
- `/payment/success` Paystack return and wallet verification page
- `/payment/failed` payment follow-up page
- `/api/graphql` GraphQL API
- `/api/paystack/webhook` Paystack webhook receiver
- `/api/health` operational health check

## Health Check

The health endpoint returns JSON showing:

- whether the main environment variables are present
- whether MongoDB connection succeeds
- an overall `ok` boolean and timestamp

Example:

```bash
curl http://localhost:3000/api/health
```

If MongoDB is misconfigured or unreachable, this endpoint will return `503`.

## MongoDB Notes

This project expects a working MongoDB Atlas or compatible MongoDB connection string in `MONGODB_URI`.

If signup or login fails because the database will not connect:

- verify the cluster hostname in the URI
- confirm the username and password are correct
- whitelist your IP in MongoDB Atlas network access
- make sure DNS or your network can resolve the SRV host
- test `/api/health` to see the current connection error

This workspace now uses a non-SRV Atlas connection string locally to avoid the SRV DNS lookup failure that was happening on this machine. If `/api/health` still reports a database failure, the next thing to fix is usually Atlas IP/network access.

## Payment Notes

- Wallet funding initializes through Paystack
- The success return page verifies the payment and updates wallet state
- The webhook also protects against double-crediting the same reference

## Gift Card Alerts

- Gift card chats are saved in the support thread and appear in the admin dashboard as unread alerts
- If SMTP is configured, gift card chats send an email alert only to `adewoleafolabi90@gmail.com`
- `/api/health` now reports whether SMTP is configured for gift card email delivery

## Next Suggested Improvements

- Add a live data-plan catalog instead of manual plan ID entry
- Add status-change notes and audit history for service requests
- Add resend-OTP support and delivery audit logs for password reset emails
- Replace 5-second support chat polling with realtime updates or push notifications for admins
- Add About and Contact content management or CMS backing
- Add dashboard charts and richer transaction filtering
- Add tests for auth, funding, and service purchases
- Add route protection middleware if you want stronger edge-level guards
