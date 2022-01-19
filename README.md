# token-airdropper
Utility lib for taking snapshots and running airdrops

## installation

Clone repo, then run
```
$ npm install
```

## Preparation

* This lib expects you to have a json array file of all mints. This can be obtained using [https://www.sol-nft.tools/get-mints](https://www.sol-nft.tools/get-mints)
Enter the candy machine ID to download a json file of all mints

## Snapshot

To take a snapshot of all holders, run the following command

```
$ npm run snapshot ./mints.json [output.json]
```

output is optional, if it is omitted the snapshot will be saved with a timestamp name such as

```2022-01-19T12:07:01.274Z.json```

output can be a directory, if a directory is given rather than a full path, the file will be named with a timestamp.

## Airdrop

### Preparation

* Before using this library, you will need to have minted a token - There are many ways to do this, but I recommend using https://minting.dexlab.space/
* After the token is minted you will need to submit a PR to https://github.com/solana-labs/token-list to request the token meta is added.
* You will need to have a local wallet set up to send the token from - follow the guide here https://docs.solana.com/wallet-guide/file-system-wallet
* Using the dexlab interface, send the tokens to be airdropped to the file system wallet you just created, you'll also need to fund the wallet with some sol for transaction fees.

### Local env prop

* create a `.env` file in the root directory

```
$ touch .env
```

* The following environment variables should be added to the .env file:
```
PATH_TO_SECRET_KEY=relative/path/to/keypair.json
TOKEN_ADDRESS=YourTokenMintAddress
AIRDROP_AMOUNT=5000000
```

* `PATH_TO_SECRET_KEY` should be a relative path from your development directory to the wallet you generated before. If you followed the solana docs exaclty the file will be located at `~/my-solana-wallet/my-keypair.json`
* `TOKEN_ADDRESS` this is the token mint address which can be found from the dexlab minting interface
* `AIRDROP_AMOUNT` this is the amount of tokens to be airdropped. My example token here has 6 decimal places, so 5000000 is actually an airdrop amount of 5 tokens.  If you choose a different number of decimals when setting up your token you will need to adjust this number accordingly.

### Run airdrop

Once you are ready to run the airdrop you can use the following command

```
$ npm run airdrop snapshot[.json]
```

The snapshot here can either be a single json snapshot file as generated earlier, or it can also be a directory of snapshots in the same format, where they will be aggregated and send to each wallet as a single transaction.

Due to Solana network latency, often transactions are unsucessful, or fail to confirm. After the above command is run, a new file `airdrop-fails.json` will be generated in the project root.

To re-run failed transactions, you can run the airdrop again but point to the newly created `airdrop-fails.json` file:

```
$ npm run airdrop ./airdrop-fails.json
```

## CAVEATS

`airdrop-fails.json` contains all transactions that could not be confirmed - this doesn't mean they all failed. To prevent duplicate drops, any failed transactions will currently need to be checked manually, to check the tokens were not dropped before running it again.

I hope to add a programmatic solution to this problem soon - perhaps a new command to run after the airdrop command to check the transaction ids, and remove any from fails which were successful.
