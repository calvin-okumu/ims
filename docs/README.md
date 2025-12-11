# Banking Access Control System with ZKTECO Integration

## Overview

This is a Next.js-based Banking Access Control System that integrates with the ZKTECO BioCVSecurity API to manage private banking customers and their spouses' access to specific areas. Accounts are stored in SQLite, with automatic access revocation on status changes.

## Features

- Register banking accounts with principal and spouse details
- Automatic fingerprint and card registration for both
- Assign "VIP Lounge" access level with door controls
- Status-based access management (active/inactive)
- Fetch and display personnel and accounts
- RESTful API integration with error handling and loading states
- Responsive UI built with Tailwind CSS and TypeScript

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: SQLite (better-sqlite3) for data persistence
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **API**: ZKTECO BioCVSecurity 3rd Party API (v2.0/v3.0)

## Setup

### Prerequisites

1. **ZKBio CVSecurity Server**: Ensure your ZKBio CVSecurity server is running and accessible
2. **API Authorization Setup**: Configure API access in ZKBio admin panel (see below)

### ZKBio API Authorization Setup

Follow these steps to configure API authorization in your ZKBio CVSecurity admin panel:

#### Step 1: Access API Authorization
1. Log into your ZKBio CVSecurity system as a superuser (e.g., username: `admin`, password: `#eCOM@786SEC`)
2. Navigate to: **System** → **Authority Management** → **API Authorization**
3. Click **New** to create a new API client

#### Step 2: Create API Client
- **Client ID**: Enter a unique identifier for your API client
- **Client Secret**: The system will generate a secret key automatically
- **Note**: The client secret is your API token - save it securely

#### Step 3: Enable API Access
- After creating the client, click **Browse API** to access the API operation page
- The API operation page must be open for normal API access
- **Important**: If the client ID and secret are not properly configured, API access will be abnormal

#### Step 4: API Token Usage
- All API requests must include the access token as a URL parameter
- Format: `?access_token=YOUR_CLIENT_SECRET`
- Example: `https://your-server:8098/api/v2/person/list?pageNo=1&pageSize=10&access_token=8D1E99707293387C5B3BFC7291AD38CB`

#### Step 5: Additional Configuration
- **Refresh**: Click **Refresh** to get the most updated API authorization page
- **Edit**: Click **Edit** to modify API authorization details
- **Delete**: Select and delete unwanted API clients

### Application Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create `.env.local` with your ZKBio API credentials:
   ```
   NEXT_PUBLIC_ZKBIO_API_URL=https://your-zkbio-server:8098/api
   NEXT_PUBLIC_ZKBIO_API_TOKEN=your_client_secret_here
   ```
4. Run the development server: `npm run dev`
5. Open http://localhost:3001

## Usage

- **Home Page**: View registered personnel and register new ones.
- **Registration Form**: Enter name, optional card number, and fingerprint template (base64).
- Data is synced with ZKTECO BioCVSecurity for biometric access control.

## API Endpoints

The app provides RESTful API endpoints for account management, stored in SQLite.

### Accounts
- `GET /api/accounts` - Retrieve all accounts
- `POST /api/accounts` - Create a new account (requires JSON body with account details)
- `GET /api/accounts/{id}` - Retrieve a specific account by ID
- `PUT /api/accounts/{id}` - Update an account's status or details
- `DELETE /api/accounts/{id}` - Delete an account

### ZKTECO Integration

- **API Setup Guide**: `docs/zkbio-api-setup-guide.md` - Complete setup instructions for ZKBio API authorization
- **API Reference**: `docs/zkteco-api-reference-latest.md` - Full API documentation with endpoints
- **API Summary**: `docs/zkteco-api-summary.md` - Overview of ZKTECO BioCVSecurity API integration

## Development

- Lint: `npm run lint`
- Build: `npm run build`
- Start production: `npm start`

## Notes

- Fingerprint templates require base64 encoding; integrate with biometric devices for capture.
- Ensure ZKTECO server is accessible and API token is valid.