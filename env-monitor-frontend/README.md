# Environment Monitor

A modern Angular application for monitoring and managing environment statuses across your infrastructure.

## 🚀 Features

- **Visual Environment Cards**: Color-coded status indicators (Green/Yellow/Red)
- **Real-time Updates**: Track version, owner, and degradation reasons
- **Responsive Grid Layout**: Beautiful, modern UI that works on all devices
- **Backend-Ready Architecture**: Easy migration from localStorage to microservices

## 🛠️ Tech Stack

- Angular 19 (standalone components)
- TypeScript
- SCSS
- RxJS for reactive programming

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open browser to http://localhost:4200
```

## 🏗️ Project Structure

```
src/app/
├── core/                          # Core application services and models
│   ├── models/
│   │   └── environment.model.ts   # Data models and DTOs
│   └── services/
│       └── api.service.ts         # HTTP client wrapper (future backend)
├── features/
│   └── environments/              # Environment monitoring feature
│       ├── components/
│       │   ├── env-card/          # Individual environment card
│       │   ├── env-grid/          # Grid container and layout
│       │   └── env-edit-modal/    # Edit form (TODO)
│       └── services/
│           └── environment.service.ts  # Business logic
└── shared/                        # Shared components and utilities
```

## 🎯 Current Implementation

### Data Storage
- **Currently**: localStorage for persistence
- **Future**: REST API calls to microservices

### Mock Data
The app initializes with 4 sample environments:
- Production (Working)
- Staging (Partial)
- Development (Down)
- Testing (Working)

## 🔄 Migration Path to Backend

When you're ready to connect to microservices:

### 1. Update environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // Your API gateway
};
```

### 2. Uncomment API calls in environment.service.ts
```typescript
// Replace this:
getAll(): Observable<Environment[]> {
  return of(this.environmentsSubject.value);
}

// With this:
getAll(): Observable<Environment[]> {
  return this.apiService.get<Environment[]>('/environments');
}
```

### 3. Expected Microservices Architecture
```
API Gateway (Port 3000)
├── Environment Service (CRUD operations)
├── Audit Service (Track changes)
└── Notification Service (Alerts on status change)
```

## 🎨 Features Implemented

✅ Environment card component with status colors  
✅ Responsive grid layout  
✅ Time-ago display for updates  
✅ Status statistics dashboard  
✅ localStorage persistence  
✅ Reactive data flow with RxJS  

## 📝 TODO

- [ ] Edit modal component
- [ ] Create environment form
- [ ] Delete confirmation
- [ ] Search/filter environments
- [ ] Backend API integration
- [ ] WebSocket for real-time updates
- [ ] User authentication
- [ ] Role-based access control

## 🚢 Deployment Ready

The project is structured to be easily deployable to:
- Docker containers
- Kubernetes clusters
- Cloud platforms (AWS, Azure, GCP)

## 📖 Usage

### View Environments
All environments are displayed on the main screen with their current status.

### Status Colors
- 🟢 **Green**: Environment is operational
- 🟡 **Yellow**: Environment is degraded/partial
- 🔴 **Red**: Environment is down

### Environment Information
Each card shows:
- Environment name
- Current version
- Owner/team
- Status
- Degradation reason (if applicable)
- Last updated time and user

### Click to Edit
Click any environment card to open edit options (coming soon).

## 🔧 Development

```bash
# Run tests
ng test

# Build for production
ng build --configuration production

# Lint code
ng lint
```

## 📊 Future Enhancements

1. **Backend Integration**
   - REST API for CRUD operations
   - WebSocket for real-time updates
   - Authentication & authorization

2. **Advanced Features**
   - Historical data and trends
   - Automated health checks
   - Alert notifications
   - Export/import configurations

3. **DevOps**
   - CI/CD pipeline
   - Docker containerization
   - Kubernetes deployment
   - Monitoring and logging

## 🤝 Contributing

This is a learning project to demonstrate modern Angular architecture and microservices preparation.

## 📄 License

MIT