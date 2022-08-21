const { PublicKey, Connection } = require('@solana/web3.js');
const { get } = require('lodash');

async function getNftOwner(address) {
  const connection = new Connection(process.env.RPC_HOST);

  const largestAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(address)
  );

  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccounts.value[0].address
  );

  return largestAccountInfo.value.data.parsed.info.owner
}

module.exports = getNftOwner;
