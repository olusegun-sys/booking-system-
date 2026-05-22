import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, XCircle } from 'lucide-react';

function PaystackPayment({ bookingReference, amount, email, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Dynamic API base - works on desktop and mobile
  var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'http://' + window.location.hostname + ':5000';

  // Load Paystack script dynamically
  useEffect(() => {
    if (document.querySelector('script[src*="paystack"]')) {
      setPaystackLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => setError('Failed to load payment gateway. Please refresh and try again.');
    document.body.appendChild(script);
    
    return () => {
      // Don't remove the script, just clean up
    };
  }, []);

  const formatPrice = (priceInKobo) => {
    const priceInNaira = priceInKobo / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(priceInNaira);
  };

  const handlePayNow = async () => {
    if (!paystackLoaded) {
      setError('Payment gateway is still loading. Please wait.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('Creating payment for:', { bookingReference, email, amount });

      const initResponse = await fetch(API_BASE + '/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference,
          email,
          amount: amount
        })
      });

      const initData = await initResponse.json();

      if (!initData.success) {
        if (initData.error && (initData.error.includes('Duplicate') || initData.error.includes('already'))) {
          setError('A payment for this booking has already been initiated. The booking is confirmed. Please check your email or try "Pay at Venue".');
        } else {
          setError(initData.error || 'Could not start payment. Please try again.');
        }
        setLoading(false);
        return;
      }

      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        setError('Payment configuration error. Please contact support.');
        setLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: amount,
        ref: initData.reference,
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: "Booking Reference",
              variable_name: "booking_reference",
              value: bookingReference
            }
          ]
        },
        onClose: function () {
          setLoading(false);
          setError('Payment window closed. You can try again or pay at the venue.');
        },
        callback: function (response) {
          verifyPaymentOnBackend(response.reference);
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const verifyPaymentOnBackend = async (reference) => {
    try {
      const verifyResponse = await fetch(API_BASE + '/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          bookingReference
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setPaymentStatus('success');
        setLoading(false);
      } else {
        setPaymentStatus('failed');
        setError(verifyData.message || 'Payment could not be verified.');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (onSuccess) onSuccess();
  };

  const handlePayAtVenue = () => {
    if (onClose) onClose();
  };

  if (paymentStatus === 'success') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '16px',
        padding: '28px',
        textAlign: 'center',
        border: '1px solid #6ee7b7'
      }}>
        <CheckCircle size={48} strokeWidth={2} color="#065f46" style={{ marginBottom: '12px' }} />
        <h3 style={{ color: '#065f46', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          Payment Successful
        </h3>
        <p style={{ color: '#065f46', fontSize: '15px', marginBottom: '4px' }}>
          {formatPrice(amount)} paid successfully
        </p>
        <p style={{ color: '#047857', fontSize: '13px', marginBottom: '20px' }}>
          Reference: {bookingReference}
        </p>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          style={{ padding: '12px 32px', fontSize: '15px', fontWeight: '600' }}
        >
          Continue
        </button>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div style={{
        background: '#fef2f2',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        border: '1px solid #fecaca'
      }}>
        <XCircle size={40} strokeWidth={2} color="#991b1b" style={{ marginBottom: '12px' }} />
        <h3 style={{ color: '#991b1b', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          Payment Failed
        </h3>
        <p style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '16px' }}>
          {error || 'Your payment could not be processed.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handlePayNow}
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            Try Again
          </button>
          <button
            className="btn btn-secondary"
            onClick={handlePayAtVenue}
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            Pay at Venue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {!paystackLoaded && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>Loading payment gateway...</p>
        </div>
      )}

      {paystackLoaded && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <button className="btn btn-success" onClick={handlePayNow} disabled={loading} style={{ padding: '16px 32px', fontSize: '16px', width: '100%', maxWidth: '360px' }}>
            <CreditCard size={18} strokeWidth={2} />
            {loading ? 'Processing...' : `Pay ${formatPrice(amount)} Now`}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '360px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={handlePayAtVenue} 
            style={{ 
              padding: '14px 32px', 
              fontSize: '15px', 
              width: '100%', 
              maxWidth: '360px',
              background: 'white',
              border: '1.5px solid #e2e8f0',
              color: '#64748b',
              fontWeight: '500'
            }}
          >
            Pay at Venue
          </button>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            No payment required now — pay when you arrive
          </p>
        </div>
      )}

      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
        Secured by Paystack — Test mode — no real charges
      </p>
    </div>
  );
}

export default PaystackPayment;