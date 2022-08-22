const getNftOwner = require('./get-nft-owner');
const Bottleneck = require('bottleneck/es5');
const { chunk, flatten } = require('lodash');

function getNftOwners(addresses, timeout, onProgress) {
  const limiter = new Bottleneck({
    minTime: timeout
  });

  const chunks = chunk(addresses, 100);

  async function getOwner(ads) {
    const owners = await getNftOwner(ads);
    onProgress && onProgress(owners.length);
    return owners;
  }

  const limited = limiter.wrap(getOwner)

  const allTasks = chunks.map(limited);
  return Promise.all(allTasks).then(flatten)

}

module.exports = getNftOwners;
