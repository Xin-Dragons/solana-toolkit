const { PublicKey, Connection } = require('@solana/web3.js');
const { get } = require('lodash');
const connection = new Connection(process.env.RPC_HOST);

async function getNftOwner(address) {

  try {
    const largestAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(address)
    );

    const largestAccountInfo = await connection.getParsedAccountInfo(
      largestAccounts.value[0].address
    );

    return largestAccountInfo.value.data.parsed.info.owner
  } catch (err) {
    const owner = await getNftOwner(address);
    return owner;
  }
}

module.exports = getNftOwner;
