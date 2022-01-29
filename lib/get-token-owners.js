const { PublicKey, Connection } = require('@solana/web3.js');
const { get } = require('lodash');

const connection = new Connection('https://ssc-dao.genesysgo.net/');

const TOKEN_PUBKEY = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

async function getTokenOwners(address) {
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
    const factor = parseInt(process.env.ONE_TOKEN_PARTS, 10)
    const amountString = get(token, 'account.data.parsed.info.tokenAmount.amount')
    const amount = parseInt(amountString, 10) / factor;

    return {
      address,
      amount
    }
  }).sort((a, b) => b.amount - a.amount);
}

module.exports = getTokenOwners;
