# AUTONEX SDK Overview

AUTONEX is a Solana-native **intent-based execution** and **policy enforcement** SDK designed for autonomous agents.

Key properties:
- **No private key custody**: the SDK never stores keys.
- **Intent-first**: agents express desired actions as signed intents.
- **Policy-first**: every execution requires a policy, and policies are validated and enforced.
- **Simulation required**: execution always runs simulation first; skipping simulation is disallowed.
- **Deterministic receipts**: the SDK can decode receipts and verify deterministic fields.

This repo contains SDK code only (no UI, no app).
