# CoSpace Booking

CoSpace contains a React/Vite client and a modular Express API written in strict
TypeScript. The API currently uses an in-memory store, so users, spaces, and
bookings reset whenever the server restarts.

## Run locally

Open two terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` and calls the API at
`http://localhost:4000/api`. Copy the provided `.env.example` files if different
ports or origins are needed.

Seeded administrator:

- Email: `admin@cospace.com`
- Password: `Admin@123`

Every account created through registration receives the `member` role. The
server does not accept a role from the registration payload.

## API routes

Public:

- `GET /api/health`
- `GET /api/public/spaces?date=YYYY-MM-DD`
- `GET /api/public/spaces/:spaceId/slots?date=YYYY-MM-DD`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Authenticated member (administrators may also access these):

- `GET /api/member/spaces`
- `GET /api/member/spaces/:spaceId/slots?date=YYYY-MM-DD`
- `GET /api/member/bookings`
- `POST /api/member/bookings` — creates a direct confirmed booking
- `POST /api/member/booking-requests` — creates a pending request
- `PATCH /api/member/bookings/:bookingId/cancel`

Administrator:

- `GET /api/admin/spaces`
- `POST /api/admin/spaces`
- `PUT /api/admin/spaces/:spaceId`
- `DELETE /api/admin/spaces/:spaceId`
- `GET /api/admin/spaces/:spaceId/slots?date=YYYY-MM-DD`
- `GET /api/admin/booking-requests`
- `PATCH /api/admin/booking-requests/:bookingId` with
  `{ "status": "approved" }` or `{ "status": "rejected" }`

Authenticated requests use `Authorization: Bearer <token>`.

List endpoints support server-side pagination:

```text
GET /api/public/spaces?page=1&pageSize=12
GET /api/member/spaces?page=1&pageSize=12
GET /api/admin/spaces?page=1&pageSize=12
GET /api/member/bookings?page=1&pageSize=10
GET /api/admin/booking-requests?page=1&pageSize=10
```

Paginated responses include a `pagination` object containing `page`,
`pageSize`, `total`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.

## Authentication tokens

Registration and login return a 15-minute access token and a 7-day refresh
token. Both durations can be configured in seconds through
`ACCESS_TOKEN_EXPIRES_IN` and `REFRESH_TOKEN_EXPIRES_IN`.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "admin-1",
      "name": "CoSpace Admin",
      "email": "admin@cospace.com",
      "role": "admin",
      "createdAt": "2026-07-30T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>",
      "tokenType": "Bearer",
      "accessTokenExpiresIn": 900,
      "refreshTokenExpiresIn": 604800,
      "accessTokenExpiresAt": "2026-07-30T12:15:00.000Z",
      "refreshTokenExpiresAt": "2026-08-06T12:00:00.000Z"
    }
  },
  "timestamp": "2026-07-30T12:00:00.000Z"
}
```

Refresh a session with:

```json
POST /api/auth/refresh
{
  "refreshToken": "<jwt>"
}
```

Refresh tokens are rotated. After a successful refresh, the previous refresh
token is revoked and the client must store the new token pair. Logout accepts
the same body and revokes the active refresh token.

## Response format

All successful API responses use:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully.",
  "data": {},
  "timestamp": "2026-07-30T12:00:00.000Z"
}
```

All error responses use:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Description of the error.",
  "errors": null,
  "timestamp": "2026-07-30T12:00:00.000Z"
}
```

Booking bodies use:

```json
{
  "spaceId": "olive-room",
  "date": "2026-08-01",
  "startTime": "10:00",
  "endTime": "12:00"
}
```

## Structure

The server separates route definitions, controllers, business services,
middleware, configuration, constants, and the temporary data store under
`server/src`. Shared TypeScript domain models and the authenticated Express
request augmentation live under `server/src/types`. The client keeps one Axios instance in
`client/src/services/apiClient.ts` and exposes feature-specific API functions
from the other files in `client/src/services`.

## Verification

```bash
cd server && npm test
cd server && npm run typecheck
cd server && npm run build
cd client && npm run lint
cd client && npm run build
```
