# ZKTECO BioCVSecurity 3rd Party API Summary

## Overview

The ZKTECO BioCVSecurity 3rd Party API is a RESTful API designed for integrating external systems with ZKBio CVSecurity software (version 6.0.0 or above). It enables management of personnel, access control, biometrics, and related data for security and attendance systems.

## Key Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE) for CRUD operations.
- **Authentication**: Uses Bearer token or API key in Authorization header.
- **Data Formats**: JSON for requests and responses.
- **Supported Interfaces**:
  - Person Interface: Manage personnel records.
  - Card Interface: Handle RFID cards.
  - Department Interface: Organize departments.
  - Area Interface: Define access areas.
  - Reader Interface: Manage access readers.
  - Person Biometric Template Interface: Upload/download biometric templates (e.g., fingerprints).
  - Person Interface of Attendance Area: Attendance-specific data.

## Base URL

Typically: `http://zkbio-server:port/api` (replace with your server's address).

## Authentication

### Setup Process

1. **Admin Panel Access**: Log into ZKBio CVSecurity as superuser (e.g., `admin` / `#eCOM@786SEC`)
2. **Navigate to API Authorization**: System → Authority Management → API Authorization
3. **Create New Client**:
   - Click **New** to create API client
   - Enter unique **Client ID**
   - System generates **Client Secret** (this is your access token)
4. **Enable Access**: Click **Browse API** to enable API operations

### Authentication Method

**URL Parameter Authentication** (Required):
```
https://your-server:8098/api/v2/endpoint?access_token=YOUR_CLIENT_SECRET
```

**Example**:
```
GET /api/v2/person/list?pageNo=1&pageSize=10&access_token=8D1E99707293387C5B3BFC7291AD38CB
```

**Important Notes**:
- Access token must be included in **every API request**
- Token is passed as URL parameter, not in Authorization header
- Client secret from admin panel is your access token
- Multiple API clients can be created with different tokens

### Response Format

All API responses follow this structure:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    // Actual response data
  }
}
```

**Success Codes**:
- `code: 0` = Success
- `code: 400` = Bad Request
- `code: 401` = Unauthorized

## API Implementation Status

This application successfully integrates with **ZKBio CVSecurity API v2.0** using Next.js proxy routes to handle CORS and SSL certificate issues.

### ✅ Working Endpoints (via Proxy) - API v2 where available

#### Person Management (v2)
- `POST /api/persons` → `POST v2/person/getPersonList` - ✅ **WORKING** - Lists persons with pagination and filtering
- `POST /api/persons` → `POST person/add` - ✅ **WORKING** - Creates new person with PIN, branch, and access level
- `POST /api/persons` → `POST v2/person/getPersonList` - ✅ **WORKING** - Legacy person list retrieval
- `GET v2/person/get/{pin}` - Get person by PIN (not implemented yet)
- `PUT v2/person/update/{pin}` - Update person (not implemented yet)
- `POST v2/person/delete/{pin}` - Delete person (not implemented yet)

#### Biometric Templates (v1/v2)
- `PUT /api/biometric` → `POST bioTemplate/add` - ✅ **WORKING** - Uploads fingerprint templates (v1)
- `GET /api/biometric?pin={pin}` → `GET v2/bioTemplate/getFgListByPin/{pin}` - ✅ **WORKING** - Retrieves biometric templates (v2)
- `POST v2/bioTemplate/deleteByPin` - Delete templates by PIN (not implemented yet)

#### Access Control (v2.0)
- `GET /api/access-levels` → `GET v2/accLevel/list` - ✅ **WORKING** - Lists access levels
- `POST /api/access-levels/assign` → `POST accLevel/addLevelPerson` - ✅ **WORKING** - Assigns access levels to persons using full string IDs
- `DELETE /api/access-levels/assign` → `POST accLevel/deleteLevel` - ✅ **WORKING** - Removes access levels from persons
- `POST accLevel/addLevel` - Create access level (not implemented yet)
- `POST accLevel/deleteLevel` - Delete access level (not implemented yet)

#### Branch/Department Management (v1.0)
- `GET /api/branches` → `POST department/getDepartmentList` - ✅ **WORKING** - Lists hierarchical departments
- `POST /api/branches` → `POST department/add` - ✅ **WORKING** - Creates new departments

#### Door Management (v2.0)
- `GET /api/doors` → `GET /api/door/list` - ✅ **WORKING** - Lists all doors with device grouping
- `GET /api/devices` → `GET /api/device/accList` - ✅ **WORKING** - Lists access devices for naming

#### Reader Management (v2.0)
- `GET /api/readers` → `GET /api/v2/reader/list` - ✅ **WORKING** - Lists access readers associated with doors

### 📊 Current Data Status

#### Person Data Structure (PIN-Based System)
The system now uses PIN-based account numbers with automatic spouse relationship tracking:

```json
[
  {
    "pin": "23510009090",
    "name": "George Mrema",
    "deptCode": "1",
    "accLevelIds": "402880f39ae893ad019ae895fe3d0463",
    "gender": "M",
    "email": "calvin@comsec.co.tz",
    "relationship": "principal"
  },
  {
    "pin": "23510009090s1",
    "name": "Zainab Gamaru",
    "deptCode": "1",
    "accLevelIds": "402880f39ae893ad019ae895fe3d0463",
    "gender": "F",
    "relationship": "spouse",
    "linkedTo": "23510009090"
  }
]
```

#### PIN Generation Rules
- **Principal**: `{accountNumber}` (max 15 characters)
- **Spouse**: `{accountNumber}s1` (automatic generation)
- **Relationship**: Tracked via PIN suffix for access management

#### Access Level Data (2 records loaded)
```json
[
  {
    "id": "402880f39ae893ad019ae895fe3d0463",
    "name": "General Access"
  },
  {
    "id": "402880f39ae893ad019ae895fe3d0464",
    "name": "VIP Access"
  }
]
```

#### Door Data Structure (Device-Grouped)
```json
[
  {
    "id": "402880209afc9bd7019b1210f8a60179",
    "name": "RND Door-1",
    "deviceId": "402880209afc9bd7019b1210f7c8013e"
  },
  {
    "id": "402880209afc9bd7019b1210f8a8017a",
    "name": "RND Door-2",
    "deviceId": "402880209afc9bd7019b1210f7c8013e"
  }
]
```

#### Device Data Structure
```json
[
  {
    "id": "402880209afc9bd7019b1210f7c8013e",
    "name": "Main Access Controller"
  }
]
```

### 🔄 Data Synchronization Features

#### Automatic Refresh
- **Page Load**: Data loads automatically on page refresh
- **Component Mount**: Fresh data on component initialization
- **Background Sync**: Auto-refresh every 5 minutes
- **Manual Refresh**: Global and component-level refresh buttons

#### Real-time Updates
- **Timestamp Display**: Shows when data was last refreshed
- **Loading States**: Skeleton screens during data fetch
- **Success Feedback**: Notifications for successful operations
- **Error Recovery**: Graceful handling of API failures

### ✅ Recently Implemented Endpoints

#### Door Management (v2.0)
- `GET /api/doors` → `GET /api/door/list` - ✅ **WORKING** - Lists all doors with device grouping
- Door selection grouped by device ID with filter support

#### Device Management (v2.0)
- `GET /api/devices` → `GET /api/device/accList` - ✅ **WORKING** - Lists access devices for naming

#### Reader Management (v2.0)
- `GET /api/readers` → `GET /api/v2/reader/list` - ✅ **WORKING** - Lists access readers associated with doors

### 🚧 Planned Endpoints (Not Yet Implemented)

#### Door Control (v2.0)
- `POST /api/door/remoteOpenById` - Remote door open
- `POST /api/door/remoteCloseById` - Remote door close
- `GET /api/door/doorStateById` - Get door state

#### Transaction History (v3.0)
- `GET /api/v3/transaction/person/{pin}` - Get person transactions
- `GET /api/v3/transaction/device/{sn}` - Get device transactions
- `GET /api/v2/transaction/list` - List all transactions

#### Card Management (v2.0)
- `GET /api/v2/card/getCards/{pin}` - Get cards by PIN
- `POST /api/card/set` - Assign card to person

#### Advanced Biometric Operations
- `POST /api/v2/bioTemplate/deleteByPin` - Delete templates by PIN
- `POST /api/bioTemplate/update` - Update biometric templates

#### Person Management Extensions
- `PUT /api/v2/person/update/{pin}` - Update person details
- `POST /api/v2/person/delete/{pin}` - Delete person by PIN
- `POST /api/person/leave` - Process person leave
- `POST /api/person/reinstated` - Reinstated person

## Usage in IMS - API v2 Integration

### Registration System
- **PIN-Based Registration**: Account numbers serve as ZK API PINs (max 15 characters)
- **Couple Registration**: Principal + spouse with automatic "s1" suffix generation
- **Biometric Upload**: Optional fingerprint template upload via `bioTemplate/add` (v1) - can be done during editing
- **Access Assignment**: Automatic access level assignment during registration
- **Branch Management**: Hierarchical department selection via `department/getDepartmentList` (v1)

### Data Management
- **Relationship Tracking**: Principal-spouse linkage via PIN for cascade access management
- **Real-time Sync**: Automatic data refresh with manual override options
- **Biometric Retrieval**: Fetch templates via `/api/v2/bioTemplate/getFgListByPin/{pin}`
- **Access Control**: Assign/remove access levels with immediate API synchronization
- **Door Management**: Device-grouped door selection with filtering capabilities
- **Device Integration**: Access device naming and management

### API Integration Features
- **Proxy Routes**: All ZK API calls routed through Next.js for CORS/SSL handling
- **Error Recovery**: Comprehensive error handling with user feedback
- **Data Validation**: Client and server-side validation for all operations
- **Caching**: 5-minute TTL for branch and access level data

## Documentation

Full manual available from ZKTECO: Search for "ZKBio CVSecurity 3rd Party API User Manual" (PDF, v1.1).

## Notes

### PIN Management
- **PIN Format**: Account numbers serve as ZK API PINs (max 15 characters, no format restrictions)
- **Uniqueness**: Each PIN must be unique across the ZK system
- **Relationship Tracking**: Spouse PINs use "s1" suffix (e.g., PB-123456 → PB-123456s1)
- **Security**: PINs are sensitive data - handle securely and never log in plain text

### Biometric Integration
- **Real-time Upload**: Fingerprint templates uploaded directly to ZK API during registration
- **Template Format**: Base64 encoded with version and validation metadata
- **Retrieval**: Templates can be fetched for verification and management
- **Device Compatibility**: Requires ZK-compatible biometric capture devices

### Access Control
- **Cascade Management**: Principal access removal automatically affects linked spouse accounts
- **Real-time Assignment**: Access levels assigned immediately during registration
- **Relationship Tracking**: PIN-based linkage enables automatic access management

### API Integration
- **API Version**: Primarily using ZKTECO API v2.0 for enhanced functionality
- **Proxy Architecture**: All ZK API calls routed through Next.js for CORS and SSL handling
- **Error Handling**: Comprehensive error recovery with user-friendly feedback
- **Rate Limiting**: Respect API rate limits and implement appropriate retry logic
- **HTTPS Required**: Production deployments must use HTTPS for security

### Data Synchronization
- **Caching Strategy**: 5-minute TTL for branch and access level data
- **Real-time Updates**: Immediate synchronization for critical operations
- **Background Sync**: Automatic refresh for non-critical data
- **Conflict Resolution**: Handle concurrent access and data consistency