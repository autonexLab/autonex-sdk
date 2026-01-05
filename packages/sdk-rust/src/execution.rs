use borsh::{BorshDeserialize, BorshSerialize};
use sha2::{Digest, Sha256};
use solana_program::pubkey::Pubkey;

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub enum ExecutionStatus {
    Success,
    Rejected,
    Failed,
}

#[derive(Clone, Debug, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct ExecutionReceipt {
    pub execution_hash: [u8; 32],
    pub agent_id: Pubkey,
    pub policy_hash: [u8; 32],
    pub timestamp_unix_ms: i64,
    pub status: ExecutionStatus,
    pub error: Option<String>,
}

impl ExecutionReceipt {
    pub fn compute_execution_hash(
        agent_id: &Pubkey,
        policy_hash: &[u8; 32],
        timestamp_unix_ms: i64,
        status: &ExecutionStatus,
        error: &Option<String>,
    ) -> [u8; 32] {
        let mut hasher = Sha256::new();
        hasher.update(agent_id.to_bytes());
        hasher.update(policy_hash);
        hasher.update(timestamp_unix_ms.to_le_bytes());
        hasher.update(match status {
            ExecutionStatus::Success => [0u8],
            ExecutionStatus::Rejected => [1u8],
            ExecutionStatus::Failed => [2u8],
        });
        if let Some(e) = error {
            hasher.update(e.as_bytes());
        }
        hasher.finalize().into()
    }

    pub fn verify_deterministic_fields(&self) -> bool {
        let expected = Self::compute_execution_hash(
            &self.agent_id,
            &self.policy_hash,
            self.timestamp_unix_ms,
            &self.status,
            &self.error,
        );
        expected == self.execution_hash
    }
}
