const getNftOwner = require('./get-nft-owner');
const Bottleneck = require('bottleneck/es5');

function getNftOwners(addresses, timeout, onProgress) {
  const limiter = new Bottleneck({
    minTime: timeout
  });

  async function getOwner(address) {
    const owner = await getNftOwner(address);
    onProgress && onProgress();
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
