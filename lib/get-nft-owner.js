const { PublicKey, Connection } = require('@solana/web3.js');
const { get } = require('lodash');
const axios = require('axios');
const bs58 = require('bs58')

async function getNftOwner(addresses, rpc = process.env.RPC_HOST, extraHeaders = {}) {
  try {
    const headers = Object.assign({
      'Content-Type': 'application/json'
    }, extraHeaders);
    
    const data = addresses.map(address => {
      return {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "getTokenLargestAccounts",
        "params": [
          address,
          {
            commitment: 'finalized',
          }
        ]
      }
    })

    const res = await axios.post(rpc, data, { headers })

    const accounts = res.data.map((item, i) => {
      if (!item.result) {
        return null;
      }
      if (item.result.value[0] && item.result.value[0].uiAmount === 1) {
        return {
          account: item.result.value[0].address,
          address: addresses[i]
        }
      } else {
        return null
      }
    }).filter(Boolean)

    const mutlipleAccData = {
      "jsonrpc": "2.0",
      "id": 3,
      "method": "getMultipleAccounts",
      "params": [
        accounts.map(a => a.account),
        {
          commitment: 'finalized',
          encoding: 'jsonParsed'
        }
      ]
    }

    const info = await axios.post(rpc, mutlipleAccData, { headers })
    const infos = info.data.result.value;

    return infos.map((item, i) => {
      return {
        mint: accounts[i].address,
        owner: item.data.parsed.info.owner
      }
    });
  } catch (err) {
    console.log(err)
    return getNftOwner(addresses);
  }
}

module.exports = getNftOwner;
