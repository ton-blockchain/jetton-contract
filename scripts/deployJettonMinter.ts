import {Cell, toNano} from '@ton/core';
import {JettonMinter} from '../wrappers/JettonMinter';
import {compile, NetworkProvider} from '@ton/blueprint';
import {promptUrl, promptUserFriendlyAddress} from "../wrappers/ui-utils";

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';

    const ui = provider.ui();

    const adminAddress = await promptUserFriendlyAddress("Enter the address of the jetton owner (admin):", ui, isTestnet);

    // e.g "https://bridge.ton.org/token/1/0x111111111117dC0aa78b770fA6A738034120C302.json"
    const jettonMetadataUri = await promptUrl("Enter jetton metadata uri (https://jettonowner.com/jetton.json)", ui)

    /*
    * Updatable wallet code
    *<{
    * 2 PUSHINT
    * NEWC // constructor of library cell
    * 8 STU // store 02 as library identifier to library cell constructor
    * -1024 PUSHINT CONFIGPARAM // X - is special index that is reserved for jetton code
    * DROP // Drop the status
    * CTOS // conver param to slice
    * 256 PUSHINT PLDUX SWAP // load 256 hash of the library
    * 256 STU // store hash to library cell constructor
    * 1 PUSHINT ENDXC // finalize library cell
    * CTOS // open cell (it transparently replaced with actual code loaded via library mechanism)
    * BLESS // convert slice to continuation (executable code)
    * EXECUTE // start to execute
    *}>c
    */

    const jettonWalletCode = Cell.fromBase64("te6cckEBAQEAHAAANHLIyweB/AD4MjDQgQEA1wMBy/9xzyPQ7R7YMIboiA==");


    const minter = provider.open(JettonMinter.createFromConfig({
            admin: adminAddress.address,
            wallet_code: jettonWalletCode,
            jetton_content: {uri: jettonMetadataUri}
        },
        await compile('JettonMinter')));

    await minter.sendDeploy(provider.sender(), toNano("0.5"));
}
