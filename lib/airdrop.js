const fs = require('fs');
const { Connection, clusterApiUrl, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { omit, map, size, reduce, pick, get } = require('lodash');
const Bottleneck = require('bottleneck/es5');

const MAGIC_EDEN = 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp';

const connection = new Connection(process.env.RPC_HOST);

const SECRET_KEY = JSON.parse(fs.readFileSync(process.env.PATH_TO_SECRET_KEY).toString());
const secret = new Uint8Array(SECRET_KEY);
const fromWallet = Keypair.fromSecretKey(secret);

async function doAirdrop(snapshot, timeout = 20, numberOfTokens = 1, onProgress) {
  const input = omit(snapshot, MAGIC_EDEN);
  const errors = {};
  const signatures = {};

  const myMint = new PublicKey(process.env.TOKEN_ADDRESS);

  const myToken = new Token(
    connection,
    myMint,
    TOKEN_PROGRAM_ID,
    fromWallet
  );

  const fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(fromWallet.publicKey)

  async function drop(item, address) {
    if (typeof item === 'string') {
      address = item;
      item = {
        amount: 1
      }
    }
    try {
      const amount = item.amount * numberOfTokens;

      if (amount <= 0) {
        return;
      }

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
            amount * parseInt(process.env.ONE_TOKEN_PARTS, 10)
          )
        );
        // Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [fromWallet]
        );
        onProgress && onProgress();

        signatures[address] = {
          ...item,
          signature
        };
    } catch (err) {
      errors[address] = {
        ...item,
        error: err.message
      };
    }
  }

  const limiter = new Bottleneck({ minTime: timeout });

  const limited = limiter.wrap(drop);

  const promises = map(input, limited);

  return Promise.all(promises)
    .then(() => ({ errors, signatures }));
}

module.exports = doAirdrop;
