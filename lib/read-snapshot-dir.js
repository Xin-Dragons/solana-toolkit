const fs = require('fs');
const path = require('path');

function readSnapshotDir(snapshot) {
  const filenames = fs.readdirSync(snapshot);

  return filenames.reduce((all, filename) => {
    const day = JSON.parse(fs.readFileSync(path.resolve(`${snapshot}/${filename}`)).toString());
    Object.keys(day).forEach(address => {
      const amount = (address in all)
        ? all[address].amount + day[address].amount
        : day[address].amount;

      all[address] = all[address] || {};
      all[address].amount = amount;
    });
    return all;
  }, {});
}

module.exports = readSnapshotDir;
