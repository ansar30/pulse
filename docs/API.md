# API Documentation

Base URL: `http://localhost:3001/api/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register

Create a new user and tenant.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantName": "Acme Inc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "tenantId": "507f1f77bcf86cd799439012",
      "role": "ADMIN",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

#### Login

Authenticate an existing user.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

---

### Tenants

#### Get Tenant

Get tenant details.

```http
GET /tenants/:tenantId
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Acme Inc",
    "planId": "free",
    "status": "TRIAL",
    "settings": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Tenant

Update tenant information.

```http
PATCH /tenants/:tenantId
```

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "settings": {
    "theme": "dark"
  }
}
```

---

### Users

#### List Users

Get all users in a tenant.

```http
GET /tenants/:tenantId/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "role": "ADMIN",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get User

Get a specific user.

```http
GET /tenants/:tenantId/users/:userId
```

#### Update User

Update user information.

```http
PATCH /tenants/:tenantId/users/:userId
```

**Request Body:**
```json
{
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "role": "MEMBER"
}
```

#### Delete User

Deactivate a user.

```http
DELETE /tenants/:tenantId/users/:userId
```

---

### Projects

#### List Projects

Get all projects for a tenant.

```http
GET /tenants/:tenantId/projects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "tenantId": "507f1f77bcf86cd799439012",
      "name": "Website Redesign",
      "description": "Redesign company website",
      "settings": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Project

Create a new project.

```http
POST /tenants/:tenantId/projects
```

**Request Body:**
```json
{
  "name": "Mobile App",
  "description": "Build iOS and Android app",
  "settings": {
    "priority": "high"
  }
}
```

#### Get Project

Get project details with resources.

```http
GET /tenants/:tenantId/projects/:projectId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "resources": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Project

Update project information.

```http
PATCH /tenants/:tenantId/projects/:projectId
```

**Request Body:**
```json
{
  "name": "Website Redesign v2",
  "description": "Updated description"
}
```

#### Delete Project

Delete a project.

```http
DELETE /tenants/:tenantId/projects/:projectId
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## Rate Limiting

API requests are rate-limited to 10 requests per minute per IP address.

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "tenantName": "Test Company"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Projects
```bash
curl http://localhost:3001/api/v1/tenants/{tenantId}/projects \
  -H "Authorization: Bearer {access_token}"
```

---

**For more information, see the [Getting Started Guide](./GETTING_STARTED.md)**
