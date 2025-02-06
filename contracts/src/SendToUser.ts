import {
  Field,
  state,
  State,
  method,
  UInt64,
  PrivateKey,
  SmartContract,
  Mina,
  AccountUpdate,
  Bool,
  PublicKey,
  DeployArgs,
  Permissions,
  UInt32
} from 'o1js';

export class SendToUser extends SmartContract {
  async deploy(props?: DeployArgs) {
    await super.deploy(props)
    
    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    })
  }


  @method
  async sendToUser(sender: PublicKey, receiver: PublicKey) {

    let senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({ to: receiver, amount: new UInt64(0.1*10e9)});

  }


}
