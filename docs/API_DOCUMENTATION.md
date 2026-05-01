# CareBridge API Documentation

## OpenAPI / Swagger

This API is fully documented with OpenAPI 3.0.

- Swagger UI: `http://localhost:5000/api-docs`
- Raw OpenAPI JSON: `http://localhost:5000/api-docs.json`
- Source specification: `docs/openapi.yaml`

Use Swagger UI for interactive testing with real request/response examples.

### Authenticate in Swagger
1. Call `POST /api/auth/login` with valid credentials.
2. The API sets an HTTP-only `accessToken` cookie on successful login.
3. For browser-based Swagger usage, the cookie is sent automatically for protected endpoints.
4. Bearer token auth is still accepted for backward compatibility.

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user (Parent, Clinician, or Admin).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "surname": null,
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "PARENT",
  "phone": "+1234567890"
}
```

For Clinicians:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "surname": "Dr.",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "CLINICIAN",
  "specializationIds": ["uuid1", "uuid2"],
  "licenseNumber": "LIC123456"
}
```

For Admins:
```json
{
  "firstName": "System",
  "lastName": "Admin",
  "surname": null,
  "email": "admin@carebridge.com",
  "password": "admin123",
  "role": "ADMIN",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "surname": null,
    "email": "john@example.com",
    "role": "PARENT"
  }
}
```

### Login
**POST** `/api/auth/login`

Authenticate user and receive session via HTTP-only cookie and access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Admin Login Example:
```json
{
  "email": "admin@carebridge.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "surname": null,
    "email": "john@example.com",
    "role": "PARENT"
  }
}
```

**Authentication Options:**
- **HTTP-only Cookie**: Response sets `Set-Cookie: accessToken=...; HttpOnly` automatically
  - Use `credentials: 'include'` on browser clients
  - For `curl`, use `-c cookies.txt` on login and `-b cookies.txt` on protected calls
- **Bearer Token**: Use the `accessToken` from response body
  - Add header: `Authorization: Bearer <accessToken>`
  - Useful for mobile apps, non-browser clients, or when cookies are not supported

### Logout
**POST** `/api/auth/logout`

Logout the current user, invalidate the current token, and clear `accessToken` cookie.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Notes:**
- The current token is invalidated immediately after logout.
- Requests using that same token will return `401 Invalid or expired token`.

### Forgot Password
**POST** `/api/auth/forgot-password`

Generate a password reset token and send it via email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Notes:**
- A secure reset token is generated and sent to the user's email
- The token is valid for 1 hour
- The email contains a link to reset the password with the token embedded

### Reset Password
**POST** `/api/auth/reset-password`

Reset password using the token received via email. User must log in again after success.

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful. Please log in with your new password."
}
```

**Notes:**
- Token must be valid and not expired (1 hour expiry)
- New password must be at least 8 characters long
- After successful reset, the token is invalidated

## User Management Endpoints

All endpoints require authentication via `accessToken` cookie (Bearer header is also accepted).

### Collection Pagination, Search, and Filtering

The collection GET endpoints in this section use paginated responses with a default page size of 5 records.

**Common query params:**
- `page` — page number to retrieve, starting at `1`
- `limit` — number of rows per page, defaults to `5`
- `search` — free-text search over the most relevant fields for that endpoint

**Pagination response fields:**
- `page` — current page number
- `limit` — requested page size
- `count` — number of rows returned in the current page
- `total` — total number of matching rows
- `totalPages` — number of available pages

### Create Child Profile
**POST** `/api/users/children`

Create a child profile (PARENT role only).

**Request Body:**
```json
{
  "firstName": "Emma",
  "dob": "2020-05-15",
  "gender": "Female",
  "region": "Addis Ababa"
}
```

**Response (201):**
```json
{
  "message": "Child profile created successfully",
  "child": {
    "childId": "uuid",
    "firstName": "Emma",
    "dob": "2020-05-15",
    "gender": "Female",
    "parentId": "uuid",
    "region": "Addis Ababa",
    "assignedClinicianId": null
  }
}
```

### Get All Children
**GET** `/api/users/children`

Get all children for the logged-in parent (PARENT role only).

**Query Parameters:**
- `page` — page number, defaults to `1`
- `limit` — rows per page, defaults to `5`
- `search` — search by child first name
- `region` — filter by child region
- `assignedClinicianId` — filter by assigned clinician ID

**Response (200):**
```json
{
  "message": "Children retrieved successfully",
  "page": 1,
  "limit": 5,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "children": [
    {
      "childId": "uuid",
      "firstName": "Emma",
      "dob": "2020-05-15",
      "gender": "Female",
      "region": "Addis Ababa",
      "assignedClinicianId": "uuid",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Assigned Clinician by Child ID
**GET** `/api/users/children/:childId/assigned-clinician`

Get currently assigned clinician for a parent-owned child (PARENT role only).

**Response (200):**
```json
{
  "message": "Assigned clinician retrieved successfully",
  "child": {
    "childId": "uuid",
    "firstName": "Emma",
    "parentId": "uuid",
    "assignedClinicianId": "uuid"
  },
  "clinician": {
    "userId": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "surname": "Dr.",
    "email": "jane@example.com",
    "licenseNumber": "LIC123456",
    "specializations": [
      {
        "specializationId": "uuid1",
        "name": "Pediatric Psychology",
        "description": "Specializes in child development and behavioral therapy",
        "riskLevelFocus": "BOTH"
      }
    ]
  }
}
```

### Get All Parents (Admin)
**GET** `/api/users/parents`

Get all parent users (ADMIN role only).

**Query Parameters:**
- `page` — page number, defaults to `1`
- `limit` — rows per page, defaults to `5`
- `search` — search by name, surname, email, or phone
- `createdFrom` — filter parents created on or after this ISO date/time
- `createdTo` — filter parents created on or before this ISO date/time

**Response (200):**
```json
{
  "message": "Parents retrieved successfully",
  "page": 1,
  "limit": 5,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "parents": [
    {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "surname": null,
      "email": "john@example.com",
      "phone": "+1234567890",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Parent by ID (Admin)
**GET** `/api/users/parents/:parentId`

Get a parent user by ID (ADMIN role only).

**Response (200):**
```json
{
  "message": "Parent retrieved successfully",
  "parent": {
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "surname": null,
    "email": "john@example.com",
    "phone": "+1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Users (Admin)
**GET** `/api/users`

Get all users in the system (ADMIN role only).

**Query Parameters:**
- `page` — page number, defaults to `1`
- `limit` — rows per page, defaults to `5`
- `search` — search by name, email, phone, or role
- `role` — filter by `PARENT`, `CLINICIAN`, or `ADMIN`
- `specializationId` — filter clinicians assigned to a specialization
- `createdFrom` — filter users created on or after this ISO date/time
- `createdTo` — filter users created on or before this ISO date/time

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Users retrieved successfully",
  "page": 1,
  "limit": 5,
  "count": 3,
  "total": 3,
  "totalPages": 1,
  "users": [
    {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "surname": null,
      "email": "john@example.com",
      "role": "PARENT",
      "phone": "+1234567890",
      "specialization": null,
      "licenseNumber": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get User by ID (Admin)
**GET** `/api/users/:userId`

Get details of a specific user (ADMIN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "User retrieved successfully",
  "user": {
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "surname": null,
    "email": "john@example.com",
    "role": "PARENT",
    "phone": "+1234567890",
    "specialization": null,
    "licenseNumber": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Current User
**GET** `/api/users/me`

Get the currently authenticated user's profile. Available to all authenticated roles.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Current user retrieved successfully",
  "user": {
    "userId": "uuid",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "surname": null,
    "email": "john@example.com",
    "role": "PARENT",
    "phone": "+1234567890",
    "licenseNumber": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Current User Profile
**PUT** `/api/users/me`

Update the authenticated user's own profile fields. Available to all authenticated roles.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (any updatable fields):**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "surname": null,
  "email": "updated@example.com",
  "phone": "+1234567890",
  "licenseNumber": "LIC123456"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "userId": "uuid",
    "name": "Updated Name",
    "firstName": "Updated",
    "lastName": "Name",
    "surname": null,
    "email": "updated@example.com",
    "role": "PARENT",
    "phone": "+1234567890",
    "licenseNumber": null,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Notes:**
- Parent accounts must keep a phone number.
- Clinician accounts must keep a license number.
- When updating name fields, both `firstName` and `lastName` are required.

### Change Current User Password
**PATCH** `/api/users/me/password`

Change the authenticated user's password. Available to all authenticated roles.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Notes:**
- `currentPassword` must match the user's existing password.
- `newPassword` must be at least 8 characters long.

### Update User (Admin)
**PUT** `/api/users/:userId`

Update a user's profile fields (ADMIN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (any updatable fields):**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "surname": null,
  "email": "updated@example.com",
  "phone": "+1234567890",
  "licenseNumber": "LIC123456"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "userId": "uuid",
    "name": "Updated Name",
    "firstName": "Updated",
    "lastName": "Name",
    "surname": null,
    "email": "updated@example.com",
    "role": "PARENT",
    "phone": "+1234567890",
    "licenseNumber": null,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Notes:**
- Parent accounts must keep a phone number.
- Clinician accounts must keep a license number.
- When updating name fields, both `firstName` and `lastName` are required.

### Update User Role (Admin)
**PATCH** `/api/users/:userId/role`

Update a user's role (ADMIN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "CLINICIAN"
}
```

**Valid Roles:**
- `PARENT`
- `CLINICIAN`
- `ADMIN`

**Response (200):**
```json
{
  "message": "User role updated successfully",
  "user": {
    "userId": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "surname": "Dr.",
    "email": "jane@example.com",
    "role": "CLINICIAN",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete User (Admin)
**DELETE** `/api/users/:userId`

Delete a user account (ADMIN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "User deleted successfully",
  "userId": "uuid"
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied. Insufficient permissions.",
  "requiredRoles": ["PARENT"],
  "userRole": "CLINICIAN"
}
```

**409 Conflict:**
```json
{
  "error": "User with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Screening Endpoints

### Submit Screening
**POST** `/api/screenings`

Submit M-CHAT-R/F screening for a child (PARENT role only).

**Auto-Assignment Feature:** 
- For MEDIUM or HIGH risk screenings, if the child doesn't have an assigned clinician, the system will automatically assign one based on:
  - Clinician specializations matching the risk level (riskLevelFocus: MEDIUM, HIGH, or BOTH)
  - Current workload (number of children with UNDER_REVIEW screenings)
  - The clinician with the lowest workload and matching specialization is selected
- Admin can manually assign or reassign clinicians at any time via the assignment endpoint
- Parents cannot assign clinicians - only Admin has this permission

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "childId": "uuid",
  "answers": {
    "Q1": true,
    "Q2": false,
    "Q3": true,
    "Q4": true,
    "Q5": false,
    "Q6": true,
    "Q7": true,
    "Q8": true,
    "Q9": true,
    "Q10": true,
    "Q11": true,
    "Q12": true,
    "Q13": true,
    "Q14": true,
    "Q15": true,
    "Q16": true,
    "Q17": true,
    "Q18": true,
    "Q19": true,
    "Q20": true
  }
}
```

**Note:** 
- `true` = Pass (typical behavior)
- `false` = Fail (atypical behavior/concern)
- Must provide exactly 20 questions with keys `Q1` ... `Q20`
- Child age must be between 16 and 30 months (M-CHAT-R/F target range)

**Response (201):**
```json
{
  "message": "Screening completed successfully",
  "screening": {
    "screeningId": "uuid",
    "childId": "uuid",
    "date": "2024-01-15T10:30:00.000Z",
    "totalScore": 2,
    "riskLevel": "LOW",
    "status": "VERIFIED"
  },
  "analysis": {
    "screeningStatus": "SCREEN_NEGATIVE",
    "failedItems": ["Q2", "Q5"],
    "failedItemsCount": 2,
    "recommendation": "Continue routine developmental surveillance. No immediate concerns detected."
  },
  "roadmapCreated": false
}
```

**Important:** Roadmap content is provided by the Inference Engine response (`INFERENCE_API_URL`) and persisted by this API. Local roadmap generation from failed items is not used.

If the inference response includes `roadmap.generatedGuidance`, it is persisted and returned in roadmap endpoints as parent-readable text.

**Common 400 Errors:**
- Invalid question IDs (missing/extra keys outside `Q1`...`Q20`)
- Child is outside the 16–30 month screening range

**Risk Level Logic:**
- **LOW (0-2 failures)**: Status = `VERIFIED`, Screen Negative
- **MEDIUM (3-7 failures)**: Status = `UNDER_REVIEW`, Screen Positive
- **HIGH (8-20 failures)**: Status = `UNDER_REVIEW`, Screen Positive

### Get Screenings by Child
**GET** `/api/screenings/child/:childId`

Get all screenings for a specific child (PARENT role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Screenings retrieved successfully",
  "childId": "uuid",
  "count": 3,
  "screenings": [
    {
      "screeningId": "uuid",
      "date": "2024-01-15T10:30:00.000Z",
      "totalScore": 2,
      "riskLevel": "LOW",
      "status": "VERIFIED",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Screening Details
**GET** `/api/screenings/:screeningId`

Get detailed screening results including answers (PARENT and CLINICIAN roles).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Screening details retrieved successfully",
  "screening": {
    "screeningId": "uuid",
    "childId": "uuid",
    "date": "2024-01-15T10:30:00.000Z",
    "answers": {
      "Q1": true,
      "Q2": false,
      "Q3": true
    },
    "totalScore": 2,
    "riskLevel": "LOW",
    "status": "VERIFIED",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "child": {
      "childId": "uuid",
      "firstName": "Emma",
      "dob": "2020-05-15",
      "gender": "Female"
    }
  }
}
```


---

## Roadmap Endpoints

**Important:** There is no separate endpoint to manually create a roadmap.
Roadmaps are created automatically when the inference service includes roadmap activities in the screening response from:
`POST /api/screenings`

### Get Roadmap by Child
**GET** `/api/roadmaps/:childId`

Get personalized developmental roadmap for a child (PARENT and CLINICIAN roles).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Roadmap retrieved successfully",
  "roadmap": {
    "roadmapId": "uuid",
    "screeningId": "uuid",
    "created_date": "2024-01-15T10:30:00.000Z",
    "status": "ACTIVE",
    "clinician_notes": null,
    "generatedGuidance": {
      "summary": "Your child may benefit from more joint attention and social response practice.",
      "rationale": "Recent screening indicators suggest targeted support in shared attention and communication.",
      "weeklyPlan": [
        "Week 1: Pointing and look-following games for 10 minutes daily.",
        "Week 2: Name-response and turn-taking routines twice daily.",
        "Week 3: Guided imitation play with modeling.",
        "Week 4: Repeat effective activities and monitor consistency."
      ],
      "difficulty": "BEGINNER",
      "expectedDuration": "4 weeks"
    },
    "screening": {
      "screeningId": "uuid",
      "date": "2024-01-15T10:30:00.000Z",
      "totalScore": 5,
      "riskLevel": "MEDIUM",
      "status": "UNDER_REVIEW"
    },
    "activities": [
      {
        "activityId": "uuid",
        "title": "Pointing Practice",
        "description": "Help your child learn to point at objects",
        "instruction": "Start by pointing at interesting objects...",
        "mediaUrl": "https://cloudinary.com/video.mp4",
        "riskCategory": "joint-attention",
        "order": 1,
        "completed": false
      }
    ]
  }
}
```

### Update Activity Completion
**PATCH** `/api/roadmaps/:roadmapId/activities/:activityId`

Mark an activity as completed or incomplete (PARENT role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "completed": true
}
```

**Response (200):**
```json
{
  "message": "Activity completion status updated successfully",
  "roadmapActivity": {
    "roadmapId": "uuid",
    "activityId": "uuid",
    "completed": true
  }
}
```

---

## Activity Management Endpoints (Admin)

### Create Activity
**POST** `/api/activities`

Create a new therapeutic activity (ADMIN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Pointing Practice",
  "description": "Help your child learn to point at objects of interest",
  "instruction": "Start by pointing at interesting objects and saying their names...",
  "mediaUrl": "https://res.cloudinary.com/carebridge/video/pointing.mp4",
  "riskCategory": "joint-attention"
}
```

**Valid Risk Categories:**
- `social-interaction`, `joint-attention`, `pretend-play`, `peer-interaction`
- `showing`, `social-responsiveness`, `name-response`, `smiling`
- `sensory-processing`, `auditory-sensitivity`, `motor-skills`, `imitation`
- `eye-contact`, `visual-sensitivity`, `attention-seeking`, `following-gaze`
- `walking`, `checking-reactions`, `understanding-feelings`, `language`
- `receptive-language`, `showing-interest`, `unusual-behaviors`, `pointing`, `imagination`

**Response (201):**
```json
{
  "message": "Activity created successfully",
  "activity": {
    "activityId": "uuid",
    "title": "Pointing Practice",
    "description": "Help your child learn to point at objects of interest",
    "instruction": "Start by pointing at interesting objects...",
    "mediaUrl": "https://res.cloudinary.com/carebridge/video/pointing.mp4",
    "riskCategory": "joint-attention",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Activities
**GET** `/api/activities?riskCategory=joint-attention`

Get all activities, optionally filtered by risk category (ADMIN and CLINICIAN roles).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Activities retrieved successfully",
  "count": 15,
  "activities": [
    {
      "activityId": "uuid",
      "title": "Pointing Practice",
      "description": "Help your child learn to point",
      "instruction": "Start by pointing at interesting objects...",
      "mediaUrl": "https://cloudinary.com/video.mp4",
      "riskCategory": "joint-attention",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Activity by ID
**GET** `/api/activities/:activityId`

Get detailed information about a specific activity (ADMIN and CLINICIAN roles).

### Update Activity
**PUT** `/api/activities/:activityId`

Update an existing activity (ADMIN role only).

### Delete Activity
**DELETE** `/api/activities/:activityId`

Delete an activity from the knowledge base (ADMIN role only).


---

## Clinician Dashboard Endpoints

### Get All Clinicians
**GET** `/api/clinicians`

Get all clinician profiles with their specializations (ADMIN roles).

**Query Parameters:**
- `page` — page number, defaults to `1`
- `limit` — rows per page, defaults to `5`
- `search` — search by clinician name, email, or license number
- `specializationId` — filter by a specific specialization
- `riskLevelFocus` — filter by specialization focus (`LOW`, `MEDIUM`, `HIGH`, `BOTH`)

**Response (200):**
```json
{
  "message": "Clinicians retrieved successfully",
  "page": 1,
  "limit": 5,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "clinicians": [
    {
      "userId": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "surname": "Dr.",
      "email": "jane@example.com",
      "licenseNumber": "LIC123456",
      "specializations": [
        {
          "specializationId": "uuid1",
          "name": "Pediatric Psychology",
          "description": "Specializes in child development and behavioral therapy",
          "riskLevelFocus": "BOTH"
        },
        {
          "specializationId": "uuid2",
          "name": "Autism Spectrum Disorders",
          "description": "Expert in ASD diagnosis and intervention",
          "riskLevelFocus": "HIGH"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Clinician by ID
**GET** `/api/clinicians/:clinicianId`

Get details of a single clinician profile with specializations (PARENT, CLINICIAN, and ADMIN roles).

**Response (200):**
```json
{
  "message": "Clinician retrieved successfully",
  "clinician": {
    "userId": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "surname": "Dr.",
    "email": "jane@example.com",
    "licenseNumber": "LIC123456",
    "specializations": [
      {
        "specializationId": "uuid1",
        "name": "Pediatric Psychology",
        "description": "Specializes in child development and behavioral therapy",
        "riskLevelFocus": "BOTH"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Assigned Clinician by Child ID
**GET** `/api/clinicians/child/:childId/assigned`

Get the clinician assigned to a specific child (PARENT )

**Response (200):**
```json
{
  "message": "Assigned clinician retrieved successfully",
  "childId": "uuid",
  "assignedClinician": {
    "userId": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "surname": "Dr.",
    "email": "jane@example.com",
    "licenseNumber": "LIC123456",
    "specializations": [
      {
        "specializationId": "uuid1",
        "name": "Pediatric Psychology",
        "description": "Specializes in child development and behavioral therapy",
        "riskLevelFocus": "BOTH"
      }
    ]
  }
}
```

**Response (200) - No clinician assigned:**
```json
{
  "message": "No clinician assigned to this child",
  "childId": "uuid",
  "assignedClinician": null
}
```

### Assign Clinician to Child
**POST** `/api/clinicians/assign-child`

Manually assign a clinician to a child (ADMIN only). 

**Note:** 
- Only administrators can manually assign clinicians to children
- Parents cannot assign clinicians
- For MEDIUM/HIGH risk screenings, clinicians are auto-assigned if no clinician is currently assigned
- Admin can override auto-assignments or assign clinicians before screening submission

**Request Body:**
```json
{
  "childId": "uuid",
  "clinicianId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Clinician assigned to child successfully",
  "assignment": {
    "childId": "uuid",
    "parentId": "uuid",
    "assignedClinicianId": "uuid"
  },
  "clinician": {
    "userId": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "surname": "Dr.",
    "email": "jane@example.com",
    "specializations": [
      {
        "specializationId": "uuid1",
        "name": "Pediatric Psychology",
        "description": "Specializes in child development and behavioral therapy",
        "riskLevelFocus": "BOTH"
      }
    ]
  }
}
```

### Get Review Queue
**GET** `/api/clinicians/queue`

Get all screenings flagged for review, sorted by risk level (CLINICIAN role only).

**Filters (query params):**
- `riskLevel=MEDIUM|HIGH`
- `dateFrom=<ISO_DATETIME>`
- `dateTo=<ISO_DATETIME>`
- `region=<region-name>`
- `search=<name-or-email>`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Review queue retrieved successfully",
  "count": 5,
  "screenings": [
    {
      "screeningId": "uuid",
      "date": "2024-01-15T10:30:00.000Z",
      "totalScore": 10,
      "riskLevel": "HIGH",
      "status": "UNDER_REVIEW",
      "child": {
        "childId": "uuid",
        "firstName": "Emma",
        "dob": "2020-05-15",
        "gender": "Female",
        "region": "Addis Ababa",
        "assignedClinicianId": "uuid"
      },
      "parent": {
        "userId": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "roadmap": {
        "roadmapId": "uuid",
        "status": "ACTIVE",
        "clinician_notes": null
      }
    }
  ]
}
```

### Real-Time Priority Queue Stream
**GET** `/api/clinicians/queue/stream`

Server-Sent Events endpoint for live priority queue updates and high-risk alerts (CLINICIAN only).

**Events:**
- `queue-event` with `type = QUEUE_UPDATED`
- `queue-event` with `type = HIGH_RISK_ALERT`

### Get Screening for Review
**GET** `/api/clinicians/screenings/:screeningId`

Get detailed screening information for review (CLINICIAN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Screening details retrieved successfully",
  "screening": {
    "screeningId": "uuid",
    "date": "2024-01-15T10:30:00.000Z",
    "answers": {
      "Q1": false,
      "Q2": false
    },
    "totalScore": 10,
    "riskLevel": "HIGH",
    "status": "UNDER_REVIEW",
    "child": {
      "childId": "uuid",
      "firstName": "Emma",
      "dob": "2020-05-15",
      "gender": "Female"
    },
    "parent": {
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "roadmap": {
      "roadmapId": "uuid",
      "status": "ACTIVE",
      "clinician_notes": null,
      "activities": []
    }
  }
}
```

### Validate Screening
**PUT** `/api/clinicians/screenings/:id/validate`

Validate screening, add notes, adjust activities, and update status (CLINICIAN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clinician_notes": "Reviewed screening results. Recommend focusing on joint attention activities first.",
  "activityIds": ["uuid1", "uuid2", "uuid3"],
  "status": "VERIFIED"
}
```

**Response (200):**
```json
{
  "message": "Screening validated successfully",
  "screening": {
    "screeningId": "uuid",
    "status": "VERIFIED",
    "riskLevel": "MEDIUM",
    "totalScore": 5
  },
  "roadmap": {
    "roadmapId": "uuid",
    "clinician_notes": "Reviewed screening results...",
    "status": "ACTIVE",
    "activities": [
      {
        "activityId": "uuid1",
        "title": "Pointing Practice",
        "riskCategory": "joint-attention",
        "order": 1
      }
    ]
  }
}
```

---

## Specialization Endpoints

### Get All Specializations
**GET** `/api/specializations`

Get all available specializations (Public - no authentication required).

**Response (200):**
```json
{
  "message": "Specializations retrieved successfully",
  "count": 3,
  "specializations": [
    {
      "specializationId": "uuid1",
      "name": "Pediatric Psychology",
      "description": "Specializes in child development and behavioral therapy",
      "riskLevelFocus": "BOTH",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "specializationId": "uuid2",
      "name": "Autism Spectrum Disorders",
      "description": "Expert in ASD diagnosis and intervention",
      "riskLevelFocus": "HIGH",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "specializationId": "uuid3",
      "name": "Early Intervention",
      "description": "Focuses on early childhood development support",
      "riskLevelFocus": "MEDIUM",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Specialization by ID
**GET** `/api/specializations/:specializationId`

Get details of a specific specialization (Public - no authentication required).

**Response (200):**
```json
{
  "message": "Specialization retrieved successfully",
  "specialization": {
    "specializationId": "uuid1",
    "name": "Pediatric Psychology",
    "description": "Specializes in child development and behavioral therapy",
    "riskLevelFocus": "BOTH",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Create Specialization
**POST** `/api/specializations`

Create a new specialization (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Speech Therapy",
  "description": "Specializes in speech and language development",
  "riskLevelFocus": "MEDIUM"
}
```

**Response (201):**
```json
{
  "message": "Specialization created successfully",
  "specialization": {
    "specializationId": "uuid",
    "name": "Speech Therapy",
    "description": "Specializes in speech and language development",
    "riskLevelFocus": "MEDIUM",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Specialization
**PUT** `/api/specializations/:specializationId`

Update an existing specialization (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Speech and Language Therapy",
  "description": "Updated description",
  "riskLevelFocus": "BOTH"
}
```

**Response (200):**
```json
{
  "message": "Specialization updated successfully",
  "specialization": {
    "specializationId": "uuid",
    "name": "Speech and Language Therapy",
    "description": "Updated description",
    "riskLevelFocus": "BOTH",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete Specialization
**DELETE** `/api/specializations/:specializationId`

Delete a specialization (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Specialization deleted successfully",
  "specializationId": "uuid"
}
```

---

## Chat Endpoints

Chat is separated by child. A parent with multiple children has a separate chat thread per child with that child's assigned clinician.

All chat endpoints require authentication via `accessToken` cookie (Bearer header also accepted).

### Get My Chat Conversations
**GET** `/api/chat/conversations`

Get child-scoped chat threads for the authenticated user.
- `PARENT`: returns chats for children owned by the parent that have assigned clinicians
- `CLINICIAN`: returns chats for children assigned to that clinician

**Response (200):**
```json
{
  "message": "Chat conversations retrieved successfully",
  "count": 1,
  "conversations": [
    {
      "child": {
        "childId": "uuid",
        "firstName": "Emma",
        "parentId": "uuid",
        "assignedClinicianId": "uuid"
      },
      "parent": {
        "userId": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "name": "John Doe"
      },
      "clinician": {
        "userId": "uuid",
        "firstName": "Abel",
        "lastName": "Bekele",
        "name": "Dr. Abel Bekele"
      },
      "lastMessage": {
        "messageId": "uuid",
        "childId": "uuid",
        "parentId": "uuid",
        "clinicianId": "uuid",
        "senderId": "uuid",
        "content": "Thanks doctor.",
        "readAt": null,
        "createdAt": "2026-04-23T08:00:00.000Z",
        "updatedAt": "2026-04-23T08:00:00.000Z"
      }
    }
  ]
}
```

### Get Messages for a Child Chat
**GET** `/api/chat/children/:childId/messages?limit=50`

Get messages for one child-specific chat thread (parent and assigned clinician only).

**Response (200):**
```json
{
  "message": "Chat messages retrieved successfully",
  "childId": "uuid",
  "count": 2,
  "messages": [
    {
      "messageId": "uuid1",
      "childId": "uuid",
      "parentId": "uuid",
      "clinicianId": "uuid",
      "senderId": "uuid",
      "content": "Hello doctor",
      "readAt": null,
      "createdAt": "2026-04-23T07:55:00.000Z",
      "updatedAt": "2026-04-23T07:55:00.000Z"
    },
    {
      "messageId": "uuid2",
      "childId": "uuid",
      "parentId": "uuid",
      "clinicianId": "uuid",
      "senderId": "uuid",
      "content": "Hi, how can I help?",
      "readAt": null,
      "createdAt": "2026-04-23T07:56:00.000Z",
      "updatedAt": "2026-04-23T07:56:00.000Z"
    }
  ]
}
```

### Send Message to a Child Chat
**POST** `/api/chat/children/:childId/messages`

Send a message in a child-specific chat thread (parent and assigned clinician only).

**Request Body:**
```json
{
  "content": "Hello doctor, I need guidance on today's activity."
}
```

**Response (201):**
```json
{
  "message": "Chat message sent successfully",
  "chatMessage": {
    "messageId": "uuid3",
    "childId": "uuid",
    "parentId": "uuid",
    "clinicianId": "uuid",
    "senderId": "uuid",
    "content": "Hello doctor, I need guidance on today's activity.",
    "readAt": null,
    "createdAt": "2026-04-23T08:10:00.000Z",
    "updatedAt": "2026-04-23T08:10:00.000Z"
  }
}
```

**Notes:**
- The endpoint also broadcasts `chat:newMessage` over Socket.IO to users in that child room.
- `content` is required and limited to 2000 characters.

### Socket.IO Real-time Chat

Base transport is available on the same API host using Socket.IO.

**Authentication:**
- Send JWT through `auth.token` during socket connection
- Or send cookie `accessToken`

**Events:**
- `chat:joinChild` payload: `{ "childId": "uuid" }`
- `chat:leaveChild` payload: `{ "childId": "uuid" }`
- `chat:sendMessage` payload: `{ "childId": "uuid", "content": "message" }`
- `chat:newMessage` server broadcast: persisted message object
- `chat:error` server event on validation/access errors

---

## Payment & Appointment Endpoints

### Create Appointment
**POST** `/api/payments/appointments`

Book an appointment with a clinician (PARENT role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clinicianId": "uuid",
  "childId": "uuid",
  "screeningId": "uuid",
  "appointmentDate": "2024-02-15T14:00:00.000Z",
  "duration": 60,
  "paymentAmount": 500.00
}
```

**Response (201):**
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "appointmentId": "uuid",
    "appointmentDate": "2024-02-15T14:00:00.000Z",
    "duration": 60,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentAmount": 500.00,
    "paymentReference": "CBR-1234567890-ABC123"
  },
  "paymentInstructions": {
    "message": "Please complete payment using the reference below",
    "reference": "CBR-1234567890-ABC123",
    "amount": 500.00,
    "paymentUrl": "https://payment-gateway.com/pay?ref=CBR-1234567890-ABC123"
  }
}
```

### Get Appointments
**GET** `/api/payments/appointments`

Get appointments (PARENT sees their appointments, CLINICIAN sees their appointments).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Appointments retrieved successfully",
  "count": 3,
  "appointments": [
    {
      "appointmentId": "uuid",
      "appointmentDate": "2024-02-15T14:00:00.000Z",
      "duration": 60,
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentAmount": 500.00,
      "clinician": {
        "userId": "uuid",
        "name": "Dr. Sarah Johnson",
        "specialization": "Pediatric Psychology"
      },
      "child": {
        "childId": "uuid",
        "firstName": "Emma"
      }
    }
  ]
}
```

### Payment Webhook
**POST** `/api/payments/webhook`

Webhook endpoint for payment gateway callbacks (Chapa/Telebirr). No authentication required.

**Request Body (from payment gateway):**
```json
{
  "transaction_id": "TXN123456",
  "reference": "CBR-1234567890-ABC123",
  "status": "success",
  "amount": 500.00,
  "currency": "ETB",
  "metadata": {
    "appointmentId": "uuid"
  }
}
```

**Response (200):**
```json
{
  "message": "Payment processed successfully",
  "appointment": {
    "appointmentId": "uuid",
    "status": "CONFIRMED",
    "paymentStatus": "PAID"
  }
}
```

**Webhook Behavior:**
- Updates appointment status to `CONFIRMED`
- Updates payment status to `PAID`
- Logs notifications to parent and clinician (console for now)
- Can be extended to send email/SMS notifications
