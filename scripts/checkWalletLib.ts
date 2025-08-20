import { JettonMinter } from '../wrappers/JettonMinter';
import { promptAddress, jettonWalletCodeFromLibrary } from "../wrappers/ui-utils";
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const minterAddress = await promptAddress("Enter the address of the jetton minter:", ui);

    const minter = provider.open(JettonMinter.createFromAddress(minterAddress));
    const rawWallet = await compile('JettonWallet', {buildLibrary: false});
    const walletLib = jettonWalletCodeFromLibrary(rawWallet);
    const expHash   = rawWallet.hash().toString('hex');

    const walletCode = (await minter.getJettonData()).walletCode;

    if(walletLib.equals(walletCode)) {
        console.log("Minter wallet code is library and matches the current source")
        return 0;
    }

    const isLibrary = walletCode.isExotic && walletCode.bits.length == 256 + 8 && walletCode.bits.substring(0, 8).toString() == '02';

    if(isLibrary) {
        console.log("Minter wallet code is not a library but doesn't match expected code cell");
        console.log("Expected code hash:", expHash);
        console.log("Got:", walletCode.bits.substring(8, walletCode.bits.length - 8).toString().toLowerCase());
    } else {
        console.log("Wallet code is not a library!");
        if(rawWallet.equals(walletCode)) {
            console.log("However the code hash matches");
        }
    }

    return -1;
}
