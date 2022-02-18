
class BatchTransferService {

  syncProvider = null;
  syncWallet = null;
  builder = null;

  constructor(syncProvider, syncWallet) {
    this.syncProvider = syncProvider;
    this.syncWallet = syncWallet;
  }

  setNewBuilder() {
    this.builer = this.syncWallet.batchBuilder();
  }

  sendWithdraw = async (withdraw = {}, feeToken) => {
    this.setNewBuilder();
    this.builder.addWithdraw(withdraw);
    return await this.submit(feeToken)
  }

  sendTransfer = async (transfer = {}, feeToken) => {
    this.setNewBuilder()
    this.builder.addTransfer(transfer);
    return await this.submit(feeToken)
  }

  submit = async (feeToken) => {
    const batch = this.builder.build(feeToken);
    return await this.syncProvider.submitTxsBatch(batch.txs, batch.signature);
  }
}

export default BatchTransferService
