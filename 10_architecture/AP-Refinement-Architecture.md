# AP Tracking Refinement Architecture

**Version:** 1.0
**Date:** 2026-04-02
**Based on:** TASK-AP-Refinement-Formal-20260402.md

## Overview
This refinement focuses on testing, debugging, local model integration, and delivery for AP Tracking, with absolute no public net access. All model calls use local Xiaomi MIMO on server #3.

## Key Principles
- No public net calls: Disable all external APIs, telemetry, etc.
- Local model only: Xiaomi MIMO on 42.192.56.101.
- Testing: Comprehensive, local, regression included.
- 5-Point Rate: Incentive-based for last-month sprint.

## Access Structure
- Main: https://samuraiguan.cloud
- API: https://samuraiguan.cloud/api
- Admin: https://samuraiguan.cloud/admin

## Data Layer
- Isolated DB with tables for auth, business, AI logs.

## Model Integration
- Local endpoint for MIMO.
- No external keys or calls.

## Testing Framework
- Local tools for API testing, DB verification.
- Regression after every fix.

