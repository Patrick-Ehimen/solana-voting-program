use anchor_lang::prelude::*;

declare_id!("FWjhpHmYAbQShp7SDaHt6Wz6bXBpPvVo4xqN1gjH2xTX");

#[program]
pub mod voting_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
