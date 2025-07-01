import React, { useState } from 'react';
import { createPayment } from './api';

const PiPay = ({ username }) => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState('');

  const handlePay = async () => {
    setStatus('Processing...');
    try {
      const paymentRequest = await createPayment(username, amount, memo);
      if (window.Pi) {
        window.Pi.createPayment(
          {
            amount: paymentRequest.amount,
            memo: paymentRequest.memo,
            metadata: { username }
          },
          {
            onReadyForServerApproval: paymentId =>
              setStatus('Waiting for server approval...'),
            onReadyForServerCompletion: (paymentId, txid) =>
              setStatus('Payment succeeded!'),
            onCancel: paymentId =>
              setStatus('Payment canceled by user.'),
            onError: err =>
              setStatus('Payment error: ' + err)
          }
        )
          .then(() => setStatus('Payment complete!'))
          .catch(err => setStatus('Payment failed: ' + err));
      } else {
        setStatus('Pi SDK not loaded.');
      }
    } catch (e) {
      setStatus('Payment failed: ' + e.message);
    }
  };

  return (
    <div style={{ margin: 16 }}>
      <h3>Pay with Pi Network</h3>
      <input
        type="number"
        placeholder="Amount (π)"
        value={amount}
        min="0.01"
        step="0.01"
        onChange={e => setAmount(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <input
        type="text"
        placeholder="Memo"
        value={memo}
        onChange={e => setMemo(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={handlePay}>Pay</button>
      <div style={{ marginTop: 10, color: '#444' }}>{status}</div>
    </div>
  );
};

export default PiPay;
