# AmarCash

AmarCash is a secured service to transfer your money.

---

## Features

- **Backend**: Built with Node.js, Express, and TypeScript.
- **Frontend**: Built with React, Recharts, Redux, RTK Query, RadixUI, TailwindCSS.
- **Database**: Mongoose.
- **Deployment**: Vercel.

---

## Live Links

- **Backend API**: [https://mfs-server-eosin.vercel.app/](https://mfs-server-eosin.vercel.app/)
- **Frontend App**: [https://wallet-waves.vercel.app](https://wallet-waves.vercel.app)

---

## Test Credentials

For testing purposes, you can use the following credentials:

- **Admin Phone**: `01779968369`
- **Admin Password**: `12345`

---

## Repository Links

- **Backend Repository**: [https://github.com/ZeroBug404/MFS-server](https://github.com/ZeroBug404/MFS-server)
- **Frontend Repository**: [https://github.com/ZeroBug404/MFS-client](https://github.com/ZeroBug404/MFS-client)

---

## Getting Started

### Installation

1. **Clone the repositories**:
   ```bash
   git clone https://github.com/ZeroBug404/MFS-server.git
   git clone https://github.com/ZeroBug404/MFS-client.git
   ```

## Setting Up Credentials

1. **Backend**:

   - Create a `.env` file in the root of the backend directory.
   - Add the following environment variables:
     `env
NODE_ENV=production
DATABASE_URL=
PORT=5000
DEFAULT_ADMIN_PASSWORD=admin123
BCRYPT_SALT_ROUNDS=10
JWT_SECRET=yourSuperSecretKey
JWT_REFRESH_SECRET=yourRefreshSecretKey
JWT_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_IN=30d`

2. **Database**:
   - Set up a MongoDB database (or your preferred database) and update the `DATABASE_URL` in the backend `.env` file.
