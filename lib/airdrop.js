const fs = require('fs');
const { Connection, clusterApiUrl, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { omit, map, size, reduce, pick } = require('lodash');

const MAGIC_EDEN = 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp';

// connection to mainnet-beta, use devnet for testing.
const connection = new Connection('https://ssc-dao.genesysgo.net/');

// relative path to your local wallet keypair
const SECRET_KEY = JSON.parse(fs.readFileSync(process.env.PATH_TO_SECRET_KEY).toString());
const secret = new Uint8Array(SECRET_KEY);
const fromWallet = Keypair.fromSecretKey(secret);

async function doAirdrop(snapshot) {
  const input = omit(snapshot, MAGIC_EDEN);
  const errs = {};

  const myMint = new PublicKey(process.env.TOKEN_ADDRESS);

  const myToken = new Token(
    connection,
    myMint,
    TOKEN_PROGRAM_ID,
    fromWallet
  );

  const fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(fromWallet.publicKey)

  return Promise.all(
    map(input, (item, address) => {
      const amount = item.amount * parseInt(process.env.AIRDROP_AMOUNT, 10);
      return Promise.resolve()
        .then(async () => {
          const toWallet = new PublicKey(address);
          const toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(toWallet)

          const transaction = new Transaction()
            .add(
              Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                fromTokenAccount.address,
                toTokenAccount.address,
                fromWallet.publicKey,
                [],
                amount
              )
            );
            // Sign transaction, broadcast, and confirm
            const signature = await sendAndConfirmTransaction(
              connection,
              transaction,
              [fromWallet]
            );
            console.log("SIGNATURE", signature);
            console.log("SUCCESS");
        })
        .catch(err => {
          console.log(err.message);
          errs[address] = item;
        })
    })
  )
    .then(() => errs)
}

module.exports = doAirdrop;
