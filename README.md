# token-airdropper
Utility lib for taking Solana NFT snapshots and running token airdrops, checking token holders etc

## Installation

Clone repo, then run
```
$ npm install
```

## Preparation

This lib expects you to have a json array file of all mints. This can be obtained using [https://www.sol-nft.tools/get-mints](https://www.sol-nft.tools/get-mints)
Enter the candy machine ID to download a json file of all mints

## Snapshot

To take a snapshot of all holders, run the following command

```
$ npm run snapshot -- -i ./mints.json -o ./output.json -t 100
```

### Options
* `--input, -i`: mints.json (required)
* `--output, -o`: output file (optional)
* `--timeout, -t`: time to wait in ms (optional, default 50)

output is optional, if it is omitted the snapshot will be saved with a timestamp name such as

```2022-01-19T12:07:01.274Z.json```

output can be a directory, if a directory is given rather than a full path, the file will written to the give directory and named with a timestamp as above.

timeout is default 50ms - is you get 412 errors, increase this number to 100, or 200

## Get token holders

Utility to get all holders of the provided token, an optional output json file can be specified

```
$ npm run get-token-holders -- -a FBdRvc9CmHUf8ib2sV8PDv2oiFAmyxoftjid3Uv9e4kK -o token-holders.json
```

### Options
* `--address, -a`: token address (required)
* `--output, -o`: output file (optional)

## Get NFT holder

Utility to get holder of an NFT

```
& npm run get-nft-holder -- -a 6gPcytnZyNvcWqJ1oUQBXS8hdEB1L3fgqidrVy388qwV
```

### Options

* `--address, -a`: NFT mint address (required)

## airdrop

Docs coming soon...