require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pi = require('./pi');
const supabase = require('./supabase');

const app = express();

app.use(cors());
app.use(express.json());

// Example: Check user by Pi username
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json(data);
});

// Pi payment webhook callback
app.post('/api/pi/payment', async (req, res) => {
  // This will be called by Pi servers
  try {
    const payment = await pi.handlePayment(req.body);
    // Save payment to supabase
    await supabase.from('payments').insert([
      {
        payment_id: payment.identifier,
        username: payment.user.username,
        amount: payment.amount,
        txid: payment.transaction.txid,
        status: 'completed'
      }
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Endpoint for frontend to trigger Pi payment (server generates payment request)
app.post('/api/payment', async (req, res) => {
  const { username, amount, memo } = req.body;
  try {
    const paymentRequest = await pi.createPayment(username, amount, memo);
    res.json(paymentRequest);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
