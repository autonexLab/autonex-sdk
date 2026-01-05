use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub enum ActionType {
    Swap,
    Transfer,
    Stake,
    Vote,
    Generic,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct Intent {
    pub agent_id: Pubkey,
    pub action_type: ActionType,
    pub target_program: Pubkey,
    pub method: String,
    pub params_json: String,
    pub constraints_json: String,
    pub expiration_unix_ms: i64,
    pub nonce: String,
    pub signature: Vec<u8>,
}
