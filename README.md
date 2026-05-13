# sewing-app

A web application for a seamstress. The seamstress create a client, their order, the deposit paid (if any) and the full amount. There is a dashboard page and orders page. There is also an orders form for new orders.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS 
| Backend | Node.js + Express 
| Database | PostgreSQL 16 |
| Containerisation | Docker + Docker Compose 
| Reverse Proxy | Nginx 
| CI/CD | GitHub Actions 
| Testing | Jest + Supertest 

# Features

- Create and manage sewing orders with full client details
- Track order status: New → In Progress → Fitting → Done
- Store client measurements per order (bust, waist, hips, shoulder, length, sleeve)
- Monitor deadlines with colour-coded urgency indicators
- Track quoted price, deposits paid, and balance remaining
- Filter orders by status
- Support for multiple garment types: matric dance dress, wedding dress, bridesmaid dress, traditional outfit, school uniform, and more
- Existing client lookup when creating new orders

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/) (for local development without Docker)
- [Git](https://git-scm.com/)

### Run with Docker (recommended)

```bash
git clone https://github.com/YOUR_USERNAME/sewing-orders-app.git
cd sewing-orders-app
cp .env.example .env
docker-compose up --build
```

Open [http://localhost](http://localhost) in your browser.

### Run without Docker (development)

**1. Start the database**
```bash
docker-compose up db -d
```

**2. Start the backend**
```bash
cd backend
cp .env.example .env  # fill in your values
npm install
npm run dev
```

**3. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on [http://localhost:5173](http://localhost:5173)

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/sewing_orders
VITE_API_URL=http://localhost:5000
```

Never commit your `.env` file — it is in `.gitignore`.

## API Reference

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create a client |
| PUT | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders?status=new` | Filter orders by status |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create an order |
| PUT | `/api/orders/:id` | Update an order |
| DELETE | `/api/orders/:id` | Delete an order |

## Testing

```bash
cd backend
npm test
```

Tests cover:
- Health check endpoint
- Full CRUD for clients
- Full CRUD lifecycle for orders
- Status filtering
- Error handling (404, 400)

## CI/CD Pipeline

Every push to `main` or `develop` automatically:

1. **Tests the backend** — spins up a real PostgreSQL instance and runs all Jest tests
2. **Builds the frontend** — confirms the React app compiles without errors
3. **Builds Docker images** — confirms both services containerise successfully

Pipeline only proceeds to the next stage if the previous one passes.