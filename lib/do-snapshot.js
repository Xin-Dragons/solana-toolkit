const path = require('path');
const fs = require('fs');
const getNftOwners = require('./get-nft-owners');

async function doSnapshot(addresses, timeout = 50, onProgress, rpc, headers) {
  const owners = await getNftOwners(addresses, timeout, onProgress, rpc, headers);

  return owners.reduce((snapshot, item) => {
    const obj = snapshot[item.owner];
    if (!obj) {
      return {
        ...snapshot,
        [item.owner]: {
          amount: 1,
          mints: [
            item.mint
          ]
        }
      }
    }

    obj.mints.push(item.mint)
    obj.amount++;

    return {
      ...snapshot,
      [item.owner]: obj
    };

  }, {});
}

module.exports = doSnapshot;
