const getNftOwner = require('./get-nft-owner');
const Bottleneck = require('bottleneck/es5');

const limiter = new Bottleneck({
  minTime: 20
});

function getNftOwners(addresses, onProgress) {

  async function getOwner(address) {
    const owner = await getNftOwner(address);
    onProgress();
    return {
      mint: address,
      owner
    }
  }

  const limited = limiter.wrap(getOwner)

  const allTasks = addresses.map(limited);
  return Promise.all(allTasks)
}

module.exports = getNftOwners;
