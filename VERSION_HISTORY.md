# In short

Currently, the most widespread jettons on the network are:

- jetton-1.2 - NOT and subsequent popular projects.

- jeton-1.05M - as it is used in minter.ton.org.

# History

## mintless-jetton-1.0 (HMSTR)

jetton-1.2 with "mintless" functionality.

## jetton-1.2 (NOT) also known as basecoin or notcoin-contract

Stablecoin code but with removed governance functionality.

## stablecoin (USDT)

Significantly revised jetton-1.07 https://github.com/ton-blockchain/token-contract with governance functionality.

## jetton-1.07 - 17.01.2023

Jetton-wallet:

Improved calculation of the required TON amount for gas for transfer and burn: increased `gas_consumption` constant from 0.01 TON to 0.015 TON.

Previously, it was required to attach **less** TONs than necessary.

## jetton-1.06 - 28.11.2022

Jetton-minter:

Improved calculation of the required TON amount for gas for `provide_wallet_address`: `fwd_fee = in_msg.fwd_fee` -> `fwd_fee = muldiv(in_msg.fwd_fee, 3, 2)`.

Previously, it was required to attach **less** TONs than necessary.

## minter.ton.org launched - 27.11.2022

https://t.me/toncoin/656

# jetton-1.05M - 24.11.2022

Version jetton-1.05 used in minter.ton.org by the Orbs team.

This is discoverable jetton-minter 1.05 and jetton-wallet 1.05 using the FunC 0.2.0 new syntax: imports, pragma version, const. The rest of the files do not use the new syntax. There are no other differences.

## jetton-1.05 - 23.11.2022

Jetton-wallet:

Improved calculation of the required TON amount for gas for transfer and burn: `fwd_fee = in_msg.fwd_fee` -> `fwd_fee = muldiv(in_msg.fwd_fee, 3, 2)`.

Previously, it was required to attach **less** TONs than necessary.

## Launched first DEXes on TON - DeDust and Ston.fi - 19.11.2022

https://t.me/toncoin/651

# jetton-1.04M - 12.10.2022

Version jetton-1.04 used in minter.ton.org by the Orbs team.

This is discoverable jetton-minter 1.04 and jetton-wallet 1.04 using the FunC 0.2.0 new syntax: imports, pragma version, const. The rest of the files do not use the new syntax. There are no other differences.

## jetton-1.04 - 23.09.2022

Jetton-minter:

Introduced "Discoverable" jetton-minter.

# jetton-1.03M - 13.07.2022 

Version jetton-1.03 used in minter.ton.org by the Orbs team.

This is jetton-minter 1.03 and jetton-wallet 1.03 using the FunC 0.2.0 new syntax: imports, pragma version, const. The rest of the files do not use the new syntax. There are no other differences.

## jetton-1.03 - 12.07.2022

Jetton-wallet:

Added additional check for transfer message correctness: `throw_unless(708, slice_bits(in_msg_body) >= 1);`.

Previously, it was possible to send a transfer without `either_forward_payload` bit, which formally does not comply with the standard.

# jetton-1.02M - 07.07.2022

Version jetton-1.02 used in minter.ton.org by the Orbs team.

This is jetton-minter 1.02 and jetton-wallet 1.02 using the FunC 0.2.0 new syntax: imports, pragma version, const. The rest of the files do not use the new syntax. There are no other differences.

## jetton-1.02 - 04.07.2022

Jetton-wallet:

`transfer_notification` previously sent in bounceable mode, now sent in non-bounceable mode because the recipient can be noninitialized.

# Jetton deployer launched - 29.06.2022

https://t.me/toncoin/473

It was later moved to minter.ton.org.

# jetton-1.01M - 16.06.2022

Version jetton-1.01 used in minter.ton.org by the Orbs team.

This is jetton-minter 1.01 and jetton-wallet 1.01 using the FunC 0.2.0 new syntax: imports, pragma version, const. The rest of the files do not use the new syntax. There are no other differences.

## First ICO on TON - KOTE memecoin 18.04.2022

## jetton-1.01 - 18.04.2022

Jetton-minter:

1) Introduced Change Content and Change Admin functionality to jetton-minter.

Jetton-wallet:

2) `burn` message previously sent to the jetton-minter in non-bounceable mode, not sent in bounceable mode.

    Now, in case of an error of burn processing on jetton-minter, the message will bounce back and the token amount be added to the token balance on jetton-wallet.


3) Improved calculation of the required TON amount for gas for transfer.
   Previously, it was required to attach **more** TONs than necessary.


4) Changed the algorithm for leaving TONs for storage fee on jetton-wallet and sending the excess. 

## Jetton 1.00 - 31.03.2022 

First Release: https://t.me/tonblockchain/112.