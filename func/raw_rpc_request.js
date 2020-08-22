web3.currentProvider.sendAsync({
  jsonrpc: “2.0”, 
  method: “evm_increaseTime”,
  params: [60], 
  id: new Date().getTime() /
}, function(err) {
  // < more >
});
