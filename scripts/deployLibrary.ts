import {Librarian} from '../wrappers/Librarian';
import {compile, NetworkProvider, sleep} from '@ton/blueprint';
import {promptToncoin} from "../wrappers/ui-utils";
import { Cell } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    ui.write("This jetton contract uses the jetton-wallet code from library. This reduces network fees when operating with the jetton.");
    ui.write("Librarian is the contract that stores the library.");
    ui.write("If someone is already storing this jetton-wallet library on the blockchain - you don't need to deploy librarian.");
    const jettonWalletCodeRaw = await compile('JettonWallet');
    const librarianCode = await compile('Librarian');

    const tonAmount = await promptToncoin("Enter Toncoin amount to deploy librarian. Some of Toncoins will reserved on the contract to pay storage fees. Excess will be returned.", ui);
    const librarian = provider.open(Librarian.createFromConfig({code: jettonWalletCodeRaw}, librarianCode));
    const stateBefore = await librarian.getState();
    const lastLt = stateBefore.last?.lt ?? 0n;
    let emptyCell = new Cell();
    if(stateBefore.state.type == 'active') {
        if(stateBefore.state.code && stateBefore.state.data) {
            const codeCell = Cell.fromBoc(stateBefore.state.code)[0];
            const dataCell = Cell.fromBoc(stateBefore.state.data)[0];
            if(codeCell.equals(emptyCell) && dataCell.equals(emptyCell)) {
                ui.write("Library is already deployed, contract is bricked.");
                return -1;
            }
        }
    }

    await librarian.sendDeploy(provider.sender(), tonAmount);

    ui.write(`Librarian at: ${librarian.address.toString()}`);
    ui.write("Waiting for the library to deploy...");

    let retryCount = 60;

    do {
        await sleep(2000);
        const curState = await librarian.getState();
        const curLt = curState.last?.lt ?? 0n;

        if(curState.state.type == 'active' && curLt > lastLt) {
            const codeCell = Cell.fromBoc(curState.state.code!)[0];
            const dataCell = Cell.fromBoc(curState.state.data!)[0];

            if(codeCell.equals(emptyCell) && dataCell.equals(emptyCell)) {
                ui.write("Library deployed successfully!");
                return 0;
            } else {
                ui.write("Funds were not accepted, check that amount is enough to cover the storage period in full");
                return -1;
            }
        }
    } while(retryCount--);

    console.error("Transaction didn't show up on account during 2 minutes, something went wrong");
    return -1;
}
