# ZKBio API Endpoints Used

## Overview

This document lists the ZKBio CVSecurity API endpoints currently used by the Banking Access Control System.

**Base URL**: `https://192.168.183.114:8098/api`
**Authentication**: Access token via URL parameter (`access_token=TOKEN`)
**Proxy**: Next.js API routes handle CORS and SSL issues

## Endpoints Used

### Person Management (v2)
- `POST person/getPersonList` - Get persons with filtering
- `POST person/add` - Create new person

### Biometric Templates
- `POST bioTemplate/add` - Upload fingerprint template (v1)
- `GET v2/bioTemplate/getFgListByPin/{pin}` - Get fingerprint templates (v2)

### Access Levels (v2)
- `GET accLevel/list` - List access levels
- `POST accLevel/addLevelPerson` - Assign access level to person
- `POST accLevel/deleteLevel` - Remove access level from person

### Departments (v1)
- `POST department/getDepartmentList` - List departments hierarchically
- `POST department/add` - Create new department

## Response Format

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

**Response Codes**:
- `code: 0` = Success
- `code: 400` = Bad Request
- `code: 401` = Unauthorized
- `code: 403` = Forbidden
- `code: 404` = Not Found
- **Parameters**: 
  - `accApiLevelAddItems` (array, required): Array of access level items
- **Responses**: 200, 201, 401, 403, 404

#### Add Level Door
- **Endpoint**: `POST /api/accLevel/addLevelDoor`
- **Description**: Add doors to an access level
- **Tags**: `AccLevel`
- **Parameters**:
  - `accApiLevelAddDoorItems` (array, required): Array of door items
- **Responses**: 200, 201, 401, 403, 404

#### Add Level Person
- **Endpoint**: `POST /api/accLevel/addLevelPerson`
- **Description**: Assign persons to an access level
- **Tags**: `AccLevel`
- **Parameters**:
  - `levelIds` (array, required, query): Level IDs
  - `pin` (string, required, query): PIN code
- **Responses**: 200, 201, 401, 403, 404

#### Delete Person Level
- **Endpoint**: `POST /api/accLevel/deleteLevel`
- **Description**: Delete a person's access level
- **Tags**: `AccLevel`
- **Parameters**:
  - `levelIds` (string, required, query): Level IDs
  - `pin` (string, required, query): PIN code
- **Responses**: 200, 201, 401, 403, 404

#### Get Access Level by ID
- **Endpoint**: `GET /api/accLevel/getById/{id}`
- **Description**: Retrieve access level by ID
- **Tags**: `AccLevel`
- **Parameters**:
  - `id` (string, required, path): Access level ID
- **Responses**: 200, 401, 403, 404

#### Get Access Level by Name
- **Endpoint**: `GET /api/accLevel/getByName/{name}`
- **Description**: Retrieve access level by name
- **Tags**: `AccLevel`
- **Parameters**:
  - `name` (string, required, path): Access level name
- **Responses**: 200, 401, 403, 404

#### List Access Levels
- **Endpoint**: `GET /api/accLevel/list`
- **Description**: Get paginated list of access levels
- **Tags**: `AccLevel`
- **Parameters**:
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
- **Responses**: 200, 401, 403, 404

#### Sync Level
- **Endpoint**: `POST /api/accLevel/syncLevel`
- **Description**: Synchronize access level data
- **Tags**: `AccLevel`
- **Parameters**:
  - `levelId` (string, required, query): Level ID
- **Responses**: 200, 201, 401, 403, 404

#### Sync Person Level
- **Endpoint**: `POST /api/accLevel/syncPerson`
- **Description**: Synchronize person access level data
- **Tags**: `AccLevel`
- **Parameters**:
  - `levelIds` (string, required, query): Level IDs
  - `pin` (string, required, query): PIN code
- **Responses**: 200, 201, 401, 403, 404

### Biometric Templates (`/api/bioTemplate/`)

#### Add BioTemplate
- **Endpoint**: `POST /api/bioTemplate/add`
- **Description**: Add biometric template
- **Tags**: `PersBioTemplate`
- **Parameters**:
  - `apiBioTemplate` (object, required): Biometric template data
- **Responses**: 200, 201, 401, 403, 404

#### Delete BioTemplate by PIN and Template Number
- **Endpoint**: `POST /api/bioTemplate/delete/{pin}{templateNo}`
- **Description**: Delete specific biometric template
- **Tags**: `PersBioTemplate`
- **Parameters**:
  - `pin` (string, required, query): PIN code
  - `templateNo` (integer, required, query): Template number
- **Responses**: 200, 201, 401, 403, 404

#### Delete All BioTemplates by PIN
- **Endpoint**: `POST /api/bioTemplate/deleteByPin/{pin}`
- **Description**: Delete all biometric templates for a PIN
- **Tags**: `PersBioTemplate`
- **Parameters**:
  - `pin` (string, required, query): PIN code
- **Responses**: 200, 201, 401, 403, 404

#### Get BioTemplate List by PIN
- **Endpoint**: `GET /api/bioTemplate/getFgListByPin/{pin}`
- **Description**: Get fingerprint templates for a PIN
- **Tags**: `PersBioTemplate`
- **Parameters**:
  - `pin` (string, required, query): PIN code
- **Responses**: 200, 401, 403, 404

### Cards (`/api/card/`)

#### Get Card List by PIN
- **Endpoint**: `GET /api/card/getCards/{pin}`
- **Description**: Retrieve cards associated with a PIN
- **Tags**: `PersCard`
- **Parameters**:
  - `pin` (string, required, path): PIN code
- **Responses**: 200, 401, 403, 404

#### Set Card to Person
- **Endpoint**: `POST /api/card/set`
- **Description**: Assign card to a person
- **Tags**: `PersCard`
- **Parameters**:
  - `card` (object, required): Card data
- **Responses**: 200, 201, 401, 403, 404

### Departments (`/api/department/`)

#### Add Department
- **Endpoint**: `POST /api/department/add`
- **Description**: Create or update department
- **Tags**: `PersDepartment`
- **Parameters**:
  - `department` (object, required): Department data
- **Responses**: 200, 201, 401, 403, 404

#### Delete Department by Code
- **Endpoint**: `POST /api/department/delete/{code}`
- **Description**: Delete department by code
- **Tags**: `PersDepartment`
- **Parameters**:
  - `code` (string, required, path): Department code
- **Responses**: 200, 201, 401, 403, 404

#### Get Department by Code
- **Endpoint**: `GET /api/department/get/{code}`
- **Description**: Retrieve department by code
- **Tags**: `PersDepartment`
- **Parameters**:
  - `code` (string, required, path): Department code
- **Responses**: 200, 401, 403, 404

#### Get Department List
- **Endpoint**: `POST /api/department/getDepartmentList`
- **Description**: Get departments by department codes
- **Tags**: `PersDepartment`
- **Parameters**:
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
- **Responses**: 200, 201, 401, 403, 404

### Devices (`/api/device/`)

#### Get Access Devices
- **Endpoint**: `GET /api/device/accList`
- **Description**: Get list of access devices
- **Tags**: `AccDevice`
- **Parameters**:
  - `pageNo` (integer, required, query): Page index
  - `pageSize` (integer, required, query): Page size
- **Responses**: 200, 401, 403, 404

#### Get Access Device by SN
- **Endpoint**: `GET /api/device/getAcc`
- **Description**: Get device info by serial number
- **Tags**: `AccDevice`
- **Parameters**:
  - `sn` (string, optional, query): Device serial number
- **Responses**: 200, 401, 403, 404

### Doors (`/api/door/`)

#### Get All Doors State
- **Endpoint**: `GET /api/door/allDoorState`
- **Description**: Get state of all doors
- **Tags**: `AccDoor`
- **Responses**: 200, 401, 403, 404

#### Get Door State by ID
- **Endpoint**: `GET /api/door/doorStateById`
- **Description**: Get door state by ID
- **Tags**: `AccDoor`
- **Parameters**:
  - `doorId` (string, optional, query): Door ID
- **Responses**: 200, 401, 403, 404

#### Get Door State by SN
- **Endpoint**: `GET /api/door/doorStateBySn`
- **Description**: Get door state by device serial number
- **Tags**: `AccDoor`
- **Parameters**:
  - `deviceSn` (string, optional, query): Device serial number
- **Responses**: 200, 401, 403, 404

#### Get Door by ID
- **Endpoint**: `GET /api/door/get`
- **Description**: Get door information by ID
- **Tags**: `AccDoor`
- **Parameters**:
  - `id` (string, optional, query): Door ID
- **Responses**: 200, 401, 403, 404

#### List Doors
- **Endpoint**: `GET /api/door/list`
- **Description**: Get paginated list of doors
- **Tags**: `AccDoor`
- **Parameters**:
  - `pageNo` (integer, optional, query): Page number
  - `pageSize` (integer, optional, query): Page size
- **Responses**: 200, 401, 403, 404

#### Remote Close Door by ID
- **Endpoint**: `POST /api/door/remoteCloseById`
- **Description**: Remotely close door by ID
- **Tags**: `AccDoor`
- **Parameters**:
  - `doorId` (string, optional, query): Door ID
- **Responses**: 200, 201, 401, 403, 404

#### Remote Close Door by Name
- **Endpoint**: `POST /api/door/remoteCloseByName`
- **Description**: Remotely close door by name
- **Tags**: `AccDoor`
- **Parameters**:
  - `doorName` (string, optional, query): Door name
- **Responses**: 200, 201, 401, 403, 404

#### Remote Open Door by ID
- **Endpoint**: `POST /api/door/remoteOpenById`
- **Description**: Remotely open door by ID
- **Tags**: `AccDoor`
- **Parameters**:
  - `doorId` (string, optional, query): Door ID
  - `interval` (integer, optional, query): Open interval
- **Responses**: 200, 201, 401, 403, 404

#### Remote Open Door by Name
- **Endpoint**: `POST /api/door/remoteOpenByName`
- **Description**: Remotely open door by name
- **Tags**: `AccDoor`
- **Parameters**:
  - `doorName` (string, optional, query): Door name
  - `interval` (integer, optional, query): Open interval
- **Responses**: 200, 201, 401, 403, 404

### Persons (`/api/person/`)

#### Add Person
- **Endpoint**: `POST /api/person/add`
- **Description**: Create or update person
- **Tags**: `Person`
- **Parameters**:
  - `person` (object, required): Person data
- **Responses**: 200, 201, 401, 403, 404

#### Add Personnel Basic Information
- **Endpoint**: `POST /api/person/addPersonnelBasicInfo`
- **Description**: Create or update basic personnel information
- **Tags**: `Person`
- **Parameters**:
  - `person` (object, required): Personnel basic info
- **Responses**: 200, 201, 401, 403, 404

#### Delete Person by PIN
- **Endpoint**: `POST /api/person/delete/{pin}`
- **Description**: Delete person by PIN
- **Tags**: `Person`
- **Parameters**:
  - `pin` (string, required, path): PIN code
- **Responses**: 200, 201, 401, 403, 404

#### Get Person by PIN
- **Endpoint**: `GET /api/person/get/{pin}`
- **Description**: Retrieve person by PIN
- **Tags**: `Person`
- **Parameters**:
  - `pin` (string, required, path): PIN code
- **Responses**: 200, 401, 403, 404

#### Get Person List
- **Endpoint**: `POST /api/person/getPersonList`
- **Description**: Get persons by PIN list and department code
- **Tags**: `Person`
- **Parameters**:
  - `deptCodes` (string, optional, query): Department codes
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
  - `pins` (string, optional, query): PIN codes
- **Responses**: 200, 201, 401, 403, 404

#### Get Dynamic QR Code
- **Endpoint**: `POST /api/person/getQrCode/{pin}`
- **Description**: Generate dynamic QR code for PIN
- **Tags**: `Person`
- **Parameters**:
  - `pin` (string, required, path): PIN code
- **Responses**: 200, 201, 401, 403, 404

#### Leave Person
- **Endpoint**: `POST /api/person/leave`
- **Description**: Process person leave
- **Tags**: `Person`
- **Parameters**:
  - `persApiLeavePersonItem` (object, required): Leave data
- **Responses**: 200, 201, 401, 403, 404

#### Reinstated Person
- **Endpoint**: `POST /api/person/reinstated`
- **Description**: Reinstated person
- **Tags**: `Person`
- **Parameters**:
  - `person` (object, required): Person data
- **Responses**: 200, 201, 401, 403, 404

#### Update Personnel Photo
- **Endpoint**: `POST /api/person/updatePersonnelPhoto`
- **Description**: Update personnel photo
- **Tags**: `Person`
- **Parameters**:
  - `person` (object, required): Person with photo data
- **Responses**: 200, 201, 401, 403, 404

### Readers (`/api/reader/`)

#### Get Access Readers
- **Endpoint**: `GET /api/reader/accList`
- **Description**: Get list of access readers
- **Tags**: `AccReader`
- **Parameters**:
  - `pageNo` (integer, optional, query): Page number
  - `pageSize` (integer, optional, query): Page size
- **Responses**: 200, 401, 403, 404

#### Get Access Reader by ID
- **Endpoint**: `GET /api/reader/getAcc`
- **Description**: Get reader info by ID
- **Tags**: `AccReader`
- **Parameters**:
  - `id` (string, optional, query): Reader ID
- **Responses**: 200, 401, 403, 404

### Transactions (`/api/transaction/`)

#### Get Transaction List by Device SN
- **Endpoint**: `GET /api/transaction/device/{deviceSn}`
- **Description**: Get transactions for a specific device
- **Tags**: `AccTransaction`
- **Parameters**:
  - `deviceSn` (string, required, path): Device serial number
  - `endDate` (string, optional, query): End date filter
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
  - `startDate` (string, optional, query): Start date filter
- **Responses**: 200, 401, 403, 404

#### Get First In and Last Out by PIN
- **Endpoint**: `GET /api/transaction/firstInAndLastOut/{pin}`
- **Description**: Get first entry and last exit for PIN
- **Tags**: `AccTransaction`
- **Parameters**:
  - `pin` (string, required, path): PIN code
  - `endDate` (string, optional, query): End date filter
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
  - `startDate` (string, optional, query): Start date filter
- **Responses**: 200, 401, 403, 404

#### Get Transaction by ID
- **Endpoint**: `GET /api/transaction/getById/{id}`
- **Description**: Get transaction details by ID
- **Tags**: `AccTransaction`
- **Parameters**:
  - `id` (string, required, path): Transaction ID
- **Responses**: 200, 401, 403, 404

#### Get Door Transaction Detail
- **Endpoint**: `POST /api/transaction/getDoorTransactionDetail`
- **Description**: Get detailed door transaction information
- **Tags**: `AccTransaction`
- **Parameters**:
  - `zkMessage` (object, required): ZK message
- **Responses**: 200, 201, 401, 403, 404

#### Get Door Transactions
- **Endpoint**: `POST /api/transaction/getDoorTransactions`
- **Description**: Get door transaction list
- **Tags**: `AccTransaction`
- **Parameters**:
  - `zkMessage` (object, required): ZK message
- **Responses**: 200, 201, 401, 403, 404

#### Get Transaction List
- **Endpoint**: `GET /api/transaction/list`
- **Description**: Get paginated transaction list
- **Tags**: `AccTransaction`
- **Parameters**:
  - `endDate` (string, optional, query): End date filter
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
  - `personPin` (string, optional, query): Person PIN filter
  - `startDate` (string, optional, query): Start date filter
- **Responses**: 200, 401, 403, 404

#### Monitor
- **Endpoint**: `GET /api/transaction/monitor`
- **Description**: Monitor transactions
- **Tags**: `AccTransaction`
- **Parameters**:
  - `timestamp` (string, required, query): Timestamp
- **Responses**: 200, 401, 403, 404

#### Get Transaction List by PIN
- **Endpoint**: `GET /api/transaction/person/{pin}`
- **Description**: Get transactions for a specific PIN
- **Tags**: `AccTransaction`
- **Parameters**:
  - `pin` (string, required, path): PIN code
  - `endDate` (string, optional, query): End date filter
  - `pageNo` (integer, required, query): Page number
  - `pageSize` (integer, required, query): Page size
  - `startDate` (string, optional, query): Start date filter
- **Responses**: 200, 401, 403, 404

## API Version 2.0 Endpoints

Many endpoints have v2 versions with enhanced functionality:

### Access Levels v2
- `GET /api/v2/accLevel/getById/{id}`
- `GET /api/v2/accLevel/getByName/{name}`
- `GET /api/v2/accLevel/list`

### Biometric Templates v2
- `POST /api/v2/bioTemplate/delete`
- `POST /api/v2/bioTemplate/deleteByPin`
- `GET /api/v2/bioTemplate/getFgListByPin/{pin}`

### Cards v2
- `GET /api/v2/card/getCards`

### Departments v2
- `POST /api/v2/department/delete`
- `GET /api/v2/department/get`

### Devices v2
- `GET /api/v2/device/list`

### Doors v2
- `GET /api/v2/door/list`

### Persons v2
- `POST /api/v2/person/addPersons`
- `POST /api/v2/person/delete`
- `POST /api/v2/person/deleteByPins`
- `POST /api/v2/person/detectFace`
- `GET /api/v2/person/get`
- `POST /api/v2/person/getPersonList`
- `POST /api/v2/person/getQrCode`

### Readers v2
- `GET /api/v2/reader/list`

### Transactions v2
- `GET /api/v2/transaction/device/{deviceSn}`
- `GET /api/v2/transaction/firstInAndLastOut/{pin}`
- `GET /api/v2/transaction/getById/{id}`
- `POST /api/v2/transaction/getDoorTransactions`
- `GET /api/v2/transaction/list`
- `GET /api/v2/transaction/person/{pin}`

## API Version 3.0 Endpoints

### Transactions v3
- `GET /api/v3/transaction/device`
- `GET /api/v3/transaction/firstInAndLastOut`
- `GET /api/v3/transaction/person`

## Data Models

### Access Level Item
```json
{
  "areaName": "string",
  "name": "string",
  "timeSegName": "string"
}
```

### Access Level Door Item
```json
{
  "doorName": "string",
  "levelName": "string"
}
```

### API Result Message
```json
{
  "code": "integer",
  "data": "object",
  "message": "string"
}
```

### Biometric Template Item
```json
{
  "pin": "string",
  "template": "string",
  "templateNo": "integer",
  "validType": "string",
  "version": "string"
}
```

### Card Item
```json
{
  "cardNo": "string",
  "cardType": "string",
  "pin": "string"
}
```

### Department Item
```json
{
  "code": "string",
  "name": "string",
  "parentCode": "string",
  "sortNo": "integer"
}
```

### Person Base Info Item
```json
{
  "birthday": "string",
  "cardNo": "string",
  "certNumber": "string",
  "certType": "string",
  "deptCode": "string",
  "email": "string",
  "gender": "string",
  "hireDate": "string",
  "isSendMail": "boolean",
  "lastName": "string",
  "mobilePhone": "string",
  "name": "string",
  "personPwd": "string",
  "pin": "string",
  "ssn": "string",
  "supplyCards": "string"
}
```

### Person Item
```json
{
  "accEndTime": "string",
  "accLevelIds": "string",
  "accStartTime": "string",
  "birthday": "string",
  "carPlate": "string",
  "cardNo": "string",
  "certNumber": "string",
  "certType": "string",
  "deptCode": "string",
  "email": "string",
  "gender": "string",
  "hireDate": "string",
  "isDisabled": "boolean",
  "isSendMail": "boolean",
  "lastName": "string",
  "leaveId": "string",
  "mobilePhone": "string",
  "name": "string",
  "personPhoto": "string",
  "personPwd": "string",
  "pin": "string",
  "ssn": "string",
  "supplyCards": "string"
}
```

### Leave Person Item
```json
{
  "leaveDate": "string",
  "leaveType": "string",
  "pin": "string"
}
```

### Face Photo Item
```json
{
  "personPhoto": "string",
  "pin": "string"
}
```

### Result Message
```json
{
  "attributes": "object",
  "msg": "string",
  "obj": "object",
  "success": "boolean"
}
```

### ZK Message
```json
{
  "activeType": "string",
  "appId": "string",
  "appKey": "string",
  "async": "boolean",
  "content": "object",
  "contentId": "string",
  "defaultContent": "string",
  "listContent": "array",
  "messageId": "string",
  "messageType": "string",
  "moduleCode": "string",
  "repeat": "boolean",
  "repeatCount": "integer"
}
```

### ZK Result Message
```json
{
  "data": "object",
  "i18nArgs": "array",
  "msg": "string",
  "ret": "string",
  "success": "boolean"
}
```

## Response Codes

| Code | Description |
|-------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 401 | Unauthorized - Invalid authentication |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |

## Error Handling

All API responses follow a consistent error format:

```json
{
  "code": 401,
  "message": "Unauthorized access",
  "data": null
}
```

## Rate Limiting

The API may implement rate limiting to prevent abuse. Check response headers for rate limit information.

## Pagination

List endpoints support pagination with the following parameters:
- `pageNo`: Page number (starting from 1)
- `pageSize`: Number of items per page

## Example Usage

### Get Access Levels
```bash
curl -X GET "https://192.168.0.93:8098/api/accLevel/list?pageNo=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Add Person
```bash
curl -X POST "https://192.168.0.93:8098/api/person/add" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "pin": "123456",
    "email": "john@example.com"
  }'
```

### Get Transactions by Device
```bash
curl -X GET "https://192.168.0.93:8098/api/transaction/device/ABC123?pageNo=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Notes

1. **Authentication**: All requests require a valid Bearer token
2. **Content-Type**: Always use `application/json` for POST/PUT requests
3. **SSL**: The API uses HTTPS for secure communication
4. **Versioning**: Some endpoints have multiple versions (v1, v2, v3)
5. **Pagination**: Use page numbers starting from 1
6. **Date Format**: Use ISO 8601 format for date parameters
7. **PIN Security**: Handle PIN codes securely and never log them
8. **Biometric Data**: Handle biometric templates with appropriate security measures

## Support

For API support and documentation updates, contact your ZKBio system administrator.

---

*Last Updated: December 2024*
*API Version: 2.0, 3.0*
*Base URL: https://192.168.0.93:8098/api*