const { PublicKey, Connection } = require('@solana/web3.js');
const { get } = require('lodash');

const connection = new Connection('https://ssc-dao.genesysgo.net/');

const TOKEN_PUBKEY = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

async function getNftOwner(address) {
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

  const found = listOfTokens.find(token => {
    const amount = get(token, 'account.data.parsed.info.tokenAmount.amount');
    return amount === 1 || amount === '1';
  });

  return get(found, 'account.data.parsed.info.owner')
}

module.exports = getNftOwner;
