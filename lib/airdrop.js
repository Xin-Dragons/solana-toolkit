const path = require('path')
const fs = require('fs');
const { Connection, clusterApiUrl, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { omit, map, size, reduce, pick, get } = require('lodash');
const Bottleneck = require('bottleneck/es5');

const limiter = new Bottleneck({ minTime: 200 });

const MAGIC_EDEN = ['GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp', '1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix'];

function getKeypair(filepath) {
  return Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(fs.readFileSync(path.resolve(filepath)).toString())
    )
  );
}

async function doAirdrop({ tokenMint, snapshot, onProgress, keypair, feePayer, decimals = 9 }) {
  const connection = new Connection('https://ssc-dao.genesysgo.net/');

  const fromWallet = getKeypair(keypair)

  const feePayerWallet = feePayer
    ? getKeypair(feePayer)
    : fromWallet

  const errors = [];
  const signatures = [];

  const mint = new PublicKey(tokenMint);

  const token = new Token(
    connection,
    mint,
    TOKEN_PROGRAM_ID,
    fromWallet
  );

  const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(fromWallet.publicKey)

  async function drop({ address, amount }) {
    try {
      const amountToDrop = Math.ceil(amount * Math.pow(10, decimals))
      if (amount <= 0) {
        return;
      }

      const toWallet = new PublicKey(address);

      const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(toWallet)

      // const associatedDestinationTokenAddr = await Token.getAssociatedTokenAddress(
      //   token.associatedProgramId,
      //   token.programId,
      //   mint,
      //   toWallet
      // );
      // const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);
      //
      // const instructions = [];
      //
      // if (receiverAccount === null) {
      //   instructions.push(
      //     Token.createAssociatedTokenAccountInstruction(
      //       token.associatedProgramId,
      //       token.programId,
      //       mint,
      //       associatedDestinationTokenAddr,
      //       toWallet,
      //       fromWallet.publicKey
      //     )
      //   )
      // }
      const instructions = [];
      instructions.push(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          fromTokenAccount.address,
          toTokenAccount.address,
          fromWallet.publicKey,
          [],
          amountToDrop
        )
      );


      const transaction = new Transaction().add(...instructions);

      // transaction.feePayer = feePayerWallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Sign transaction, broadcast, and confirm
      // const signature = connection.simulateTransaction(transaction, [fromWallet])
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet]
      );
      onProgress && onProgress();
        //
      signatures.push({
        address,
        amount,
        signature
      });
    } catch (err) {
      console.log(err)
      errors.push({
        address,
        amount,
        error: err.message
      })
    }
  }

  const limited = limiter.wrap(drop);

  const promises = snapshot.filter(item => item.amount > 0).map(limited);

  return Promise.all(promises)
    .then(() => ({ errors, signatures }));
}

module.exports = doAirdrop;
