# EDGE Audit - Professional Audit Management Platform

A comprehensive audit management platform built with Next.js 16, React 19, and TypeScript. Streamline your audit processes with custom forms, real-time data collection, and comprehensive audit management.

## 🚀 Features

### Core Features
- ✅ **Drag-and-Drop Form Builder** - Create custom forms with 10 field types
- ✅ **Form Templates** - Pre-built templates for various industries
- ✅ **Real-time Submissions** - Collect and manage form data
- ✅ **Work Order Management** - Full lifecycle from draft to completion
- ✅ **Task Scheduling** - Assign and track tasks with due dates
- ✅ **Analytics Dashboard** - Charts, statistics, and insights
- ✅ **Image Upload** - Capture and upload photos
- ✅ **Digital Signatures** - Canvas-based signature capture
- ✅ **GPS Location** - Auto-capture location data
- ✅ **PDF Export** - Generate PDFs from submissions
- ✅ **CSV Export** - Export submission data
- ✅ **Search & Filter** - Find submissions quickly
- ✅ **User Authentication** - Registration, login, session management
- ✅ **User Roles** - Admin, Manager, Field Worker, Viewer
- ✅ **Conditional Logic** - Show/hide fields dynamically
- ✅ **Calculations** - Auto-calculate form fields
- ✅ **Email Notifications** - Task and submission alerts

### Field Types
- Short Text
- Long Text (Textarea)
- Email
- Phone
- Date
- Checkbox
- Radio Buttons
- Dropdown (Select)
- Image Upload
- Signature

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wookleytbo/EDGE_Audit.git
   cd EDGE_Audit
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: Using `--legacy-peer-deps` to resolve React 19 peer dependency conflicts.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Creating Forms
1. Go to `/builder`
2. Add fields from the left panel
3. Configure field properties (label, placeholder, required, conditional rules)
4. Save your form

### Using Templates
1. Go to `/templates`
2. Browse pre-built templates
3. Click "Use Template" to customize
4. Or preview first to see the structure

### Submitting Forms
1. Go to `/form/[formId]`
2. Fill out the form
3. Upload images if needed
4. Sign if required
5. Submit (GPS location is auto-captured)

### Managing Work Orders
1. Go to `/work-orders`
2. Create a new work order
3. Assign to team members
4. Track status: Draft → Assigned → In Progress → Completed
5. Add notes and update priority

### Viewing Analytics
1. Go to `/analytics`
2. View submission statistics
3. See charts for submissions over time
4. Analyze form performance
5. Check top submitters

## 📁 Project Structure

```
EDGE_Audit/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── forms/        # Form CRUD operations
│   │   ├── submissions/  # Submission management
│   │   ├── work-orders/  # Work order management
│   │   └── scheduling/   # Task scheduling
│   ├── analytics/         # Analytics dashboard
│   ├── builder/           # Form builder
│   ├── form/              # Form submission pages
│   ├── login/             # Authentication pages
│   ├── scheduling/        # Task scheduling
│   ├── submissions/       # Submission management
│   ├── templates/         # Template gallery
│   └── work-orders/       # Work order management
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities and services
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database layer (in-memory)
│   ├── conditional-logic.ts  # Conditional field logic
│   ├── pdf-generator.ts  # PDF generation
│   ├── email-service.ts  # Email notifications
│   └── permissions.ts    # Role-based permissions
└── public/               # Static assets
```

## 🔐 Authentication

The app includes a simple session-based authentication system:
- User registration with role selection
- Login/logout functionality
- Session management via cookies
- Role-based permissions

**Roles:**
- **Admin**: Full access to all features
- **Manager**: Can create forms, manage work orders, view analytics
- **Field Worker**: Can submit forms and update assigned work orders
- **Viewer**: Read-only access

## 🗄️ Database

Currently uses in-memory storage for development. To use a real database:

1. **PostgreSQL/MongoDB**: Replace `lib/db.ts` with database queries
2. **Supabase**: Use Supabase client library
3. **Prisma**: Add Prisma ORM for type-safe database access

## 📧 Email Notifications

Email service is set up but uses console logging by default. To enable real emails:

1. **SendGrid**: Update `lib/email-service.ts` with SendGrid API
2. **Resend**: Use Resend API for email delivery
3. **SMTP**: Configure SMTP server settings

## 📄 PDF Export

Currently generates HTML that can be printed as PDF. For better PDF generation:

1. **jsPDF**: Install and integrate jsPDF library
2. **pdfkit**: Use pdfkit for server-side PDF generation
3. **Puppeteer**: Use Puppeteer for HTML-to-PDF conversion

## 🌍 GPS Location

Uses browser Geolocation API with reverse geocoding. For production:

1. Use a geocoding service (Google Maps API, Mapbox)
2. Store coordinates in database
3. Add map visualization

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Connect GitHub repository
- **Railway**: Deploy with PostgreSQL
- **AWS**: Use Amplify or EC2

## 📝 Environment Variables

Create a `.env.local` file:

```env
# Database (when using real database)
DATABASE_URL=your_database_url

# Email Service
EMAIL_API_KEY=your_email_api_key

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Design inspiration from [PAC Group](https://www.pacgroup.com)

---

**EDGE Audit - Professional Audit Management Platform**

**Built with ❤️ using Next.js and TypeScript**

