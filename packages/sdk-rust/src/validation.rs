use solana_program::pubkey::Pubkey;

use crate::{
    errors::AutonexError,
    intent::Intent,
    policy::Policy,
};

pub fn validate_intent(intent: &Intent, now_unix_ms: i64) -> Result<(), AutonexError> {
    if intent.signature.is_empty() {
        return Err(AutonexError::IntentUnsigned);
    }

    if intent.expiration_unix_ms <= now_unix_ms {
        return Err(AutonexError::IntentExpired);
    }

    Ok(())
}

pub fn validate_policy(policy: Option<&Policy>) -> Result<&Policy, AutonexError> {
    let policy = policy.ok_or(AutonexError::PolicyMissing)?;

    if policy.protocol_rules.allow_protocols.is_empty() {
        return Err(AutonexError::TargetProgramNotAllowed);
    }

    Ok(policy)
}

pub fn enforce_protocol_allowlist(
    policy: &Policy,
    target_program: &Pubkey,
    method: &str,
) -> Result<(), AutonexError> {
    if !policy
        .protocol_rules
        .allow_protocols
        .iter()
        .any(|p| p == target_program)
    {
        return Err(AutonexError::TargetProgramNotAllowed);
    }

    if !policy.protocol_rules.allow_methods.is_empty()
        && !policy.protocol_rules.allow_methods.iter().any(|m| m == method)
    {
        return Err(AutonexError::MethodNotAllowed);
    }

    Ok(())
}
