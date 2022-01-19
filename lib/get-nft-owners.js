const getNftOwner = require('./get-nft-owner');

function getNftOwners(addresses) {
  return Promise.all(
    addresses.map(async address => {
      const owner = await getNftOwner(address)
      return {
        mint: address,
        owner
      }
    })
  )
}

module.exports = getNftOwners;
