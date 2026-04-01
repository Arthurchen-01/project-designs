# AP Deployment Architecture

## Overview
This document outlines the architecture for deploying the AP Tracking backend on Machine 3 in an air-gapped environment, ensuring no public network access. The deployment includes backend services, data layer, authentication, admin backend, reverse proxy, and documentation.

## Key Principles
- **Air-Gapped Operation**: All components must function without internet access. Dependencies are pre-installed or bundled locally.
- **Security**: Strict isolation, local-only access.
- **Components**:
  - **Backend**: Node.js/Express (assumed; adjust based on code).
  - **Data Layer**: Local database (e.g., SQLite or PostgreSQL on local host).
  - **Authentication & Permissions**: JWT or local auth mechanism.
  - **Admin Backend**: Basic web interface for management.
  - **Access Entry**: Local URL or entry point.
  - **Reverse Proxy**: Nginx or similar for routing.
  - **Documentation**: Deployment and operation guides.

## High-Level Diagram
[Text-based diagram]
Machine 3 (Isolated):
- Reverse Proxy -> Backend Service -> Database
- Admin Interface -> Backend

## Deployment Flow
1. Machine setup and verification.
2. Software installation (local packages).
3. Code deployment.
4. Configuration of each component.
5. Testing and documentation.

All operations enforce no-public-net rules.