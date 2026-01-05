use thiserror::Error;

#[derive(Debug, Error)]
pub enum AutonexError {
    #[error("intent is unsigned")]
    IntentUnsigned,
    #[error("intent is expired")]
    IntentExpired,
    #[error("policy missing")]
    PolicyMissing,
    #[error("target program not allowlisted")]
    TargetProgramNotAllowed,
    #[error("method not allowlisted")]
    MethodNotAllowed,
}
