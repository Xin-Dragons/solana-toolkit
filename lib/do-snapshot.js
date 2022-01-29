const path = require('path');
const fs = require('fs');
const getNftOwners = require('./get-nft-owners');

async function doSnapshot(addresses, onProgress) {
  const owners = await getNftOwners(addresses, onProgress);

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
