import {
  Field,
  Mina,
  UInt32,
  UInt64,
  PrivateKey,
  PublicKey,
  fetchAccount,
  AccountUpdate} from 'o1js';
// import { getProfiler } from '../others/utils/profiler.js';
import { SendToUser } from "./SendToUser.js";


// 在项目入口文件顶部导入
import * as dotenv from 'dotenv';
dotenv.config();
// 读取环境变量
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not defined in .env file');
}
// console.log("PRIVATE_KEY, " + PRIVATE_KEY);



// const SimpleProfiler = getProfiler('Simple zkApp');
// SimpleProfiler.start('Simple zkApp test flow');

const doProofs = true;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// 编译合约

if (doProofs) {
  await SendToUser.compile();
} else {
  await SendToUser.analyzeMethods();
}

// a test account that pays all the fees, and puts additional funds into the zkapp
let [sender, receiver] = Local.testAccounts;// 

console.log()
console.log('initial sender balance: ' + Mina.getBalance(sender));



// the zkapp account
let zkappAccount = Mina.TestPublicKey.random();
let zkapp = new SendToUser(zkappAccount);

console.log()
console.log('deploy');
let tx = await Mina.transaction({
  sender,
  fee: 0.1 * 10e9,
  memo: '一笔交易',
  // nonce: 2
}, async () => {
  AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
  zkapp.deploy();// 部署前设置合约初始状态
});
await tx.prove();
await tx.sign([sender.key, zkappAccount.key]).send();

// console.log(tx.toPretty());

// await fetchAccount({publicKey: zkappAccount});// !!!必须
// console.log('initial num: ' + zkapp.num.get());
console.log('sender balance: ' + Mina.getBalance(sender));
console.log('receiver balance: ' + Mina.getBalance(receiver));

// let account = Mina.getAccount(zkappAccount);
// console.log(JSON.stringify(account));


console.log()
console.log('send to existing account ...');

tx = await Mina.transaction(sender, async () => {
  await zkapp.sendToUser(sender, receiver);
  });
await tx.prove();
await tx.sign([sender.key]).send();

console.log('update balance...')
console.log('sender balance: ' + Mina.getBalance(sender));
console.log('receiver balance: ' + Mina.getBalance(receiver));



// for new account
console.log()
console.log('send to new account ...');
tx = await Mina.transaction(sender, async () => {
  AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
  await zkapp.sendToUser(sender, PublicKey.fromBase58('B62qjGBP4G9FgsVR9vbBKazRinkqEvofJChbXqUp37vh5Re4BWoBhtf'));
});

await tx.prove();
await tx.sign([sender.key]).send();

// console.log('update num ...');
// const newX = zkapp.num.get();
// console.log('latest state: ' + newX);
// console.log('sender balance: ' + Mina.getBalance(sender));
// console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);

console.log('update balance...')
console.log('sender balance: ' + Mina.getBalance(sender));
console.log('receiver balance: ' + Mina.getBalance(receiver));
console.log('new receiver balance: ' + Mina.getBalance(PublicKey.fromBase58('B62qjGBP4G9FgsVR9vbBKazRinkqEvofJChbXqUp37vh5Re4BWoBhtf')));

// SimpleProfiler.stop().store();