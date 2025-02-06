import { Mina, PublicKey, fetchAccount, UInt64 } from 'o1js';
import * as Comlink from "comlink";
import type { SendToUser } from '../../contracts/src/SendToUser';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const state = {
  AddInstance: null as null | typeof SendToUser,
  zkappInstance: null as null | SendToUser,
  transaction: null as null | Transaction,
};

export const api = {
  async setActiveInstanceToDevnet() {
    const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
    console.log('Devnet network instance configured');
    Mina.setActiveInstance(Network);
  },
  async loadContract() {
    const { SendToUser } = await import('../../contracts/build/src/SendToUser.js');
    state.AddInstance = SendToUser;
  },
  async compileContract() {
    await state.AddInstance!.compile();
  },
  async fetchAccount(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    return fetchAccount({ publicKey });
  },
  async initZkappInstance(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    state.zkappInstance = new state.AddInstance!(publicKey);
  },
  async getNum() {
    // const currentNum = await state.zkappInstance!.num.get();
    // return JSON.stringify(currentNum.toJSON());
  },
  async createUpdateTransaction(senderPublicKey58: string, receriverPublicKey58: string) {
    const sender = PublicKey.fromBase58(senderPublicKey58);
    const receiver = PublicKey.fromBase58(receriverPublicKey58);

    // state.transaction = await Mina.transaction(async () => { // error
    //   // await state.zkappInstance!.update();
    //   await state.zkappInstance!.sendToUser(sender, receiver);
    // });

    state.transaction = await Mina.transaction(sender, async () => { // ok
      // await state.zkappInstance!.update();
      await state.zkappInstance!.sendToUser(sender, receiver);
    });
  }, 
  async proveUpdateTransaction() {
    await state.transaction!.prove();
  },
  async getTransactionJSON() {
    return state.transaction!.toJSON();
  },
};

// Expose the API to be used by the main thread
Comlink.expose(api);
