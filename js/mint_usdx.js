// source: https://gist.github.com/ravidsrk/841370461a06173e6d1b580ab0c09ae9
const _ = require("lodash");
const BnbApiClient = require("@binance-chain/javascript-sdk");
const kava = require("@kava-labs/javascript-sdk");
const bnbCrypto = BnbApiClient.crypto;
const KavaClient = kava.KavaClient;
const kavaUtils = kava.utils;

const BINANCE_CHAIN_API_TESTNET = "https://testnet-dex.binance.org";
const BINANCE_CHAIN_DEPUTY = "tbnb1et8vmd0dgvswjnyaf73ez8ye0jehc8a7t7fljv";
const bnbAddress = "your binance chain testnet address";
const bnbMnemonic = "secret words that unlock your address";

const KAVA_API_TESTNET = "http://kava-testnet-5000.kava.io:1317";
const KAVA_DEPUTY = "kava1aphsdnz5hu2t5ty2au6znprug5kx3zpy6zwq29";
const kavaAddress = "your kava testnet-5000 address";
const kavaMnemonic = "secret words that unlock your address"

const BNB_CONVERSION_FACTOR = 10 ** 8;
const USDX_CONVERSION_FACTOR = 10 ** 6;

var main = async () => {
  // -------------------------------------------------------------------------------
  //                       Binance Chain blockchain interaction
  // -------------------------------------------------------------------------------
  // Start Binance Chain client
  const bnbClient = await new BnbApiClient(BINANCE_CHAIN_API_TESTNET);
  bnbClient.chooseNetwork("testnet");
  const privateKey = bnbCrypto.getPrivateKeyFromMnemonic(bnbMnemonic);
  bnbClient.setPrivateKey(privateKey);
  await bnbClient.initChain();

  // Assets involved in the swap
  const asset = "BNB";
  const amount = 2 * BNB_CONVERSION_FACTOR;

  // Addresses involved in the swap
  const sender = bnbAddress; // user's address on Binance Chain
  const recipient = BINANCE_CHAIN_DEPUTY; // deputy's address on Binance Chain
  const senderOtherChain = KAVA_DEPUTY; // deputy's address on Kava
  const recipientOtherChain = kavaAddress; // user's address on Kava

  // Format asset/amount parameters as tokens, expectedIncome
  const tokens = [
    {
      denom: asset,
      amount: amount
    }
  ];
  const expectedIncome = [String(amount), ":", asset].join("");

  // Number of blocks that swap will be active
  const heightSpan = 10001;

  // Generate random number hash from timestamp and hex-encoded random number
  const randomNumber = kavaUtils.generateRandomNumber();
  const timestamp = Math.floor(Date.now() / 1000);
  const randomNumberHash = kavaUtils.calculateRandomNumberHash(
    randomNumber,
    timestamp
  );
  console.log("Secret random number:", randomNumber);

  // Send create swap tx using Binance Chain client
  const res = await bnbClient.swap.HTLT(
    sender,
    recipient,
    recipientOtherChain,
    senderOtherChain,
    randomNumberHash,
    timestamp,
    tokens,
    expectedIncome,
    heightSpan,
    true
  );

  if (res && res.status == 200) {
    console.log(
      "Create swap tx hash (Binance Chain): ",
      res.result[0].hash,
      "\n"
    );
  } else {
    console.log("Tx error:", res);
    return;
  }

  // Wait for deputy to see the new swap on Binance Chain and relay it to Kava
  await sleep(30000); // 30 seconds

  // -------------------------------------------------------------------------------
  //                           Kava blockchain interaction
  // -------------------------------------------------------------------------------

  // Start new Kava client
  kavaClient = new KavaClient(KAVA_API_TESTNET);
  kavaClient.setWallet(kavaMnemonic);
  await kavaClient.initChain();

  // Calculate the expected swap ID on Kava
  const expectedKavaSwapID = kavaUtils.calculateSwapID(
    randomNumberHash,
    senderOtherChain,
    sender
  );

  // Send claim swap tx using Kava client
  const txHashClaim = await kavaClient.claimSwap(
    expectedKavaSwapID,
    randomNumber
  );
  console.log("Claim swap tx hash (Kava): ".concat(txHashClaim));

  // Get account balance
  let account = await kavaClient.getAccount(kavaClient.wallet.address);
  console.log("Address:", _.get(account, "value.address"));
  console.log("Balances:", _.get(account, "value.coins"), "\n");

  await sleep(7000); // 7 seconds (1 block)

  // Get minimum principal amount required for CDP creation
  const paramsCDP = await kavaClient.getParamsCDP();
  const debtParams = _.get(paramsCDP, "debt_params");
  const principalAmount = Number(
    debtParams.find(coin => coin.denom == "usdx").debt_floor
  );
  console.log("Minimum principal:", principalAmount + "usdx");

  // Calculate collateral required for this principal amount
  const bnbValuation = await kavaClient.getPrice("bnb:usd");
  const equivalentCollateral =
    Number(principalAmount) / Number(bnbValuation.price);
  // Minimum collateralization ratio is 200%, we'll do 210%
  const rawRequiredAmount = equivalentCollateral * 2.1;
  const adjustedAmount =
    (rawRequiredAmount / USDX_CONVERSION_FACTOR) * BNB_CONVERSION_FACTOR;
  const collateralAmount = adjustedAmount.toFixed(0);
  console.log("Required collateral:", collateralAmount + "bnb");

  // Confirm that our account has sufficient funds
  try {
    account = await kavaClient.getAccount(kavaClient.wallet.address);
    const coins = _.get(account, "value.coins");
    const bnbBalance = coins.find(coin => coin.denom == "bnb").amount;
    if (bnbBalance < collateralAmount) {
      throw {
        message: "Account only has " + bnbBalance + "bnb"
      };
    }
  } catch (err) {
    console.log("Error:", err.message);
    return;
  }

  // Load principal, collateral as formatted coins
  const principal = kavaUtils.formatCoins(Number(principalAmount), "usdx");
  const collateral = kavaUtils.formatCoins(Number(collateralAmount), "bnb");

  // Send create CDP tx using Kava client
  const txHashCDP = await kavaClient.createCDP(principal, collateral);
  console.log("Create CDP tx hash (Kava): ".concat(txHashCDP));

  // Get account balance
  account = await kavaClient.getAccount(kavaClient.wallet.address);
  console.log("Address:", _.get(account, "value.address"));
  console.log("Balances:", _.get(account, "value.coins"), "\n");
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
