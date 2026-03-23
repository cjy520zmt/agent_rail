use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod agent_vault {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        policy_hash: [u8; 32],
        daily_limit: u64,
        per_tx_limit: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.bump = ctx.bumps.vault;
        vault.policy_hash = policy_hash;
        vault.daily_limit = daily_limit;
        vault.per_tx_limit = per_tx_limit;
        Ok(())
    }

    pub fn update_policy(
        ctx: Context<UpdatePolicy>,
        policy_hash: [u8; 32],
        daily_limit: u64,
        per_tx_limit: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.policy_hash = policy_hash;
        vault.daily_limit = daily_limit;
        vault.per_tx_limit = per_tx_limit;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
    pub policy_hash: [u8; 32],
    pub daily_limit: u64,
    pub per_tx_limit: u64,
}
