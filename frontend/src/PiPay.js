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
      // Here, integrate with the Pi SDK on the frontend (window.Pi)
      if (window.Pi) {
        window.Pi.createPayment({
          amount: paymentRequest.amount,
          memo: paymentRequest.memo,
          metadata: { username }
        }, {
          onReadyForServerApproval: paymentId => setStatus('Waiting server approval...'),
          onReadyForServerCompletion: (paymentId, txid) => setStatus('Payment succeeded!'),
          onCancel: paymentId => setStatus('Payment canceled by user'),
          onError: err => setStatus('Payment error: ' + err)
        }).then(paymentResult => {
          setStatus('Payment complete!');
        }).catch(err => setStatus('Payment failed: ' + err));
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
        onChange={e => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Memo"
        value={memo}
        onChange={e => setMemo(e.target.value)}
      />
      <button onClick={handlePay}>Pay</button>
      <div>{status}</div>
    </div>
  );
};

export default PiPay;
