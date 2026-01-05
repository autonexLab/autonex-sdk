use autonex_sdk_rust::{
    errors::AutonexError,
    intent::{ActionType, Intent},
    policy::Policy,
    validation::{enforce_protocol_allowlist, validate_intent, validate_policy},
};
use solana_program::pubkey::Pubkey;

#[test]
fn intent_validation_rejects_unsigned() {
    let agent = Pubkey::new_unique();
    let program = Pubkey::new_unique();
    let intent = Intent {
        agent_id: agent,
        action_type: ActionType::Generic,
        target_program: program,
        method: "do".to_string(),
        params_json: "{}".to_string(),
        constraints_json: "{}".to_string(),
        expiration_unix_ms: 10,
        nonce: "n".to_string(),
        signature: vec![],
    };

    let err = validate_intent(&intent, 0).unwrap_err();
    assert!(matches!(err, AutonexError::IntentUnsigned));
}

#[test]
fn intent_validation_rejects_expired() {
    let agent = Pubkey::new_unique();
    let program = Pubkey::new_unique();
    let intent = Intent {
        agent_id: agent,
        action_type: ActionType::Generic,
        target_program: program,
        method: "do".to_string(),
        params_json: "{}".to_string(),
        constraints_json: "{}".to_string(),
        expiration_unix_ms: 5,
        nonce: "n".to_string(),
        signature: vec![1, 2, 3],
    };

    let err = validate_intent(&intent, 10).unwrap_err();
    assert!(matches!(err, AutonexError::IntentExpired));
}

#[test]
fn policy_validation_requires_presence() {
    let err = validate_policy(None).unwrap_err();
    assert!(matches!(err, AutonexError::PolicyMissing));
}

#[test]
fn protocol_allowlist_enforced() {
    let allowed = Pubkey::new_unique();
    let disallowed = Pubkey::new_unique();

    let mut policy = Policy::default();
    policy.protocol_rules.allow_protocols = vec![allowed];
    policy.protocol_rules.allow_methods = vec!["swap".to_string()];

    enforce_protocol_allowlist(&policy, &disallowed, "swap").unwrap_err();
    enforce_protocol_allowlist(&policy, &allowed, "transfer").unwrap_err();
    enforce_protocol_allowlist(&policy, &allowed, "swap").unwrap();
}
