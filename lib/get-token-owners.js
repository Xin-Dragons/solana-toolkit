const { PublicKey, Connection } = require('@solana/web3.js');
const { get } = require('lodash');

async function getTokenOwners(address, decimals = 9) {
  const connection = new Connection(process.env.RPC_HOST);

  const TOKEN_PUBKEY = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );

  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: address,
      },
    },
    {
      dataSize: 165,
    }
  ];
  const programAccountsConfig = {
    filters,
    encoding: 'jsonParsed'
  };
  const listOfTokens = await connection.getParsedProgramAccounts(
    TOKEN_PUBKEY,
    programAccountsConfig
  );

  return listOfTokens.map(token => {
    const address = get(token, 'account.data.parsed.info.owner');
    const amountString = get(token, 'account.data.parsed.info.tokenAmount.amount')
    const amount = parseInt(amountString, 10) / Math.pow(10, decimals);

    console.log()

    return {
      address,
      amount
    }
  }).sort((a, b) => b.amount - a.amount);
}

module.exports = getTokenOwners;
