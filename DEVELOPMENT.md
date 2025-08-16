# Development

> ⚠️ **Disclaimer:**
> The information provided below is intended solely for developers. It is offered without any warranties, express or implied, and should be used at your own risk. Users are responsible for verifying the accuracy and applicability of the information in their specific context.

## Transaction expenses constants

TON Network has dynamically configurable costs of gas, message forwarding
and storage.
For a more detailed explanation refer to [fees documentation](https://docs.ton.org/v3/documentation/smart-contracts/transaction-fees/fees).

To address the dynamic nature of TON Network, contracts
in the current repository are nominating all of the
transaction expenses in dynamic units
such as gas units, cells and bits, instead of fixating expenses in TON.

Gas constants are calculated during unit tests and then
coded into `gas.fc` file.

### Overview of `gas.fc` constants

#### Storage constants

Here are the constants related to the storage of the contract state:

- `STORAGE_DURATION` Number of seconds of storage wallet contract has to have reserve for
- `JETTON_WALLET_BITS` Maximum(with jetton balance maxed out) number of total bits in wallet [AccountState](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L262-L268)
- `JETTON_WALLET_CELLS` Same metric, but for cells

#### Messages constants

These are the constants associated with message forwarding costs:

- `JETTON_WALLET_INITSTATE_BITS` Number of bits occupied by the wallet [StateInit](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L144-L146) structure
- `JETTON_WALLET_INITSTATE_CELLS` same as above, but for cells
- `BURN_NOTIFICATION_BITS` Bits occupied by the [burn_notification](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/contracts/jetton.tlb#L76-L81) message
- `BURN_NOTIFICATION_CELLS` Cells occupied by the [burn_notification](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/contracts/jetton.tlb#L76-L81) message

#### Gas constants

Refer to [transfer](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md#1-transfer) chapter
for understanding of transfer stages.

- `SEND_TRANSFER_GAS_CONSUMPTION` Gas units consumed during transfer operation
- `RECEIVE_TRANSFER_GAS_CONSUMPTION` Gas units consumed during internal transfer

Refer to
[burn](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md#2-burn)
chapter for understanding burn stages

- `SEND_BURN_GAS_CONSUMPTION` Gas units consumed on user wallet while processing burn transaction
- `RECEIVE_BURN_GAS_CONSUMPTION` Gas units consumed on jetton minter while processing burn notification 

## Testing Cycle

After any changes applied to the current code, in order to
test the added functionality, it is necessary to adjust gas constants.

### State changes

If any changes made to the contract state layout, follow this steps:

1. Run [StateInit](https://github.com/ton-blockchain/jetton-contract/blob/main/sandbox_tests/StateInit.spec.ts) test set.

2. Compare the console output of the test suite with the storage constants.

In case any changes necessary:

- Adjust constants in `gas.fc`
- Adjust storage constant is main test suite [walletStats](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/sandbox_tests/JettonWallet.spec.ts#L79) and [stateInitStats](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/sandbox_tests/JettonWallet.spec.ts#L83) accordingly

### Other code changes

Run the [main](https://github.com/ton-blockchain/jetton-contract/blob/main/sandbox_tests/JettonWallet.spec.ts) test suite
and compare the console output with the messages and gas constants.

Failure of the test suite should indicate necesserity of gas constants changes.

- Adjust message and gas constants in `gas.fc`
- Adjust send transfer gas [fee](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/sandbox_tests/JettonWallet.spec.ts#L752-L755) in tests
- Adjust transfer receive transfer gas [fee](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/sandbox_tests/JettonWallet.spec.ts#L763-L766) in tests.
- Adjust burn and burn notification [fees](https://github.com/ton-blockchain/jetton-contract/blob/3d24b419f2ce49c09abf6b8703998187fe358ec9/sandbox_tests/JettonWallet.spec.ts#L1035-L1040) in tests if necessary
- Re-run the test and expect no test failures

### Using current code without library

As mentioned in main [README](https://github.com/ton-blockchain/jetton-contract/tree/main), jetton wallet utilizes [library cell](https://docs.ton.org/v3/documentation/data-formats/tlb/library-cells#introduction)

If any changes made to the current wallet code, deploying additional libraries can be costly.
Therefore some developers might consider re-working the code to use regular code cell instead.

Note that storage and transfer costs in this case will **increase significantly**.

#### Diff example

When testing cycle applied, the resulting diff might look like this:

``` diff
diff --git a/contracts/gas.fc b/contracts/gas.fc
index a638e6c..75475e7 100644
--- a/contracts/gas.fc
+++ b/contracts/gas.fc
@@ -20,18 +20,18 @@ const MIN_STORAGE_DURATION = 5 * 365 * 24 * 3600; ;; 5 years
 ;;Get calculated in a separate test file [/sandbox_tests/StateInit.spec.ts](StateInit.spec.ts)
 
 ;;- `JETTON_WALLET_BITS` [/sandbox_tests/StateInit.spec.ts#L92](L92)
-const JETTON_WALLET_BITS  = 1033;
+const JETTON_WALLET_BITS  = 8211;
 
 ;;- `JETTON_WALLET_CELLS`: [/sandbox_tests/StateInit.spec.ts#L92](L92)
-const JETTON_WALLET_CELLS = 3;
+const JETTON_WALLET_CELLS = 17;
 
 ;; difference in JETTON_WALLET_BITS/JETTON_WALLET_INITSTATE_BITS is difference in
 ;; StateInit and AccountStorage (https://github.com/ton-blockchain/ton/blob/master/crypto/block/block.tlb)
 ;; we count bits as if balances are max possible
 ;;- `JETTON_WALLET_INITSTATE_BITS` [/sandbox_tests/StateInit.spec.ts#L95](L95)
-const JETTON_WALLET_INITSTATE_BITS  = 931;
+const JETTON_WALLET_INITSTATE_BITS  = 8109;
 ;;- `JETTON_WALLET_INITSTATE_CELLS` [/sandbox_tests/StateInit.spec.ts#L95](L95)
-const JETTON_WALLET_INITSTATE_CELLS = 3;
+const JETTON_WALLET_INITSTATE_CELLS = 17;
 
 ;; jetton-wallet.fc#L163 - maunal bits counting
 const BURN_NOTIFICATION_BITS = 754; ;; body = 32+64+124+(3+8+256)+(3+8+256)
@@ -44,13 +44,13 @@ const BURN_NOTIFICATION_CELLS = 1; ;; body always in ref
 ;;resulting gas consumption is printed to the console.
 
 ;;- `SEND_TRANSFER_GAS_CONSUMPTION` [/sandbox_tests/JettonWallet.spec.ts#L853](L853)
-const SEND_TRANSFER_GAS_CONSUMPTION    = 9255;
+const SEND_TRANSFER_GAS_CONSUMPTION    = 9161;
 
 ;;- `RECEIVE_TRANSFER_GAS_CONSUMPTION` [/sandbox_tests/JettonWallet.spec.ts#L862](L862)
-const RECEIVE_TRANSFER_GAS_CONSUMPTION = 10355;
+const RECEIVE_TRANSFER_GAS_CONSUMPTION = 10253;
 
 ;;- `SEND_BURN_GAS_CONSUMPTION` [/sandbox_tests/JettonWallet.spec.ts#L1154](L1154)
-const SEND_BURN_GAS_CONSUMPTION    = 5791;
+const SEND_BURN_GAS_CONSUMPTION    = 5681;
 
 ;;- `RECEIVE_BURN_GAS_CONSUMPTION` [/sandbox_tests/JettonWallet.spec.ts#L1155](L1155)
 const RECEIVE_BURN_GAS_CONSUMPTION = 6775;
diff --git a/sandbox_tests/JettonWallet.spec.ts b/sandbox_tests/JettonWallet.spec.ts
index b7b4c52..e92486a 100644
--- a/sandbox_tests/JettonWallet.spec.ts
+++ b/sandbox_tests/JettonWallet.spec.ts
@@ -86,12 +86,12 @@ describe('JettonWallet', () => {
         blockchain     = await Blockchain.create();
         deployer       = await blockchain.treasury('deployer');
         notDeployer    = await blockchain.treasury('notDeployer');
-        walletStats    = new StorageStats(1033, 3);
+        walletStats    = new StorageStats(8211, 17);
         msgPrices      = getMsgPrices(blockchain.config, 0);
         gasPrices      = getGasPrices(blockchain.config, 0);
         storagePrices  = getStoragePrices(blockchain.config);
         storageDuration= 5 * 365 * 24 * 3600;
-        stateInitStats = new StorageStats(931, 3);
+        stateInitStats = new StorageStats(8109, 17);
         defaultContent = {
                            uri: 'https://some_stablecoin.org/meta.json'
                        };
@@ -112,7 +112,7 @@ describe('JettonWallet', () => {
                    JettonMinter.createFromConfig(
                      {
                        admin: deployer.address,
-                       wallet_code: jwallet_code,
+                       wallet_code: jwallet_code_raw,
                        jetton_content: jettonContentToCell(defaultContent)
                      },
                      minter_code));
@@ -854,7 +854,7 @@ describe('JettonWallet', () => {
             success: true
         });
         send_gas_fee = printTxGasStats("Jetton transfer", transferTx);
-        send_gas_fee = computeGasFee(gasPrices, 9255n);
+        send_gas_fee = computeGasFee(gasPrices, 9161n);
 
         const receiveTx = findTransactionRequired(sendResult.transactions, {
             on: notDeployerJettonWallet.address,
@@ -863,7 +863,7 @@ describe('JettonWallet', () => {
             success: true
         });
         receive_gas_fee = printTxGasStats("Receive jetton", receiveTx);
-        receive_gas_fee = computeGasFee(gasPrices, 10355n);
+        receive_gas_fee = computeGasFee(gasPrices, 10253n);
 
         expect(await deployerJettonWallet.getJettonBalance()).toEqual(initialJettonBalance - sentAmount);
         expect(await notDeployerJettonWallet.getJettonBalance()).toEqual(initialJettonBalance2 + sentAmount);
@@ -1157,7 +1157,7 @@ describe('JettonWallet', () => {
         const burnTxs      = await testBurnFees(toNano('1'), deployer.address, burnAmount, 0, customPaylod);
         const actualSent   = printTxGasStats("Burn transaction", burnTxs[0]);
         const actualRecv   = printTxGasStats("Burn notification transaction", burnTxs[1]);
-        burn_gas_fee = computeGasFee(gasPrices, 5791n);
+        burn_gas_fee = computeGasFee(gasPrices, 5681n);
         burn_notification_fee = computeGasFee(gasPrices, 6775n);
         expect(burn_gas_fee).toBeGreaterThanOrEqual(actualSent);
         expect(burn_notification_fee).toBeGreaterThanOrEqual(actualRecv);
diff --git a/sandbox_tests/StateInit.spec.ts b/sandbox_tests/StateInit.spec.ts
index f514427..7e04f57 100644
--- a/sandbox_tests/StateInit.spec.ts
+++ b/sandbox_tests/StateInit.spec.ts
@@ -38,7 +38,7 @@ describe('State init tests', () => {
                    JettonMinter.createFromConfig(
                      {
                        admin: deployer.address,
-                       wallet_code: jwallet_code,
+                       wallet_code: jwallet_code_raw,
                        jetton_content: jettonContentToCell({uri: "https://ton.org/"})
                      },
                      minter_code));
@@ -73,7 +73,7 @@ describe('State init tests', () => {
         const res = await jettonMinter.sendMint(deployer.getSender(),
                                                 deployer.address,
                                                 maxValue,
-                                                null, null, null);
+                                                null, null, null, 0n, toNano('1'));
         expect(res.transactions).toHaveTransaction({
             on: deployerWallet.address,
             op: Op.internal_transfer,

```

## TON Libraries FAQ

### What are the libraries?

Refer to the [library cells documentation](https://docs.ton.org/v3/documentation/data-formats/tlb/library-cells)

### What are the benefits of using the library?

Using a library allows developers to access the contents of a data Cell through
its library cell.

If data is stored in contract state directly,
all the associated fees such as forward(during deployment) and storage
are paid individually on contract bases.

In case data is stored in a public library, it's contents
can be accessed by library cell,
which only contains (8-bit cell type and 256-bit data hash).
Therefore, storing and transferring data will be more cost-effective

For an example, see [this link](https://docs.ton.org/v3/documentation/data-formats/tlb/library-cells#using-library-cells-in-smart-contracts).

### How library is deployed?

Any contract can deploy a library using the `set_lib_code` [action](https://docs.ton.org/v3/documentation/data-formats/tlb/library-cells#publish-ordinary-cell-in-masterchain-library-context)

If action successful, library is added to the account [state](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L151),
and then if account resides in the masterchain, all of the masterchain accounts libraries are [merged](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/validator/impl/collator.cpp#L5447-L5458) into the global library [collection](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L427).

The caller account in this case, becomes the *Publisher account* in terms of [library description](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L435-L436).

### How to pay for library storage

When a library is published, it is still part of the account state,
so the number of it's cells and bits is added to the publishers account storage stats.
This means that publisher account takes library storage expenses as it's own.

### How to remove the library from the network

- Publisher account may call `set_lib_code` action with flag 0, removing itself from publishers
- Publisher account may send message in mode [32](https://docs.ton.org/v3/documentation/smart-contracts/message-management/message-modes-cookbook/#mode160), destroying its state.
- Publisher account may ran out of funds on balance, become frozen so it's code/data and libraries will be removed.

Common measure to ensure that the only removal reason possible would be
running out of funds, is to null account code and data right after
a successful library deployment.

### What if someone else tries to remove the library

Every library description stores a [dictionary](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/block.tlb#L435-L436) of publishers account addresses.
Library will be removed from the network only if there is [no more](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/validator/impl/collator.cpp#L5427-L5432) publishers left.

`set_lib_code` action may only remove the calling address from publishers dictionary if present.
So, no else account can remove library published by other account.

### What are the limitations of library cells

#### Publishers origin

Only contracts residing in the masterchain can make a library public.

Check is implemented in the [collator](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/validator/impl/collator.cpp#L5532).
It ensures that only the masterchain collator is going to perform public library
update, meaning that public libraries from basechain accounts will be ignored.

#### Library count per account

A single masterchain account may currently contain up to [256](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/mc-config.h#L402) libraries.

This check is implemented as [follows](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/transaction.cpp#L3225-L3226)

#### Data cell size

A library data cell may currently have up to 1000 child cells, according to [SizeLimitsConfig](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/mc-config.h#L397) and [following](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/transaction.cpp#L2319) check.

Keep in mind that account holds library dictionary, so account cells + bits including all of it's published
libraries should fit under general [account limits](https://github.com/ton-blockchain/ton/blob/cac968f77dfa5a14e63db40190bda549f0eaf746/crypto/block/mc-config.h#L400-L401)
