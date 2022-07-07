class BatchTransferService {
  #syncProvider = null;
  #syncWallet = null;
  #builder = null;

  constructor(syncProvider, syncWallet) {
    this.#syncProvider = syncProvider;
    this.#syncWallet = syncWallet;
  }

  #setNewBuilder() {
    this.#builder = this.#syncWallet.batchBuilder();
  }

  #submit = async (feeToken) => {
    const batch = await this.#builder.build(feeToken);
    return await this.#syncProvider.submitTxsBatch(batch.txs, batch.signature);
  };

  sendWithdraw = async (withdraw = {}, feeToken) => {
    this.#setNewBuilder();
    this.#builder.addWithdraw(withdraw);
    return await this.#submit(feeToken);
  };

  sendTransfer = async (transfer = {}, feeToken) => {
    this.#setNewBuilder();
    this.#builder.addTransfer(transfer);
    return await this.#submit(feeToken);
  };
}

export default BatchTransferService;
