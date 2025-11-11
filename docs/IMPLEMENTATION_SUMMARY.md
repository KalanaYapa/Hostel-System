# Hostel Management System - Implementation Summary

## Overview
A complete multi-tenant hostel management system built with Next.js, TypeScript, DynamoDB, and AWS.

## System Architecture

### Database Design
- **Single Table Design in DynamoDB** (cost-efficient approach)
- Table Name: `hostel-management`
- Entity Types: STUDENT, ROOM, MAINTENANCE, FOOD_MENU, FOOD_ORDER, EMERGENCY_CONTACT, PAYMENT, ATTENDANCE

### Authentication
- **Student Authentication**: Student ID + Password with JWT tokens
- **Admin Authentication**: Simple password-based (environment variable)
- JWT token expiry: 7 days for students, 24 hours for admin

## Features Implemented

### Student Portal (`/student`)

#### 1. Authentication
- **Signup** (`/student/signup`)
  - Student ID (primary key)
  - Password (hashed with bcrypt)
  - Name, Email, Phone
  - Multi-tenant support

- **Login** (`/student/login`)
  - Student ID + Password authentication
  - JWT token generation

#### 2. Student Dashboard (`/student/dashboard`)
- View personal information (Student ID, Name, Email, Phone)
- View assigned Branch and Room Number
- View Fee payment status
- Quick access to all features

#### 3. Fee Payment (`/student/dashboard/fees`)
- View fee status (Paid/Unpaid)
- Simple payment interface (₹5,000 standard fee)
- Payment history with timestamps
- Payment ID tracking
- Auto-update fee status after payment

#### 4. Maintenance Requests (`/student/dashboard/maintenance`)
- Submit maintenance requests with:
  - Issue type (Plumbing, Electrical, Furniture, Cleaning, AC/Heating, Internet, Other)
  - Detailed description
  - Auto-populated branch and room from student profile
- View request history
- Track status (Pending, In-Progress, Completed, Rejected)
- Request ID tracking

#### 5. Food Ordering (`/student/dashboard/food`)
- Browse available food menu
- Add items to cart
- Adjust quantities
- View total amount
- Place orders
- View order history with status tracking
- Order status: Pending, Preparing, Delivered, Cancelled

#### 6. Emergency Contacts (`/student/dashboard/emergency`)
- View emergency contacts by category:
  - Medical
  - Transport
  - Security
  - Other
- 24/7 availability indicators
- Click-to-call functionality
- Email links for emergency contacts

### Admin Portal (`/admin`)

#### 1. Admin Authentication
- **Login** (`/admin/login`)
  - Simple password-based login (no email required)
  - Admin password stored in environment variable: `ADMIN_PASSWORD`
  - Default password: `admin@hostel2024`

#### 2. Admin Dashboard (`/admin/dashboard`)
- Real-time statistics:
  - Total Students / Active Students
  - Total Rooms / Occupied Rooms
  - Pending Maintenance Requests
  - Pending Food Orders
  - Fee Payment Status (Paid/Unpaid counts)
- Quick access to all management sections

#### 3. Student Management (`/admin/dashboard/students`)
- View all students in a table
- Search by name, ID, or email
- Assign/Update:
  - Branch (e.g., "A-Block", "North Wing")
  - Room Number
- View student details:
  - Contact information
  - Registration date
  - Fee status
  - Active/Inactive status
- Deactivate students
- Edit student assignments via modal

## API Routes

### Student APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/student/signup` | POST | Register new student |
| `/api/auth/student/login` | POST | Student login |
| `/api/student/payment` | POST | Process fee payment |
| `/api/student/payment` | GET | Get payment history |
| `/api/student/maintenance` | POST | Submit maintenance request |
| `/api/student/maintenance` | GET | Get maintenance requests |
| `/api/student/food` | GET | Get menu & orders |
| `/api/student/food` | POST | Place food order |
| `/api/student/emergency` | GET | Get emergency contacts |

### Admin APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/admin/login` | POST | Admin login |
| `/api/admin/stats` | GET | Get dashboard statistics |
| `/api/admin/students` | GET | Get all students |
| `/api/admin/students` | PATCH | Update student info |
| `/api/admin/students` | DELETE | Deactivate student |
| `/api/admin/food` | GET | Get menu & orders |
| `/api/admin/food` | POST | Add menu item |
| `/api/admin/food` | PATCH | Update menu item |
| `/api/admin/food` | DELETE | Delete menu item |
| `/api/admin/emergency` | GET | Get emergency contacts |
| `/api/admin/emergency` | POST | Add emergency contact |
| `/api/admin/emergency` | PATCH | Update emergency contact |
| `/api/admin/emergency` | DELETE | Delete emergency contact |
| `/api/admin/maintenance` | GET | Get all maintenance requests |
| `/api/admin/maintenance` | PATCH | Update request status |

## Environment Variables

Create/Update `.env.local`:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Admin Authentication
ADMIN_PASSWORD=admin@hostel2024

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# DynamoDB Table
DYNAMODB_TABLE_NAME=hostel-management
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

Dependencies installed:
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- @aws-sdk/client-dynamodb
- @aws-sdk/lib-dynamodb

### 2. Setup DynamoDB Table

The table `hostel-management` needs to be created in AWS DynamoDB with:
- **Primary Key**: `PK` (String)
- **Sort Key**: `SK` (String)

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Application

- **Home Page**: http://localhost:3000
- **Student Login**: http://localhost:3000/student/login
- **Student Signup**: http://localhost:3000/student/signup
- **Admin Login**: http://localhost:3000/admin/login (Password: `admin@hostel2024`)

## Usage Flow

### For Students:
1. **Sign up** with Student ID, password, name, email, phone
2. **Login** to access dashboard
3. Wait for admin to assign branch and room
4. Access features:
   - Pay hostel fees
   - Submit maintenance requests
   - Order food (when menu is available)
   - View emergency contacts

### For Admin:
1. **Login** with admin password
2. **Dashboard** - View overall statistics
3. **Student Management** - Assign rooms and branches
4. **Food Menu** - Add/manage food items (API ready, UI can be added)
5. **Emergency Contacts** - Add/manage contacts (API ready, UI can be added)
6. **Maintenance** - View and update request status (API ready, UI can be added)

## What's Implemented

### ✅ Completed
- Single table DynamoDB design (cost-efficient)
- Student authentication (signup/login with Student ID + password)
- Admin authentication (password-only)
- Student dashboard with multi-tenant support
- Fee payment system
- Maintenance request system
- Food ordering system
- Emergency contacts viewing
- Admin dashboard with statistics
- Student management (view, search, assign room/branch, deactivate)
- All API routes for CRUD operations

### 🔨 API Ready (UI Can Be Added)
The following features have complete API routes but admin UI pages can be added later:
- Admin food menu management
- Admin emergency contact management
- Admin maintenance request management
- Room and branch statistics
- Attendance tracking

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT authentication with token expiry
- Admin-only routes protected
- Student routes require authentication
- Student ID as primary key (immutable)
- Proper error handling

## Cost Optimization

- **Single Table Design**: Reduces DynamoDB costs by using one table for all entities
- **On-Demand Billing**: No wasted capacity
- **Efficient Queries**: Uses PK and SK for fast lookups

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── admin/login/route.ts
│   │   │   └── student/
│   │   │       ├── login/route.ts
│   │   │       └── signup/route.ts
│   │   ├── admin/
│   │   │   ├── stats/route.ts
│   │   │   ├── students/route.ts
│   │   │   ├── food/route.ts
│   │   │   ├── emergency/route.ts
│   │   │   └── maintenance/route.ts
│   │   └── student/
│   │       ├── payment/route.ts
│   │       ├── maintenance/route.ts
│   │       ├── food/route.ts
│   │       └── emergency/route.ts
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── students/page.tsx
│   ├── student/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── fees/page.tsx
│   │       ├── maintenance/page.tsx
│   │       ├── food/page.tsx
│   │       └── emergency/page.tsx
│   └── page.tsx (Home page with portal selection)
└── lib/
    ├── dynamodb.ts (Database service & types)
    └── auth.ts (Authentication utilities)
```

## Next Steps (Optional Enhancements)

1. **Admin UI Pages** - Complete UI for:
   - Food menu management
   - Emergency contact management
   - Maintenance request approval
   - Room and branch management
   - Statistics and reports

2. **Features**:
   - Email notifications for maintenance updates
   - Real payment gateway integration
   - File upload for maintenance images
   - Attendance QR code system
   - Mobile app with React Native

3. **Improvements**:
   - Pagination for large lists
   - Advanced search and filters
   - Export data to CSV/Excel
   - Dashboard charts and graphs
   - Multi-language support

## Troubleshooting

### Cannot connect to DynamoDB
- Verify AWS credentials in `.env.local`
- Ensure DynamoDB table exists with correct PK/SK
- Check AWS region configuration

### Login not working
- Clear browser localStorage
- Check JWT_SECRET is set in `.env.local`
- Verify passwords are correct

### Student can't access features
- Admin must assign branch and room number first
- Check student is marked as active

## Support

For issues or questions:
1. Check environment variables are set correctly
2. Verify DynamoDB table structure
3. Check browser console for errors
4. Verify API routes are accessible

---

**Built with**: Next.js 15, TypeScript, TailwindCSS, AWS DynamoDB, bcryptjs, jsonwebtoken
**Architecture**: Single Table Design, JWT Authentication, Multi-tenant Support
**Deployment Ready**: Can be deployed to Vercel/AWS with proper environment variables
