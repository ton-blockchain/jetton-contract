# TON Jetton (Fungible Token)

Reference implementation of Jetton (fungible token) smart contract for TON.

# Details

- Admin of jetton can change jetton-minter code and it's full data.

__⚠️ It is critically important for issuer to carefully manage the admin's account private key to avoid any potential risks of being hacked. It is highly recommend to use multi-signature wallet as admin account with private keys stored on different air-gapped hosts / hardware wallets.__

__⚠️ The contract does not check the code and data on `upgrade` message, so it is possible to brick the contract if you send invalid data or code. Therefore you should always check the upgrade in the testnet.__

# Local Development

## Install Dependencies

`npm install`

## Compile Contracts

`npm run build`

## Run Tests

`npm run test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

use Toncenter API:

`npx blueprint run --custom https://testnet.toncenter.com/api/v2/ --custom-version v2 --custom-type testnet --custom-key <API_KEY> `

API_KEY can be obtained on https://toncenter.com or https://testnet.toncenter.com

## Deployment

> ⚠️ **Important notice:**
> The jetton wallet in this project makes use of [library cell](https://docs.ton.org/v3/documentation/data-formats/tlb/library-cells#introduction) for code storage.
> And execution guarantee is **ONLY** valid if wallet is deployed as library.
> If deployed otherwise, execution guarantee is a matter of current network configuration.

Library deployment reduces the cont of the wallet storage and
deployment stage, as the code
cell in [StateInit](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L144) is represented by it's hash instead of full content.

However, certain conditions must be satisfied for this to work:

- The library has to be deployed on the network.
- Jetton minter must have wallet code as a library cell to utilize it.

### Library deployment

The library for the current code is already deployed by the TON Core team.

This means that if no modifications applied to the current code, developers can utilize publicly available library
without needing to deploy a new one.

If **ANY** changes are made to the jetton-wallet code, or source files it [includes](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/contracts/jetton-wallet.fc#L5-L9)
developer has two options:

- Deploy a new library to the network
- Re-calculate [gas constants](https://github.com/ton-blockchain/jetton-contract/blob/jetton-2.0/contracts/gas.fc) for usage without library cell

In order to deploy a library to the network, [librarian](https://github.com/ton-blockchain/jetton-contract/blob/jetton-2.0/contracts/helpers/librarian.func) contract is used
along with [deployLibrary](https://github.com/ton-blockchain/jetton-contract/blob/jetton-2.0/scripts/deployLibrary.ts) script.

The current default library [storage duration](https://github.com/ton-blockchain/jetton-contract/blob/2bc7d1ae70be383c05529e907fd7f6193cff8918/contracts/helpers/librarian.func#L5) is set to 100 years and would cost roughly about **700 TON** depending on the resulting code size.

Developers are free to change the duration directly in the librarian contract,
however, it is crucial to understand the implications of library expiry.

If library cell storage expires, the wallet code becomes inaccessible,
meaning wallets will not be able
to process any further transactions.
Therefore, it is the developer responsibility to deploy the library for
a reasonable time period and monitor it's expiration date.

To extend the library storage, top-up the previous librarian address or repeat the library deployment procedure.

### Deploying Minter with library wallet code

In current repository setup minter is deployed with library wallet
code automatically by the deployMinter script.
However, some developers may use the contract code in a
different environment, so it's important to
ensure that the minter wallet code configuration is valid.

Process of deploying minter with wallet code as library is fairly straightforward:

1. Get library cell from the ordinary code cell
2. Pass it as a wallet code to your minter constructor
3. Deploy the minter

For the first step, refer [this](https://docs.ton.org/v3/documentation/data-formats/tlb/library-cells#store-data-in-a-library-cell)
chapter of documentation, which illustrates how to accomplish this
using `@ton/ton` or Fift language.
Use the provided examples to adapt it to the environment of choice.

### Check deployment validity

In order to determine if library has been deployed successfully:

1. Find your librarian contract address in the explorer of choice
2. Check that account status is active and balance is positive. If deployment failed, contract should return all incoming value to the sender
3. Check that account code and data are set empty cell `x{}` or `96a296d224f285c67bee93c30f8a309157f0daa35dc5b87e410b78630a09cfc7` in hash view
4. Take your **RAW** code hash, and pass it in upper case to [get_lib](https://dton.io/graphql/#query=%7B%0A%20%20get_lib(lib_hash%3A%20%22346250C205F56ACFB6AFA6FE7B76550805D256C6D8E47DD4F94FF672B47D19D3%22)%0A%7D)
5. `get_lib` result should be non-empty

> ⚠️ **Important notice**
Before performing any token mint, it is highly recommended
to perform wallet code check right after the minter deployment,
regardless of the deployment environment

In order to do so, run
`npx blueprint run checkWalletLib`

### Re-calculating gas constants of library-less deployment

Please refer to [DEVELOPMENT.md](https://github.com/ton-blockchain/jetton-contract/blob/jetton-2.0/DEVELOPMENT.md) for the information on gas constats.

## Notes

- The jetton-wallet contract does not include functionality that allows the owner to withdraw Toncoin funds from jetton-wallet Toncoin balance.

- The contract prices gas based on the *current* blockchain configuration. 
   It is worth keeping in mind the situation when the configuration has changed at the moment when the message goes from one jetton-wallet to another.
   Reducing fees in a blockchain configuration does not require additional actions.
   However, increasing fees in a blockchain configuration requires preliminary preparation - e.g. wallets and services must start sending Toncoins for gas in advance based on future parameters.

## Version History

This is a fork of https://github.com/ton-blockchain/stablecoin-contract but with removed governance functionality.
