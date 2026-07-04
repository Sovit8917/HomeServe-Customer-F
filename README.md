# HomeServe — Worker Web App (Next.js)

Responsive desktop-first web app for HomeServe service providers.

## Stack
- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- **Zustand** — auth state · **Axios** — API client with JWT
- **Socket.IO Client** — live chat · **Recharts** — earnings charts
- **React Hot Toast** — notifications · **Lucide React** — icons

## Pages Built (20 screens)
- ✅ Auth — Login (split-screen), OTP verify, Complete Profile
- ✅ Dashboard — Stats, today's jobs, online toggle, wallet widget
- ✅ Jobs — Tabbed list (All / New / Upcoming / Completed / Cancelled)
- ✅ Job Detail — Accept / Reject / Start / Complete + Navigate + Chat
- ✅ Earnings — Wallet balance, withdraw, period earnings, transactions
- ✅ Schedule — Working hours per day with toggle
- ✅ Reviews — Rating summary + customer reviews list
- ✅ Notifications — Read/unread list
- ✅ Profile — Full stats + settings menu
- ✅ Skills — Add/remove skills with suggestions
- ✅ Chat — Real-time customer chat per booking
- ✅ Support — Raise ticket + FAQ accordion

## Quick Start
```bash
npm install
# .env.local is already configured for localhost
npm run dev
# Opens at http://localhost:3002
```

## API Endpoints Used
| Feature       | Endpoint                               |
|---------------|----------------------------------------|
| Auth          | POST /auth/send-otp, /auth/verify-otp  |
| Profile       | GET/PUT /workers/profile               |
| Jobs          | GET /bookings/worker/* (today/upcoming/pending) |
| Job actions   | PUT /bookings/:id/(accept/reject/start/complete) |
| Earnings      | GET /wallet/worker/earnings?period=    |
| Wallet        | GET /wallet/worker, POST /wallet/worker/withdraw |
| Chat          | GET /chat/:bookingId/messages          |
| Working hours | GET/PUT /workers/working-hours         |
| Skills        | PUT /workers/skills                    |
| Reviews       | GET /workers/:id/reviews               |
| Notifications | GET /notifications                     |
| Support       | POST /support/tickets                  |
