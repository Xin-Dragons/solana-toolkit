# token-airdropper
Utility lib for taking Solana NFT snapshots and running token airdrops, checking token holders etc

## installation

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
$ npm run snapshot -- -s ./mints.json -o ./output.json
```

output is optional, if it is omitted the snapshot will be saved with a timestamp name such as

```2022-01-19T12:07:01.274Z.json```

output can be a directory, if a directory is given rather than a full path, the file will written to the give directory and named with a timestamp as above.

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

## Airdrop

### Preparation

* Before using this library, you will need to have minted a token - There are many ways to do this, but I recommend using https://minting.dexlab.space/
* After the token is minted you will need to submit a PR to https://github.com/solana-labs/token-list to request the token meta is added.
* You will need to have a local wallet set up to send the token from - follow the guide here https://docs.solana.com/wallet-guide/file-system-wallet
* Using the dexlab interface, send the tokens to be airdropped to the file system wallet you just created, you'll also need to fund the wallet with some sol for transaction fees.

### Local env variables

* create a `.env` file in the root directory

```
$ touch .env
```

* The following environment variables should be added to the .env file:
```
PATH_TO_SECRET_KEY=relative/path/to/keypair.json
TOKEN_ADDRESS=YourTokenMintAddress
AIRDROP_AMOUNT=5000000
RPC_HOST=https://api.mainnet-beta.solana.com
ONE_TOKEN_PARTS=1000000
```

* `PATH_TO_SECRET_KEY`: should be a relative path from your development directory to the wallet you generated before. If you followed the solana docs exaclty the file will be located at `~/my-solana-wallet/my-keypair.json`
* `TOKEN_ADDRESS`: this is the token mint address which can be found from the dexlab minting interface
* `AIRDROP_AMOUNT`: this is the amount of tokens to be airdropped. My example token here has 6 decimal places, so 5000000 is actually an airdrop amount of 5 tokens.  If you choose a different number of decimals when setting up your token you will need to adjust this number accordingly.
* `RPC_HOST`: the solana RPC endpoint to use, eg: https://api.mainnet-beta.solana.com for mainnet, https://api.devnet.solana.com for devnet (these are rate limited so recommend using a private RPC)
* `ONE_TOKEN_PARTS`: the factor to multiply by to get one full token (set when creating the token, this example has 6 0's);

### Run airdrop

Once you are ready to run the airdrop you can use the following command

```
$ npm run airdrop -- -s snapshot.json -t timeout --a 70
```

#### Options
* `--snapshot, -s`: snapshot json file (required)
* `--timeout, -t`: timeout in ms (optional)
* `--amount, -a`: amount of (whole) tokens to drop (optional, defaults to 1)

**IMPORTANT** - timeout is optional, but if you are using the public RPC endpoint, requests are rate limited, so it is highly recommended to set this to a low number (such as `1`), this will force the requests to be run sequentially rather than in parallel.

eg.

```
$ npm run airdrop -- -s ./snapshot.json -t 1
```

The snapshot here can either be a single json snapshot file as generated earlier, or it can also be a directory of snapshots in the same format, where they will be aggregated and sent to each wallet as a single transaction.

Due to Solana network latency, often transactions are unsuccessful, or fail to confirm. If this is the case a new file `airdrop-fails.json` will be generated in the project root.

To re-run failed transactions, you can run the airdrop again but point to the newly created `./error-logs/{timestamp}.json` file:

```
$ npm run airdrop -- -s ./error-logs/2022-01-19T12:07:01.274Z.json
```

## CAVEATS

`airdrop-fails.json` contains all transactions that could not be confirmed - this doesn't mean they all failed. To prevent duplicate drops, any failed transactions will currently need to be checked manually, to check the tokens were not dropped before running it again.

I hope to add a programmatic solution to this problem soon - perhaps a new command to run after the airdrop command to check the transaction ids, and remove any from fails which were successful.
