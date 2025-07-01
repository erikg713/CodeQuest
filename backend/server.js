import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { body, validationResult, param } from 'express-validator';
import supabase from './supabase.js';
import { handlePayment, createPayment } from './pi.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Async error handling wrapper
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET user by username
app.get(
  '/api/user/:username',
  param('username').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(data);
  })
);

// POST Pi payment
app.post(
  '/api/pi/payment',
  body('paymentData').exists(), // Customize validation as per expected fields
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payment = await handlePayment(req.body.paymentData);
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
  })
);

// POST create payment request
app.post(
  '/api/payment',
  [
    body('username').isString().notEmpty(),
    body('amount').isNumeric(),
    body('memo').optional().isString()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, amount, memo } = req.body;
    const paymentRequest = await createPayment(username, amount, memo);
    res.json(paymentRequest);
  })
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
