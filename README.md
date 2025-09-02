# Payroo - Mini Payrun Application

A production-ready full-stack TypeScript application for managing employee payroll calculations, built following Domain-Driven Design principles.

<image src="./ss/final.png"/>
## 🌟 Features

- **Employee Management** - Create, update, and manage employee records
- **Timesheet Tracking** - Record and track employee working hours
- **Payroll Calculations** - Automated calculations with Australian tax and superannuation
- **Payslip Generation** - Generate detailed payslips for employees
- **Modern React Frontend** - Clean, responsive UI with TypeScript
- **RESTful API** - Comprehensive API with OpenAPI documentation
- **Production Ready** - Docker deployment with CI/CD pipeline

## 🚀 Tech Stack

### Backend

- **Node.js** with Express and TypeScript
- **Prisma ORM** with SQLite (dev) / PostgreSQL (prod)
- **Zod** for runtime validation
- **Jest** for comprehensive testing
- **Winston** for structured logging
- **Swagger/OpenAPI** for API documentation

### Frontend

- **React 18** with TypeScript and Vite
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Tailwind CSS** for modern styling
- **React Router** for navigation

### DevOps

- **Docker** with multi-stage builds
- **GitHub Actions** for CI/CD
- **ESLint & Prettier** for code quality
- **Nginx** for production serving

## ⚡ Quick Start

### Option 1: Automated Setup (Windows)

```powershell
.\setup.ps1
```

### Option 2: Manual Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd payroo
   ```
2. **Install API dependencies**

   ```bash
   cd api
   npm install
   ```
3. **Setup database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Create and migrate database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```
4. **Install Web dependencies**

   ```bash
   cd ../web
   npm install
   ```
5. **Start development servers**

   **Terminal 1 - API Server:**

   ```bash
   cd api
   npm run dev
   ```

   **Terminal 2 - Web Server:**

   ```bash
   cd web
   npm run dev
   ```
6. **Access the application**

   - Web App: http://localhost:3000
   - API: http://localhost:4000
   - API Health Check: http://localhost:4000/health

## 🏗️ Architecture

### Backend (API)

- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: Bearer token (simplified for demo)
- **Validation**: Zod schemas
- **Testing**: Jest
- **Structure**:
  ```
  api/
  ├── src/
  │   ├── domain/          # Business logic & calculations
  │   ├── routes/          # API endpoints
  │   ├── lib/             # Utilities (DB, auth, logging)
  │   ├── test/            # Tests
  │   └── scripts/         # Seed scripts
  ├── prisma/              # Database schema & migrations
  └── package.json
  ```

### Frontend (Web)

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **Structure**:
  ```
  web/
  ├── src/
  │   ├── components/      # Reusable UI components
  │   ├── pages/           # Page components
  │   ├── api/             # API client & hooks
  │   ├── types/           # TypeScript type definitions
  │   └── App.tsx
  └── package.json
  ```

## 💼 Business Logic

### Pay Calculation Rules

**Gross Pay (Hourly Employees)**:

- Normal hours: `hours × base_rate`
- Overtime: `overtime_hours × base_rate × 1.5` (anything above 38 hours/week)
- Plus allowances

**Tax Calculation** (simplified for exercise):

- $0-$370: 0%
- $370.01-$900: 10% of amount over $370
- $900.01-$1,500: +19% of amount over $900
- $1,500.01-$3,000: +32.5% of amount over $1,500
- $3,000.01-$5,000: +37% of amount over $3,000
- $5,000+: +45% of amount over $5,000

**Other Calculations**:

- Superannuation: 11.5% of gross pay
- Net pay: gross - tax

### Reference Test Data

Period: 2025-08-11 → 2025-08-17

- **Alice**: 37.0 normal hrs, gross $1,325.00, tax $133.75, super $152.38, net $1,191.25
- **Bob**: 38.0 normal + 7.0 overtime, gross $2,328.00, tax $436.10, super $267.72, net $1,891.90

## 🔧 Development

### API Commands

```bash
cd api
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run typecheck    # TypeScript type checking
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

### Web Commands

```bash
cd web
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run typecheck    # TypeScript type checking
```

## 📝 API Documentation

The API follows the OpenAPI 3.1 specification. See `openapi.yaml` for the complete API contract.

### Key Endpoints

- `GET /health` - Health check
- `GET /employees` - List employees
- `POST /employees` - Create/update employee
- `POST /timesheets` - Create/update timesheet
- `POST /payruns` - Generate payrun
- `GET /payruns` - List payruns
- `GET /payruns/{id}` - Get payrun details
- `GET /payslips/{employeeId}/{payrunId}` - Get individual payslip

### Authentication

For demo purposes, any non-empty Bearer token is accepted:

```bash
curl -H "Authorization: Bearer demo-token" http://localhost:4000/employees
```

## 🧪 Testing

### Backend Tests

- Unit tests for tax & pay calculation logic
- Integration tests for API endpoints
- Run with: `cd api && npm test`

### Frontend Tests

- Component unit tests (to be implemented)
- Run with: `cd web && npm test`

## 🎨 Accessibility Features

- Semantic HTML elements
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast color scheme
- Focus indicators

## 🔒 Security Features

- Input validation with Zod schemas
- SQL injection protection via Prisma
- CORS configuration
- Helmet.js security headers
- Request logging with structured JSON
- Bearer token authentication

## 📊 Data Models

### Employee

```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  type: 'hourly';
  baseHourlyRate: number;
  superRate: number;
  bank?: {
    bsb: string;
    account: string;
  };
}
```

### Timesheet

```typescript
interface Timesheet {
  employeeId: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  entries: TimesheetEntry[];
  allowances: number;
}

interface TimesheetEntry {
  date: string;        // YYYY-MM-DD
  start: string;       // HH:MM
  end: string;         // HH:MM
  unpaidBreakMins: number;
}
```

### Payrun & Payslip

```typescript
interface Payrun {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: PayrunTotals;
  payslips: Payslip[];
  createdAt: Date;
}

interface Payslip {
  employeeId: string;
  normalHours: number;
  overtimeHours: number;
  gross: number;
  tax: number;
  super: number;
  net: number;
}
```

## 🚀 Production Deployment

### Environment Variables

```bash
# API (.env)
PORT=4000
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL="file:./prod.db"

# Web (.env)
VITE_API_BASE_URL=https://api.payroo.com
VITE_API_TOKEN=your-production-token
```

### Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Validation**: Zod
- **Testing**: Jest
- **Security**: Helmet, CORS
- **Logging**: Structured JSON logs

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **Testing**: Jest + React Testing Library

## 📈 Performance Considerations

- Database indexing on frequently queried fields
- Request/response compression
- Structured logging for observability
- Connection pooling with Prisma
- React Query caching for reduced API calls
- Code splitting and lazy loading (frontend)

## 🔮 Future Enhancements

- Real JWT authentication with refresh tokens
- Role-based access control
- PDF payslip generation
- Email notifications
- Audit logging
- Advanced reporting & analytics
- Multi-tenant support
- Mobile responsive improvements
- AWS deployment with CDK/Terraform
- CI/CD pipeline with GitHub Actions

## 📄 License

MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linting and type checking
5. Submit a pull request

---

Built with ❤️ using TypeScript, React, and Node.js
