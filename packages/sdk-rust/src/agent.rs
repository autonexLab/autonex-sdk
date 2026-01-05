use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub enum AgentStatus {
    Active,
    Paused,
    Revoked,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct Agent {
    pub agent_id: Pubkey,
    pub role: String,
    pub permissions: Vec<String>,
    pub status: AgentStatus,
}
