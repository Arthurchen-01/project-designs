# AP Final Delivery Architecture

## Version
- Date: 2026-04-02
- Based on: AP-final-delivery-directive-20260402.md

## Overview
The AP Tracking system is a web-based application for tracking user progress in learning or tasks, with features for registration, submissions, queries, and AI analysis using a strictly local setup. All components must enforce no public network access, using only local resources on machine 3.

## Key Principles
- **Air-Gapped Operations**: No calls to public APIs, models, or services. All model inferences use local MIMO on machine 3.
- **Security**: Encrypted storage, no keys in code/repo, audit logging.
- **Incentive Mechanism**: 5-point rate system to encourage consistent progress without being overly punitive.

## Components
1. **Frontend**
   - Web UI for user interactions.
   - Connects to Backend via local API (https://samuraiguan.cloud/api).
   - Handles registration, login, form submissions, data queries.

2. **Backend**
   - API server (e.g., Node.js/Express or similar).
   - Handles authentication, business logic, database interactions, local model calls.
   - Endpoints: /api/register, /api/login, /api/submit, /api/query, etc.
   - Runs on machine 3 at IP 42.192.56.101.

3. **Database**
   - Local database (e.g., SQLite, PostgreSQL) on machine 3.
   - Stores users, submissions, progress data, 5-point rates.
   - Schema: Users (id, username, hashed_password), Submissions (user_id, date, content, score, etc.).

4. **Local AI Model (MIMO)**
   - Deployed on machine 3.
   - Used for analyzing submissions (e.g., quality assessment for 5-point rate).
   - Called internally via local API or direct integration, no external network.

5. **Admin Backend**
   - Management interface at https://samuraiguan.cloud/admin.
   - For administrative tasks, auditing.

## Data Flow
1. User → Frontend → Backend API (local HTTPS).
2. Backend → Database (local connection).
3. Backend → Local MIMO (local call) for analysis.
4. Responses flow back locally.
5. All logs and errors handled locally, no external telemetry.

## 5-Point Rate Mechanism
- Calculates progress incentive based on submission consistency and quality.
- Rules: Positive tilt for 2-3 consecutive good submissions; decay for inactivity; explainable changes.
- Integrated in Backend logic, stored in Database.

## Deployment
- Machine 3: Hosts all services.
- Domain: samuraiguan.cloud
- Services: Configured to restart on boot, local logging.

## Risks and Mitigations
- Network Leakage: Code audit to remove any external dependencies.
- Data Consistency: Transactional database operations.
- Failure Handling: Graceful degradation if model/database unavailable.

This architecture ensures compliance with the directive's no-public-net rules and focuses on deliverable stability.
