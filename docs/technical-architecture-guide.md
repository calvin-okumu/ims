# Technical Architecture Guide: Banking Access Control System

## Overview

This comprehensive technical guide details the programming concepts, architectural patterns, and implementation strategies used in the Banking Access Control System. It serves as a reference for developers to understand the codebase structure and extend the application while maintaining enterprise-grade quality and versatility.

## 🏗️ System Architecture

### Core Architecture Principles

#### 1. **Modular Component Architecture**
The system follows a modular component architecture with clear separation of concerns:

```typescript
// Component Structure Pattern
components/
├── [FeatureName]/
│   ├── [ComponentName].tsx          // Main component
│   ├── [ComponentName].test.tsx     // Unit tests
│   ├── [ComponentName].stories.tsx  // Storybook stories (future)
│   └── index.ts                     // Barrel exports
```

#### 2. **API-First Design**
All business logic is abstracted through service layers:

```typescript
// Service Layer Pattern
services/
├── [feature]Service.ts              // Business logic abstraction
├── apiClient.ts                     // HTTP client configuration
└── types/
    └── [feature].ts                 // TypeScript interfaces
```

#### 3. **Proxy API Architecture**
Next.js API routes serve as proxies to external services:

```typescript
// API Route Pattern
app/api/[feature]/
├── route.ts                         // HTTP method handlers
├── [subfeature]/
│   └── route.ts                     // Nested API routes
└── __tests__/
    └── route.test.ts                // API route tests
```

## 🔧 Key Programming Concepts

### 1. **TypeScript Advanced Patterns**

#### Generic API Response Types
```typescript
// Generic API Response Pattern
interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  error?: string
}

// Usage in services
export interface Person {
  pin: string
  name: string
  deptCode: string
}

export type PersonResponse = ApiResponse<Person>
export type PersonsListResponse = ApiResponse<{
  records: Person[]
  total: number
}>
```

#### Conditional Types for API Methods
```typescript
// Conditional Type Pattern for HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type ApiRouteConfig<T extends HttpMethod> = {
  method: T
  path: string
  body?: T extends 'POST' | 'PUT' ? unknown : never
  response: T extends 'GET' ? ApiResponse : ApiResponse<void>
}
```

#### Utility Types for Form Handling
```typescript
// Form State Management Types
type FormField<T> = {
  value: T
  error?: string
  touched: boolean
}

type FormState<T> = {
  [K in keyof T]: FormField<T[K]>
}

// Usage
interface RegistrationForm {
  accountNumber: string
  principalName: string
  branchCode: string
}

type RegistrationFormState = FormState<RegistrationForm>
```

### 2. **React Advanced Patterns**

#### Custom Hook Composition
```typescript
// Custom Hook Pattern for API Calls
function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      if (response.code === 0) {
        setData(response.data || null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    execute()
  }, dependencies)

  return { data, loading, error, refetch: execute }
}

// Usage in components
function BranchSelector() {
  const { data: branches, loading, error } = useApiCall(
    () => branchService.getBranches(),
    []
  )

  if (loading) return <Skeleton />
  if (error) return <ErrorMessage message={error} />

  return (
    <select>
      {branches?.map(branch => (
        <option key={branch.id} value={branch.code}>
          {branch.name}
        </option>
      ))}
    </select>
  )
}
```

#### Compound Component Pattern
```typescript
// Compound Component Pattern for Forms
interface FormProps {
  onSubmit: (data: any) => void
  children: React.ReactNode
}

interface FormFieldProps {
  name: string
  label: string
  children: React.ReactNode
}

interface FormContextType {
  values: Record<string, any>
  errors: Record<string, string>
  setValue: (name: string, value: any) => void
  setError: (name: string, error: string) => void
}

const FormContext = createContext<FormContextType | null>(null)

function Form({ onSubmit, children }: FormProps) {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }, [values, onSubmit])

  return (
    <FormContext.Provider value={{ values, errors, setValue, setError }}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  )
}

function FormField({ name, label, children }: FormFieldProps) {
  const context = useContext(FormContext)
  if (!context) throw new Error('FormField must be used within Form')

  const { errors, setValue } = context
  const error = errors[name]

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {React.cloneElement(children as React.ReactElement, {
        id: name,
        name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(name, e.target.value),
        'aria-invalid': !!error
      })}
      {error && <span className="error">{error}</span>}
    </div>
  )
}

// Usage
function RegistrationForm() {
  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="accountNumber" label="Account Number">
        <input type="text" />
      </FormField>
      <FormField name="principalName" label="Principal Name">
        <input type="text" />
      </FormField>
      <button type="submit">Register</button>
    </Form>
  )
}
```

### 3. **API Design Patterns**

#### RESTful API Route Structure
```typescript
// API Route Pattern with Method Handlers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single resource
      const resource = await getResourceById(id)
      return NextResponse.json({ data: resource })
    } else {
      // Get resource collection
      const resources = await getAllResources()
      return NextResponse.json({ data: resources })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newResource = await createResource(body)
    return NextResponse.json(
      { data: newResource },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
```

#### Service Layer Abstraction
```typescript
// Service Layer Pattern
class ApiService {
  private client: AxiosInstance

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    // Request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      // Add authentication headers
      return config
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Centralized error handling
        if (error.response?.status === 401) {
          // Handle authentication errors
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data)
    return response.data
  }
}

// Usage
export const personService = {
  api: new ApiService(process.env.NEXT_PUBLIC_ZKBIO_API_URL!),

  async getPersons(): Promise<PersonsListResponse> {
    return this.api.get('/person/getPersonList')
  },

  async createPerson(person: Person): Promise<PersonResponse> {
    return this.api.post('/person/add', person)
  }
}
```

### 4. **Testing Patterns**

#### Component Testing with React Testing Library
```typescript
// Component Testing Pattern
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'

// Mock external dependencies
jest.mock('../../services/personService', () => ({
  createPerson: jest.fn(),
  getPersons: jest.fn()
}))

describe('PersonRegistrationForm', () => {
  const mockCreatePerson = require('../../services/personService').createPerson

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreatePerson.mockResolvedValue({
      code: 0,
      message: 'Person created successfully',
      data: { pin: '123456789' }
    })
  })

  it('renders form fields correctly', () => {
    render(<PersonRegistrationForm />)

    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<PersonRegistrationForm />)

    const submitButton = screen.getByRole('button', { name: /register/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/account number is required/i)).toBeInTheDocument()
    })
  })

  it('submits form successfully', async () => {
    const user = userEvent.setup()
    render(<PersonRegistrationForm />)

    // Fill form
    await user.type(screen.getByLabelText(/account number/i), '123456789')
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.selectOptions(screen.getByLabelText(/branch/i), '001')

    // Submit
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        pin: '123456789',
        name: 'John Doe',
        deptCode: '001'
      })
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    })
  })
})
```

#### API Route Testing
```typescript
// API Route Testing Pattern
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock dependencies
jest.mock('../../../services/personService')
const mockPersonService = require('../../../services/personService')

describe('/api/persons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/persons', () => {
    it('returns persons list successfully', async () => {
      const mockPersons = [
        { pin: '123', name: 'John Doe' },
        { pin: '456', name: 'Jane Smith' }
      ]

      mockPersonService.getPersons.mockResolvedValue({
        code: 0,
        message: 'Success',
        data: { records: mockPersons, total: 2 }
      })

      const request = new NextRequest('http://localhost:3000/api/persons')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.records).toEqual(mockPersons)
      expect(mockPersonService.getPersons).toHaveBeenCalled()
    })

    it('handles service errors gracefully', async () => {
      mockPersonService.getPersons.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/persons')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Database connection failed')
    })
  })
})
```

### 5. **State Management Patterns**

#### Context API with Reducer Pattern
```typescript
// Context with Reducer Pattern
interface AlertState {
  alerts: Alert[]
  loading: boolean
  error: string | null
}

type AlertAction =
  | { type: 'FETCH_ALERTS_START' }
  | { type: 'FETCH_ALERTS_SUCCESS'; payload: Alert[] }
  | { type: 'FETCH_ALERTS_ERROR'; payload: string }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'RESOLVE_ALERT'; payload: string }

function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case 'FETCH_ALERTS_START':
      return { ...state, loading: true, error: null }

    case 'FETCH_ALERTS_SUCCESS':
      return {
        ...state,
        loading: false,
        alerts: action.payload,
        error: null
      }

    case 'FETCH_ALERTS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts]
      }

    case 'RESOLVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload
            ? { ...alert, resolved: true, resolvedAt: new Date().toISOString() }
            : alert
        )
      }

    default:
      return state
  }
}

// Context Provider
const AlertContext = createContext<{
  state: AlertState
  dispatch: React.Dispatch<AlertAction>
} | null>(null)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alertReducer, {
    alerts: [],
    loading: false,
    error: null
  })

  return (
    <AlertContext.Provider value={{ state, dispatch }}>
      {children}
    </AlertContext.Provider>
  )
}

// Custom Hook
export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider')
  }

  const { state, dispatch } = context

  const fetchAlerts = useCallback(async () => {
    dispatch({ type: 'FETCH_ALERTS_START' })
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      dispatch({ type: 'FETCH_ALERTS_SUCCESS', payload: data.alerts })
    } catch (error) {
      dispatch({
        type: 'FETCH_ALERTS_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  const addAlert = useCallback(async (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      })
      const newAlert = await response.json()
      dispatch({ type: 'ADD_ALERT', payload: newAlert })
    } catch (error) {
      console.error('Failed to add alert:', error)
    }
  }, [])

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, resolved: true })
      })
      dispatch({ type: 'RESOLVE_ALERT', payload: alertId })
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }, [])

  return {
    ...state,
    fetchAlerts,
    addAlert,
    resolveAlert
  }
}
```

## 🔧 Implementation Patterns

### 1. **Error Handling Strategy**

#### Global Error Boundary
```typescript
// Error Boundary Pattern
class AppErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo)

    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // Client-side error reporting
      reportError(error, {
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

// Usage in app layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppErrorBoundary>
          {children}
        </AppErrorBoundary>
      </body>
    </html>
  )
}
```

#### API Error Handling
```typescript
// API Error Handling Pattern
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: any): never {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    throw new ApiError(
      data?.message || 'API request failed',
      status,
      data?.code
    )
  } else if (error.request) {
    // Network error
    throw new ApiError('Network error - please check your connection', 0)
  } else {
    // Other error
    throw new ApiError(error.message || 'Unknown error occurred', 0)
  }
}

// Usage in services
export async function apiCallWrapper<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall()
  } catch (error) {
    handleApiError(error)
  }
}
```

### 2. **Performance Optimization Patterns**

#### React.memo with Custom Comparison
```typescript
// Performance Optimization Pattern
interface PersonCardProps {
  person: Person
  onEdit: (person: Person) => void
  onDelete: (person: Person) => void
}

const PersonCard = React.memo<PersonCardProps>(
  ({ person, onEdit, onDelete }) => {
    return (
      <div className="person-card">
        <h3>{person.name}</h3>
        <p>PIN: {person.pin}</p>
        <div className="actions">
          <button onClick={() => onEdit(person)}>Edit</button>
          <button onClick={() => onDelete(person)}>Delete</button>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.person.id === nextProps.person.id &&
      prevProps.person.name === nextProps.person.name &&
      prevProps.person.pin === nextProps.person.pin
    )
  }
)

// Usage with callback memoization
function PersonList({ persons }: { persons: Person[] }) {
  const handleEdit = useCallback((person: Person) => {
    // Edit logic
  }, [])

  const handleDelete = useCallback((person: Person) => {
    // Delete logic
  }, [])

  return (
    <div className="person-list">
      {persons.map(person => (
        <PersonCard
          key={person.id}
          person={person}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

#### Lazy Loading and Code Splitting
```typescript
// Code Splitting Pattern
const MonitoringDashboard = lazy(() =>
  import('../components/MonitoringDashboard')
)

const AccountRegistrationForm = lazy(() =>
  import('../components/AccountRegistrationForm')
)

// Usage with Suspense
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/monitoring"
          element={
            <MonitoringDashboard />
          }
        />
        <Route
          path="/register"
          element={
            <AccountRegistrationForm />
          }
        />
      </Routes>
    </Suspense>
  )
}
```

### 3. **Monitoring and Alerting Patterns**

#### Health Check Implementation
```typescript
// Health Check Pattern
export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkApiConnectivity(),
    checkDiskSpace(),
    checkMemoryUsage()
  ])

  const results = checks.map((check, index) => ({
    name: ['database', 'api', 'disk', 'memory'][index],
    status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    error: check.status === 'rejected' ? check.reason : null,
    timestamp: new Date().toISOString()
  }))

  const overallStatus = results.every(r => r.status === 'healthy')
    ? 'healthy'
    : 'unhealthy'

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: results
  }
}

// Individual check functions
async function checkDatabaseConnection(): Promise<void> {
  // Implement database connectivity check
  const db = getDatabase()
  await db.prepare('SELECT 1').get()
}

async function checkApiConnectivity(): Promise<void> {
  // Implement API connectivity check
  const response = await fetch(`${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/health`)
  if (!response.ok) {
    throw new Error('API health check failed')
  }
}
```

#### Alert Management System
```typescript
// Alert Management Pattern
export class AlertManager {
  private alerts: Map<string, Alert> = new Map()
  private listeners: Set<(alerts: Alert[]) => void> = new Set()

  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: generateId(),
      timestamp: new Date().toISOString(),
      resolved: false
    }

    this.alerts.set(newAlert.id, newAlert)
    this.notifyListeners()

    // Auto-resolve info alerts after 1 hour
    if (alert.severity === 'info') {
      setTimeout(() => {
        this.resolveAlert(newAlert.id)
      }, 60 * 60 * 1000)
    }

    return newAlert
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = new Date().toISOString()
    this.notifyListeners()
    return true
  }

  getAlerts(filter?: { type?: string; severity?: AlertSeverity }): Alert[] {
    let alerts = Array.from(this.alerts.values())

    if (filter?.type) {
      alerts = alerts.filter(a => a.type === filter.type)
    }

    if (filter?.severity) {
      alerts = alerts.filter(a => a.severity === filter.severity)
    }

    return alerts.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    const alerts = this.getAlerts()
    this.listeners.forEach(listener => listener(alerts))
  }
}

// Global alert manager instance
export const alertManager = new AlertManager()
```

## 🚀 Extending the Application

### 1. **Adding New Features**

#### Step-by-Step Feature Addition
```typescript
// 1. Define Types
interface NewFeature {
  id: string
  name: string
  description: string
  createdAt: string
}

// 2. Create Service Layer
export const newFeatureService = {
  async getFeatures(): Promise<ApiResponse<NewFeature[]>> {
    return apiClient.get('/features')
  },

  async createFeature(feature: Omit<NewFeature, 'id' | 'createdAt'>): Promise<ApiResponse<NewFeature>> {
    return apiClient.post('/features', feature)
  }
}

// 3. Create API Route
// app/api/features/route.ts
export async function GET() {
  try {
    const features = await newFeatureService.getFeatures()
    return NextResponse.json(features)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const feature = await newFeatureService.createFeature(body)
    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 })
  }
}

// 4. Create Component
function NewFeatureList() {
  const { data: features, loading, error } = useApiCall(
    () => newFeatureService.getFeatures()
  )

  if (loading) return <Skeleton />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="feature-list">
      {features?.map(feature => (
        <div key={feature.id} className="feature-card">
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

// 5. Add Tests
describe('NewFeatureList', () => {
  it('renders features correctly', () => {
    // Test implementation
  })
})

// 6. Update Navigation/Routing
// Add to navigation menu and routing configuration
```

### 2. **Adding New API Integrations**

#### External API Integration Pattern
```typescript
// 1. Create API Client
class ExternalApiClient {
  private client: AxiosInstance

  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.client.get(endpoint)
    return response.data
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.client.post(endpoint, data)
    return response.data
  }
}

// 2. Create Service Layer
export const externalService = {
  client: new ExternalApiClient(
    process.env.EXTERNAL_API_URL!,
    process.env.EXTERNAL_API_KEY!
  ),

  async syncData(): Promise<SyncResult> {
    try {
      const externalData = await this.client.get('/data')
      // Transform and sync with local database
      await syncToLocalDatabase(externalData)
      return { success: true, syncedRecords: externalData.length }
    } catch (error) {
      throw new Error(`External API sync failed: ${error.message}`)
    }
  }
}

// 3. Create API Route
export async function POST() {
  try {
    const result = await externalService.syncData()

    // Create success alert
    await alertManager.createAlert({
      type: 'sync',
      message: `Successfully synced ${result.syncedRecords} records`,
      severity: 'info',
      source: 'external-api'
    })

    return NextResponse.json(result)
  } catch (error) {
    // Create error alert
    await alertManager.createAlert({
      type: 'sync',
      message: `Sync failed: ${error.message}`,
      severity: 'error',
      source: 'external-api'
    })

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### 3. **Adding New Monitoring Metrics**

#### Custom Metrics Implementation
```typescript
// 1. Define Metric Types
interface CustomMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  tags?: Record<string, string>
}

// 2. Create Metrics Collector
class MetricsCollector {
  private metrics: CustomMetric[] = []

  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags
    })

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  getMetrics(name?: string, timeRange?: { start: Date; end: Date }) {
    let filtered = this.metrics

    if (name) {
      filtered = filtered.filter(m => m.name === name)
    }

    if (timeRange) {
      filtered = filtered.filter(m => {
        const metricTime = new Date(m.timestamp).getTime()
        return metricTime >= timeRange.start.getTime() &&
               metricTime <= timeRange.end.getTime()
      })
    }

    return filtered
  }

  getAggregatedMetrics(name: string, timeRange: { start: Date; end: Date }) {
    const metrics = this.getMetrics(name, timeRange)

    if (metrics.length === 0) return null

    const values = metrics.map(m => m.value)
    return {
      name,
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1],
      unit: metrics[0].unit
    }
  }
}

// 3. Integrate with Application
export const metricsCollector = new MetricsCollector()

// Record business metrics
export function recordUserRegistration(branchCode: string) {
  metricsCollector.recordMetric(
    'user_registrations',
    1,
    'count',
    { branch: branchCode, type: 'increment' }
  )
}

export function recordApiResponseTime(endpoint: string, responseTime: number) {
  metricsCollector.recordMetric(
    'api_response_time',
    responseTime,
    'ms',
    { endpoint }
  )
}

// 4. Add to Monitoring Dashboard
function CustomMetricsPanel() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    const loadMetrics = async () => {
      // This would typically come from an API endpoint
      const data = await fetch('/api/custom-metrics').then(r => r.json())
      setMetrics(data)
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!metrics) return <div>Loading metrics...</div>

  return (
    <div className="custom-metrics">
      <h3>Custom Metrics</h3>
      <div className="metric-grid">
        <div className="metric-card">
          <h4>User Registrations</h4>
          <div className="metric-value">{metrics.registrations}</div>
          <div className="metric-change">+12% from last week</div>
        </div>
        <div className="metric-card">
          <h4>Average Response Time</h4>
          <div className="metric-value">{metrics.avgResponseTime}ms</div>
          <div className="metric-change">-5% from last week</div>
        </div>
      </div>
    </div>
  )
}
```

## 📋 Best Practices & Conventions

### 1. **Code Organization**
- Use feature-based folder structure
- Implement barrel exports (`index.ts`) for clean imports
- Separate concerns: components, services, types, utils
- Use consistent naming conventions

### 2. **TypeScript Best Practices**
- Use strict type checking
- Define interfaces for all data structures
- Use generic types for reusable patterns
- Implement proper error types

### 3. **React Best Practices**
- Use functional components with hooks
- Implement proper dependency arrays in useEffect
- Memoize expensive computations
- Use compound components for complex UIs

### 4. **API Design Best Practices**
- Follow RESTful conventions
- Implement proper HTTP status codes
- Use consistent error response formats
- Implement rate limiting and authentication

### 5. **Testing Best Practices**
- Write tests for all business logic
- Use descriptive test names
- Test both success and error scenarios
- Mock external dependencies

### 6. **Performance Best Practices**
- Implement code splitting for large applications
- Use React.memo for expensive components
- Optimize bundle size
- Implement proper caching strategies

### 7. **Security Best Practices**
- Validate all input data
- Implement proper authentication
- Use HTTPS for all communications
- Sanitize user inputs
- Implement proper error handling

## 🔄 Maintenance & Evolution

### Regular Maintenance Tasks
1. **Update Dependencies**: Keep packages up to date
2. **Review Code Coverage**: Ensure test coverage remains high
3. **Performance Monitoring**: Monitor and optimize performance
4. **Security Updates**: Apply security patches promptly
5. **Documentation Updates**: Keep docs current with code changes

### Scaling Considerations
1. **Database Optimization**: Implement proper indexing and query optimization
2. **Caching Strategy**: Implement Redis or similar for frequently accessed data
3. **Load Balancing**: Prepare for horizontal scaling
4. **CDN Integration**: Serve static assets via CDN
5. **Monitoring Enhancement**: Implement distributed tracing

### Future Enhancements Roadmap
1. **Microservices Architecture**: Break down into smaller services
2. **GraphQL API**: Implement more flexible API layer
3. **Real-time Features**: WebSocket integration for live updates
4. **Advanced Analytics**: Implement comprehensive analytics dashboard
5. **Mobile Application**: Develop companion mobile app

This technical guide provides the foundation for understanding and extending the Banking Access Control System while maintaining the same level of enterprise-grade quality and versatility demonstrated throughout the codebase.