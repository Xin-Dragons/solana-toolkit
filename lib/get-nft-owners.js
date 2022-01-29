const getNftOwner = require('./get-nft-owner');

function getNftOwners(addresses, onProgress) {
  return Promise.all(
    addresses.map(async address => {
      const owner = await getNftOwner(address)

      onProgress && onProgress();
      
      return {
        mint: address,
        owner
      }
    })
  )
}

module.exports = getNftOwners;
