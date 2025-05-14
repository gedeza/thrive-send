# Campaigns API

ThriveSend exposes a flexible `/api/campaigns` endpoint supporting advanced filtering and secure, validated creation of campaign resources.

---

## **Endpoint**

```
/api/campaigns
```

- **Methods:** `GET`, `POST`
- **Auth Required?** Yes, via Clerk (requests must be authenticated).

---

## **GET /api/campaigns**

Retrieve a list of campaigns, filtered by several supported parameters.

### **Query Parameters**

| Name            | Type     | Required | Description                                                                                                 |
|-----------------|----------|----------|-------------------------------------------------------------------------------------------------------------|
| organizationId  | string   | No       | Filter to campaigns belonging to a specific organization.                                                    |
| userId          | string   | No\*     | User making the request; defaults to currently authenticated user and scopes results to their organizations. |
| status          | string   | No       | Status filter. One of: `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`.                               |
| clientId        | string   | No       | Filter by associated client.                                                                                |
| projectId       | string   | No       | Filter by associated project.                                                                               |

\*Note: `userId` defaults to the currently authenticated user—do not specify manually.

### **Validation Rules**

- `status` must be a valid campaign status.
- Any unknown or invalid parameters will result in a `400 Bad Request` with a descriptive error.

### **Sample Request**

```http
GET /api/campaigns?organizationId=org_abc123&status=ACTIVE
Authorization: Bearer <token>
```

### **Sample Response**

```json
[
  {
    "id": "cmp_123",
    "name": "June Push",
    "description": "June offer campaign",
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "budget": 2000,
    "goals": "Boost engagement",
    "status": "ACTIVE",
    "organization": { "id": "org_abc123", "name": "Acme Corp" },
    "client": { "id": "cli_789", "name": "City Hall" },
    "project": { "id": "prj_456", "name": "Summer Launch" }
  }
]
```

---

## **POST /api/campaigns**

Create a new campaign, fully validated.

### **Request Body**

All fields marked **required** must be present. Validation errors will be returned for missing/invalid data.

| Name           | Type     | Required | Description                                                      |
|----------------|----------|----------|------------------------------------------------------------------|
| name           | string   | Yes      | The campaign name.                                               |
| description    | string   | No       | Campaign description.                                            |
| startDate      | string   | Yes      | Start date (ISO8601 string).                                     |
| endDate        | string   | Yes      | End date (ISO8601 string, must be >= startDate).                 |
| budget         | number   | No       | (Optional) Budget (positive number).                             |
| goals          | string   | No       | Goals of the campaign.                                           |
| status         | string   | No       | One of: `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`. Defaults to `DRAFT`. |
| organizationId | string   | Yes      | ID of the organization owning the campaign.                      |
| clientId       | string   | No       | (Optional) Linked client.                                        |
| projectId      | string   | No       | (Optional) Linked project.                                       |

### **Sample Request**

```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Bonanza",
  "description": "Launch event for summer season.",
  "startDate": "2025-07-01",
  "endDate": "2025-07-31",
  "budget": 5000,
  "goals": "Increase signups by 20%",
  "status": "ACTIVE",
  "organizationId": "org_abc123",
  "clientId": "cli_789",
  "projectId": "prj_456"
}
```

### **Sample Response (201 Created)**

```json
{
  "id": "cmp_456",
  "name": "Summer Bonanza",
  "description": "Launch event for summer season.",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-07-31T00:00:00.000Z",
  "budget": 5000,
  "goals": "Increase signups by 20%",
  "status": "ACTIVE",
  "organizationId": "org_abc123",
  "clientId": "cli_789",
  "projectId": "prj_456"
}
```

---

## **Error Responses**

- **401 Unauthorized:** Missing or invalid authentication.
- **400 Bad Request:** Missing required parameters, validation errors—error key(s) and message(s) in response.
- **Other:** Server errors or unknown issues return `500 Internal Server Error` with a generic error message.

### **Error Example**

```json
{
  "error": "End date cannot be before start date"
}
```

---

## **Notes**

- All responses are in JSON.
- Results are strictly scoped to the organizations and data the authenticated user is permitted to access.
- Attempts to access campaigns outside your allowed scope will return an empty result or authorization error.

---

**For integration details and further field mapping, see the full database schema and organization model documentation.**