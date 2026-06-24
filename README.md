# Tutoring Platform Backend API

A comprehensive backend API for a tutoring platform built with Express.js, Prisma, and Better-auth.

## 🚀 Features

- **User Authentication & Authorization** (Better-auth)
  - Email/Password authentication
  - Session-based authentication with secure cookies
  - Role-based access control (Admin, Tutor, Student)
  - Email verification

- **User Management**
  - User registration and login
  - Profile management
  - User status management (Active, Banned)

- **Tutor Features**
  - Tutor profile creation and management
  - Availability management
  - Dashboard with statistics

- **Student Features**
  - Browse and filter tutors
  - Book tutoring sessions
  - Write reviews
  - Dashboard with booking history

- **Admin Features**
  - User management
  - Booking management
  - Platform statistics dashboard
  - Category management

- **Payment Integration**
  - SSLCommerz payment gateway integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- pnpm package manager

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Assignment-4-(Backend)
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your_postgresql_connection_string"
BETTER_AUTH_SECRET="your_secret_key"
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
STORE_ID=your_store_id
STORE_PASSWORD=your_store_password
```

4. **Run database migrations**
```bash
pnpm dlx prisma migrate dev
```

5. **Generate Prisma Client**
```bash
pnpm dlx prisma generate
```

6. **Start development server**
```bash
pnpm dev
```

Server will be running on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── app.ts                 # Express app setup
├── server.ts             # Server entry point
├── lib/
│   ├── auth.ts          # Better-auth configuration
│   └── prisma.ts        # Prisma client
├── middleware/
│   ├── auth.middleware.ts      # Authentication middleware
│   ├── globalErrorHandler.ts  # Error handling
│   └── notFound.ts            # 404 handler
└── modules/
    ├── admin/           # Admin routes & controllers
    ├── student/         # Student routes & controllers
    ├── tutor/          # Tutor routes & controllers
    └── payment/        # Payment routes & controllers
```

## 🔐 Authentication

The API uses Better-auth for authentication with the following endpoints:

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in/email` - Login with email
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

### Protected Routes

Protected routes require:
1. Valid session cookie
2. Verified email
3. Appropriate role (Admin/Tutor/Student)

Example request with authentication:
```javascript
fetch('http://localhost:5000/api/v1/student/dashboard', {
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## 📚 API Endpoints

### Public Routes
- `GET /` - Health check
- `GET /api/v1/all/category` - Get all categories
- `GET /api/v1/tutor/filter` - Filter tutors
- `GET /api/v1/tutor/:id` - Get single tutor
- `GET /api/v1/public/tutors` - Get all tutor profiles

### Student Routes (Protected)
- `GET /api/v1/student/dashboard` - Get student dashboard
- `GET /api/v1/my-bookings` - Get my bookings
- `POST /api/v1/bookings` - Create new booking
- `POST /api/v1/student/review` - Create review
- `PATCH /api/v1/student/profile/update` - Update profile

### Tutor Routes (Protected)
- `GET /api/v1/all/data/tutor` - Get tutor dashboard
- `POST /api/v1/create/tutor-profile` - Create tutor profile
- `POST /api/v1/availability/tutor` - Manage availability
- `PATCH /api/v1/all/data/tutor` - Update tutor profile

### Admin Routes (Protected)
- `GET /api/v1/dashboard` - Get admin dashboard stats
- `GET /api/v1/users` - Get all users
- `PATCH /api/v1/users/:userId/status` - Change user status
- `GET /api/v1/bookings` - Get all bookings
- `POST /api/v1/create/category` - Create category

### Payment Routes
- `POST /api/payment/*` - Payment related endpoints

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## 🔧 Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm dlx prisma studio` - Open Prisma Studio
- `pnpm dlx prisma migrate dev` - Run migrations in development
- `pnpm dlx prisma generate` - Generate Prisma Client

## 🧪 Testing

### Using Postman/Thunder Client

1. **Register a user**
```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

2. **Login**
```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

3. **Access protected route**
```http
GET /api/v1/student/dashboard
Cookie: better-auth.session_token=<token-from-login>
```

## 🐛 Common Issues

### "No session found" Error
- Ensure cookies are being sent from frontend
- Check `credentials: 'include'` in fetch requests
- Verify CORS configuration
- Check environment variables `APP_URL` and `FRONTEND_URL`

### Database Connection Errors
- Verify `DATABASE_URL` in `.env`
- Ensure database is running
- Run migrations: `pnpm dlx prisma migrate dev`

### Role Permission Errors
- Check user role in database
- Verify middleware is configured correctly
- Default role is `STUDENT`, change in database if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

ISC

## 👥 Support

For issues and questions, please open an issue on GitHub.
