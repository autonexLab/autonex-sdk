use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize, Default)]
pub struct FinancialRules {
    pub max_tx_amount: Option<u64>,
    pub daily_limit: Option<u64>,
    pub max_slippage_bps: Option<u16>,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize, Default)]
pub struct TimeRules {
    pub start_hour_utc: Option<u8>,
    pub end_hour_utc: Option<u8>,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize, Default)]
pub struct ProtocolRules {
    pub allow_protocols: Vec<Pubkey>,
    pub allow_methods: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize, Default)]
pub struct RiskRules {
    pub max_risk_score: Option<u16>,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize, Default)]
pub struct Policy {
    pub financial_rules: FinancialRules,
    pub time_rules: TimeRules,
    pub protocol_rules: ProtocolRules,
    pub risk_rules: RiskRules,
}
