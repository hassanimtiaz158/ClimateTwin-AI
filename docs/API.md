# ClimateTwin AI - API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, authentication is optional for MVP. When implemented, use JWT tokens:

```http
Authorization: Bearer <your-token>
```

## Endpoints

### Scenarios

#### Create Scenario

```http
POST /api/scenarios/
Content-Type: application/json

{
  "name": "Green City 2030",
  "region": "Europe",
  "actions": ["renewable_energy", "public_transit", "reforestation"],
  "start_year": 2024,
  "end_year": 2034
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Green City 2030",
  "region": "Europe",
  "actions": ["renewable_energy", "public_transit", "reforestation"],
  "start_year": 2024,
  "end_year": 2034,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Get Scenario

```http
GET /api/scenarios/{scenario_id}
```

#### List Scenarios

```http
GET /api/scenarios/?skip=0&limit=100
```

### Simulation

#### Run Simulation

```http
POST /api/simulate/
Content-Type: application/json

{
  "scenario_id": "uuid"
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "status": "completed",
  "message": "Simulation completed successfully"
}
```

### Results

#### Get Results

```http
GET /api/results/{run_id}
```

**Response:**
```json
{
  "run_id": "uuid",
  "scenario": {
    "name": "Green City 2030",
    "region": "Europe",
    "actions": ["renewable_energy", "public_transit"]
  },
  "projections": [
    {
      "year": 2024,
      "temperature": 14.5,
      "co2_emissions": 400,
      "baseline": 14.5,
      "baseline_co2": 400
    },
    {
      "year": 2029,
      "temperature": 14.3,
      "co2_emissions": 350,
      "baseline": 14.7,
      "baseline_co2": 450
    }
  ],
  "metrics": {
    "temp_change": -0.2,
    "co2_reduction": 12.5,
    "renewable_pct": 55.0,
    "aqi": 42
  }
}
```

### History

#### Get Simulation History

```http
GET /api/history/?skip=0&limit=50
```

**Response:**
```json
[
  {
    "id": "uuid",
    "scenario_id": "uuid",
    "scenario_name": "Green City 2030",
    "status": "completed",
    "started_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:30:05Z"
  }
]
```

### Recommendations

#### Get AI Recommendations

```http
GET /api/recommendations/{run_id}
```

**Response:**
```json
{
  "run_id": "uuid",
  "summary": "Your scenario shows promising potential...",
  "findings": [
    "Renewable energy adoption shows significant potential...",
    "Public transit expansion can reduce urban emissions..."
  ],
  "actions": [
    {
      "title": "Scale Solar & Wind Infrastructure",
      "description": "Increase renewable energy capacity by 40%...",
      "priority": "high",
      "impact": "25-35% CO2 reduction"
    }
  ],
  "confidence": 78.5
}
```

### Datasets

#### Upload Dataset

```http
POST /api/datasets/upload
Content-Type: multipart/form-data

file: climate_data.csv
name: Global Temperature Data
source: NOAA
region: Global
```

#### List Datasets

```http
GET /api/datasets/
```

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Invalid input data"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

API requests are rate-limited to:
- 100 requests per minute (authenticated)
- 20 requests per minute (unauthenticated)

## Pagination

List endpoints support pagination:

```http
GET /api/scenarios/?skip=0&limit=20
```

- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 1000)
