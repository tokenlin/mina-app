import {
  Field,
  PrivateKey,
  PublicKey,
  Mina,
  UInt64,
  UInt32,
  AccountUpdate,
  fetchAccount
} from 'o1js';
// import { getProfiler } from '../utils/profiler.js';
// import { VerySimpleZkapp } from './task3.js';

// import { getProfiler } from '../others/utils/profiler.js';
import { SendToUser } from "./SendToUser.js";


// const SimpleProfiler = getProfiler('Simple zkApp');
// SimpleProfiler.start('Simple zkApp test flow');

// Network configuration
const network = Mina.Network({
  mina:'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);





// 在项目入口文件顶部导入
import * as dotenv from 'dotenv';
dotenv.config();
// 读取环境变量
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const PRIVATE_KEY_ZKAPP = process.env.PRIVATE_KEY_ZKAPP;

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not defined in .env file');
}


// Fee payer setup
const senderKey = PrivateKey.fromBase58(PRIVATE_KEY);
const sender = senderKey.toPublicKey();
// console.log(`Funding the fee payer account.`);
// await Mina.faucet(sender);// 领水



console.log(`Fetching the fee payer account information.`);
const senderAcct = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcct.account;
console.log(
  `Using the fee payer account ${sender.toBase58()} with nonce: ${
    accountDetails?.nonce
  } and balance: ${accountDetails?.balance}.`
);
console.log('');

// 编译合约
console.log('compile');
console.time('compile');
await SendToUser.compile();
console.timeEnd('compile');

// the zkapp account

// let zkappKey = PrivateKey.random();  // 需要保存好合约账户的私钥！
// const zkappKey = PrivateKey.fromBase58(PRIVATE_KEY_ZKAPP);
const zkappKey = PrivateKey.fromBase58("EKFABdyo8ewqxVGjtiprum6BvouN9UTZX5SjxXNZPAPQPGBhBYfB");  // 2025.02.06

let zkappAccount = zkappKey.toPublicKey();

let zkapp = new SendToUser(zkappAccount);

// zkappAccount privatekey: EKFABdyo8ewqxVGjtiprum6BvouN9UTZX5SjxXNZPAPQPGBhBYfB
// zkappAccount publickey: B62qmPj1miPyg9SPgUZjLgLMLnVj4SXKbLgs1cRNPW99UENuphB4zQP

console.log("zkappAccount privatekey: " + zkappKey.toBase58());
console.log("zkappAccount publickey: " + zkappAccount.toBase58());
console.log("PrivateKey.fromBase58(): " + PrivateKey.fromBase58(zkappKey.toBase58()).toBase58());




// random generate
console.log();
console.log('random generate');
let zkappKey_R = PrivateKey.random();
let zkappAccount_R = zkappKey_R.toPublicKey();// 需要保存好合约账户的私钥！
console.log("zkappKey_R privatekey: " + zkappKey_R.toBase58());
console.log("zkappAccount_R publickey: " + zkappAccount_R.toBase58());

let existingAddressStr = 'B62qn7ovWWzfiFvcY6Y7iwu8Z7apb7LJdZCzKUrcqpfoSCvw68pCQa3';
let newAddress = zkappAccount_R;







// console.log();
// console.log('deploy...');
// let tx = await Mina.transaction({
//   sender,
//   fee: 0.1 * 10e9,
//   memo: 'deploy',
//   // nonce: 2
// }, async () => {
//   AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
//   zkapp.deploy();// 部署前设置合约初始状态
// });
// await tx.prove();
// await tx.sign([senderKey, zkappKey]).send().wait();


// await fetchAccount({publicKey: sender});// !!!必须
// console.log('sender balance: ' + Mina.getBalance(sender));





// console.log('receiver balance: ' + Mina.getBalance(receiver));

// await fetchAccount({publicKey: zkappAccount});// !!!必须
// console.log('initial receivedAmount: ' + zkapp.num.get());
// await fetchAccount({publicKey: sender});// !!!必须







console.log();
console.log('send to existing account ...');
console.log('before...')
await fetchAccount({publicKey: PublicKey.fromBase58(existingAddressStr)});// !!!必须
await fetchAccount({publicKey: sender});// !!!必须
console.log('sender balance: ' + Mina.getBalance(sender));
console.log('existingAddress balance: ' + Mina.getBalance(PublicKey.fromBase58(existingAddressStr)));
let tx = await Mina.transaction({
  sender,
  fee: 0.01 * 10e9,
  // memo: 'update 1',
  // nonce: 2
}, async () => {
  await zkapp.sendToUser(sender, PublicKey.fromBase58(existingAddressStr));
});
await tx.prove();
await tx.sign([senderKey]).send().wait();

console.log('after...')
await fetchAccount({publicKey: PublicKey.fromBase58(existingAddressStr)});// !!!必须
await fetchAccount({publicKey: sender});// !!!必须
console.log('sender balance: ' + Mina.getBalance(sender));
console.log('existingAddress balance: ' + Mina.getBalance(PublicKey.fromBase58(existingAddressStr)));





// console.log();
// console.log('send to new account ...');
// console.log('before...')
// // await fetchAccount({publicKey: newAddress});// !!!必须
// await fetchAccount({publicKey: sender});// !!!必须
// console.log('sender balance: ' + Mina.getBalance(sender));
// // console.log('newAddress balance: ' + Mina.getBalance(newAddress));
// let tx = await Mina.transaction({
//   sender,
//   fee: 0.1 * 10e9,
//   // memo: 'update 1',
//   // nonce: 2
// }, async () => {
//   AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
//   await zkapp.sendToUser(sender, newAddress);
// });
// await tx.prove();
// await tx.sign([senderKey]).send().wait();

// console.log('after...')
// await fetchAccount({publicKey: newAddress});// !!!必须
// await fetchAccount({publicKey: sender});// !!!必须
// console.log('sender balance: ' + Mina.getBalance(sender));
// console.log('newAddress balance: ' + Mina.getBalance(newAddress));



// SimpleProfiler.stop().store();
