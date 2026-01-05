# Policy Engine

Policies are required for execution and define constraints across multiple dimensions:

- **Financial rules**: max per-tx amount, daily limits, slippage
- **Time rules**: time windows, cooldowns
- **Protocol rules**: allowlisted target programs and methods
- **Risk rules**: application-defined risk thresholds

Policy enforcement model:
1. Validate policy shape
2. Validate intent shape
3. Enforce protocol/method allowlists (prevents arbitrary CPI targets)
4. Enforce financial/time/risk constraints

A policy must be present for simulation and execution.
