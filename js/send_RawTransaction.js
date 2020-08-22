web3.eth.getTransactionCount(this.address).then(txCount => {
        const txData = {
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(100000),
          gasPrice: web3.utils.toHex( YOUR_GAS_PRICE), // 10-15 gwei should be ok
          to: this.toAddress,
          from: this.address,
          value: web3.utils.toHex(
            web3.utils.toWei("0.0001", "ether")  // amount you want to send
          )
        };

       const transaction = new Tx(rawTx, { chain: "rinkeby" }); //transaction = new Tx(txData, {'chain':'mainnet'});
        transaction.sign(
          new Buffer(this.account.privateKey.substring(2), "hex")  // remove .substring(2) if you get errors
        );
        var self = this;
        web3.eth
          .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
          .on("transactionHash", function(txHash) {
            // show tx hash ?
          })
          .on("receipt", function(receipt) {
            console.log("receipt:" + receipt);
          })
          .on("confirmation", function(confirmationNumber, receipt) {
            if (confirmationNumber >= 1) {
              // message that tx went ok
            }
          })
          .on("error", function(error) {
            console.log("error sending ETH", error);
          });
      });

# FOR ERC20 -------__>

 web3.eth.getTransactionCount(this.address).then(nonce => {
        var contract = new web3.eth.Contract(
          erc20TokenABI,
          Constants.CONTRACT_ADDRESS
        );

        var tokenAmountFull = Number(this.amountTokens) * Math.pow(10, 18); // 18 decimals, hardcoded
        let data = contract.methods
          .transfer(this.toAddress, tokenAmountFull.toString())
          .encodeABI();
        let rawTx = {
          nonce: web3.utils.toHex(nonce),
          gasLimit: web3.utils.toHex(100000),
          gasPrice: web3.utils.toHex(YOUR_GAS_PRICE), // 10-15 gwei should do it
          to: Constants.CONTRACT_ADDRESS,
          value: "0x00",
          data: data
        };

        const transaction = new Tx(rawTx, { chain: "mainnet" }); //transaction = new Tx(txData, {'chain':'rinkeby'});
        transaction.sign(new Buffer(this.privateKey, "hex"));
        var self = this;
        web3.eth
          .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
          .on("transactionHash", function(txHash) {
            self.txHash = txHash;
          })
          .on("receipt", function(receipt) {
            console.log("receipt:" + receipt);
          })
          .on("confirmation", function(confirmationNumber, receipt) {
            if (confirmationNumber >= 1) {
              self.isTxConfirmed = true;
            }
          })
          .on("error", function(error) {
            console.log("error sending erc20 token", error);
            self.$toast.error("error sending token.");
          });
