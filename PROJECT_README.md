# Boost Admin Dashboard

A modern, feature-rich admin dashboard built with Angular 20, PrimeNG, and TailwindCSS.

## 🚀 Features

- **Modern UI**: Built with PrimeNG components and styled with TailwindCSS
- **Responsive Layout**: Mobile-first design with adaptive sidebar and navigation
- **Dark Mode Support**: Built-in dark mode with CSS variables
- **Type-Safe**: Fully typed with TypeScript
- **Signal-based State**: Modern Angular signals for reactive state management
- **Lazy Loading**: Route-based code splitting for optimal performance
- **Standalone Components**: Modern Angular standalone components architecture

## 📦 Tech Stack

- **Framework**: Angular 20
- **UI Library**: PrimeNG 20
- **CSS Framework**: TailwindCSS
- **Theme**: @primeuix/styled
- **Icons**: PrimeIcons
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with fetch API

## 🏗️ Project Structure

```
src/app/
├── admin/
│   ├── layout/
│   │   └── admin-layout.component.ts    # Main admin layout with sidebar & topbar
│   ├── dashboard/
│   │   └── dashboard.component.ts       # Dashboard with stat cards
│   ├── users/
│   │   └── users.component.ts           # User management with data table
│   ├── workouts/
│   │   └── workouts.component.ts        # Workout management
│   ├── foods/
│   │   └── foods.component.ts           # Food management with search
│   └── saved-workouts/
│       └── saved-workouts.component.ts  # Saved workouts view
├── core/
│   └── services/
│       ├── users.service.ts             # Users API service
│       ├── workouts.service.ts          # Workouts API service
│       ├── foods.service.ts             # Foods API service
│       └── saved-workouts.service.ts    # Saved workouts API service
├── app.config.ts                        # App configuration & providers
├── app.routes.ts                        # Routing configuration
└── app.ts                               # Root component
```

## 📄 Pages

### Dashboard
- **Route**: `/admin/dashboard`
- **Features**:
  - Stat cards displaying counts for Users, Workouts, Foods, and Saved Workouts
  - Loading skeleton states
  - Real-time data fetching from API

### User Management
- **Route**: `/admin/users`
- **Features**:
  - Sortable data table with pagination
  - Displays: name, email, role, verification status, created date
  - Actions: View, Edit, Delete
  - Verified/Unverified status tags

### Workout Management
- **Route**: `/admin/workouts`
- **Features**:
  - Filter dropdown by category
  - Sortable data table
  - Displays: name, description, difficulty, duration, category
  - Actions: Create, Edit, Delete

### Food Management
- **Route**: `/admin/foods`
- **Features**:
  - Search input for food lookup
  - Filter buttons: High Protein, Low Calorie
  - Sortable data table
  - Displays: name, calories, protein, carbs, fat, category
  - Actions: Create, Edit, Delete

### Saved Workouts
- **Route**: `/admin/saved-workouts`
- **Features**:
  - Data table of saved workouts
  - Displays: workout name, user ID, notes, saved date
  - Actions: View, Delete

## 🎨 Design System

### Layout
- **Sidebar**: Fixed width (256px) with panel menu navigation
- **Topbar**: Sticky toolbar with branding and profile menu
- **Content Area**: Responsive grid layouts with gap spacing

### Components
All UI components use PrimeNG:
- `p-panelMenu` - Sidebar navigation
- `p-toolbar` - Top navigation bar
- `p-card` - Content containers
- `p-table` - Data tables with sorting & pagination
- `p-button` - Action buttons
- `p-select` - Dropdown filters
- `p-inputText` - Text inputs
- `p-tag` - Status badges
- `p-skeleton` - Loading states

### Styling Rules
- ✅ Use PrimeNG components for all UI elements
- ✅ Use Tailwind utility classes for layout, spacing, and responsiveness
- ❌ Do not use inline styles
- ❌ Do not use Bootstrap or custom CSS frameworks
- ✅ Prefer composition of Tailwind classes over custom CSS

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`

### Build

```bash
# Production build
npm run build
```

### Testing

```bash
# Run tests
npm test
```

## 🌐 API Integration

The dashboard connects to REST API endpoints:

### Endpoints

**Users**
- `GET /api/users` - List all users
- `GET /api/users/count` - Get total users count
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Workouts**
- `GET /api/workouts` - List all workouts
- `GET /api/workouts/count` - Get total workouts count
- `GET /api/workouts/filters` - Get available filters
- `GET /api/workouts/:id` - Get single workout
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

**Foods**
- `GET /api/foods` - List all foods
- `GET /api/foods/count` - Get total foods count
- `GET /api/foods/search?q={query}` - Search foods
- `GET /api/foods/high-protein` - Get high protein foods
- `GET /api/foods/low-calorie` - Get low calorie foods
- `GET /api/foods/:id` - Get single food
- `POST /api/foods` - Create food
- `PUT /api/foods/:id` - Update food
- `DELETE /api/foods/:id` - Delete food

**Saved Workouts**
- `GET /api/saved-workouts` - List all saved workouts
- `GET /api/saved-workouts/count` - Get total saved workouts count
- `GET /api/saved-workouts/:id` - Get single saved workout
- `DELETE /api/saved-workouts/:id` - Delete saved workout

### Environment Configuration

Update API base URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Your API URL
};
```

## 🎯 Best Practices

### Angular
- Uses standalone components (no NgModules)
- Signals for reactive state management
- OnPush change detection strategy
- Lazy loading for all routes
- `input()` and `output()` functions instead of decorators
- `inject()` function for dependency injection

### TypeScript
- Strict type checking enabled
- Interface definitions for all data models
- Type inference where possible
- Avoid `any` type

### PrimeNG
- Imports only required modules per component
- Uses PrimeNG's theming system
- Dark mode support via CSS selector

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the maintainers for contribution guidelines.
