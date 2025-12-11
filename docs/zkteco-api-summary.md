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

## API Versions & Endpoints

This application uses **ZKBio CVSecurity API v2.0** for most operations and **v3.0** for transaction endpoints.

### Person Management (v2.0)
- `POST /api/v2/person/getPersonList` - List persons with pagination and filters
- `GET /api/v2/person/get/{pin}` - Get person by PIN
- `POST /api/v2/person/add` - Create new person
- `PUT /api/v2/person/update/{pin}` - Update person
- `POST /api/v2/person/delete/{pin}` - Delete person

### Access Control (v2.0)
- `GET /api/v2/accLevel/list` - List access levels
- `POST /api/accLevel/addLevel` - Create access level
- `POST /api/accLevel/deleteLevel` - Delete access level
- `POST /api/accLevel/addLevelPerson` - Grant access to person
- `POST /api/accLevel/deleteLevel` - Remove access from person

### Reader Management (v2.0)
- `GET /api/v2/reader/list` - List readers
- `POST /api/v2/reader/add` - Create reader
- `PUT /api/v2/reader/update/{id}` - Update reader
- `POST /api/v2/reader/delete/{id}` - Delete reader

### Door Control (v2.0)
- `GET /api/v2/door/list` - List doors
- `POST /api/door/remoteOpenById` - Remote door open
- `POST /api/door/remoteCloseById` - Remote door close
- `GET /api/door/doorStateById` - Get door state

### Transaction History (v3.0)
- `GET /api/v3/transaction/person/{pin}` - Get person transactions
- `GET /api/v3/transaction/device/{sn}` - Get device transactions
- `GET /api/v2/transaction/list` - List all transactions

### Card Management (v2.0)
- `GET /api/v2/card/getCards/{pin}` - Get cards by PIN
- `POST /api/card/set` - Assign card to person

### Biometric Templates (v2.0)
- `GET /api/v2/bioTemplate/getFgListByPin/{pin}` - Get fingerprint templates
- `POST /api/bioTemplate/add` - Upload biometric template
- `POST /api/v2/bioTemplate/deleteByPin` - Delete templates by PIN

## Usage in IMS

In this application:
- Fetch persons to display inventory access personnel.
- Register new persons with cards and fingerprints for biometric access.
- Sync data for real-time access control integration.

## Documentation

Full manual available from ZKTECO: Search for "ZKBio CVSecurity 3rd Party API User Manual" (PDF, v1.1).

## Notes

- Rate limits and error codes depend on server configuration.
- Ensure HTTPS for production.
- Biometric capture requires compatible devices; templates are base64 encoded.