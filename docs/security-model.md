# Security Model

## Trust boundaries
- The SDK **does not custody keys** and does not auto-sign.
- The SDK enforces local validation and policy constraints.
- On-chain enforcement is assumed to exist in the AUTONEX program; receipts are decoded for auditability.

## Mandatory rejections
- Unsigned intents
- Expired intents
- Unknown or non-allowlisted `targetProgram`
- Missing policy
- Method not allowed by policy

## Simulation requirement
Execution always performs simulation prior to submission. The execution API does not provide a way to bypass simulation.

## Audit considerations
- Deterministic hashing of intents and policies
- Deterministic receipt decoding and verification of stable fields
- Explicit error types and rejection reasons
