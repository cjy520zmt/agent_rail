import * as anchor from '@coral-xyz/anchor';

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  console.log('AgentVault test scaffold loaded.');
  console.log('Provider wallet:', provider.wallet.publicKey.toBase58());
  console.log('TODO: add initializeVault integration test once program ID is assigned.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
