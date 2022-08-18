const express = require('express');
const { DigiByteService} = require('bitcore-Rohit');
const digiByteService = new DigiByteService();
const router = express.Router();
router.get('/BTC', (req, res) => {
  try {
    const wallet = DigiByteService.getNewWallet();
    res.json(wallet);
  } catch (error) {
    res.json({ error: error?.message });
  }
})

router.get('/BCH', (req, res) => {
  try {
    const wallet = DigiByteService.getWallet();
    res.json(wallet);
  } catch (error) {
    res.json({ error: error?.message });
  }
})
router.post('/ke', (req, res) => {
  try {
    const wallet = DigiByteService.getac();
    res.json({ wallet });
  } catch (error) {
    res.json({ error: error?.message });
  }
});
router.post('/balance', async (req, res) => {
  try {
    const { address } = req.body;
    const balance = await digiByteService.getWalletBalance(address);
    res.json({
      balance,
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});
router.post('/key', async (req, res) => {
  try {
    const { address } = req.body;
    const balance = await digiByteService.getkey(address);
    res.json({
      balance,
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});
router.post('/seed', async (req, res) => {
  try {
    const { phrase } = req.body;
    var No = "You can import your this wallet by Safepal wallet app from playstore"
    const wallet = await digiByteService.getseed(phrase);
    res.json({
      wallet,
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});
router.post('/depositBTC', async (req, res) => {
  try {
    const {
      address, my_address, privateKey,
    amount,} = req.body;
    const balance = await digiByteService.getWalletBalance(my_address);
    const result = await digiByteService.deposit(address, my_address, privateKey,amount);
    res.json({
      ...result,balance
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});
router.post('/depositBCH', async (req, res) => {
  try {
    const {
      address, my_address, privateKey,
    amount,} = req.body;
    const balance = await digiByteService.getWalletBalanceLTC(my_address);
    const result = await digiByteService.depositLTC(address, my_address, privateKey,amount);
    res.json({
      ...result,balance
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});

router.post('/sendBCH', async (req, res) => {
  try {
    const {
      address, my_address, privateKey, amount,
    } = req.body;
    const result = await digiByteService.sendLTC(address, my_address, privateKey, amount);
    res.json({
      ...result
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});


router.post('/sendBTC', async (req, res) => {
  try {
    const {
      address, my_address, privateKey, amount,
    } = req.body;
    const balance = await digiByteService.getWalletBalance(my_address);
    const result = await digiByteService.sendTransaction(address, my_address, privateKey, amount);
    res.json({
      ...result, balance
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});

router.post('/tx', async (req, res) => {
  try {
    const { address } = req.body;
    const transactions = await digiByteService.getIncommingTransactions(address);
    res.json({
      transactions,
    });
  } catch (error) {
    res.json({ error: error?.message });
  }
});

module.exports = router;
