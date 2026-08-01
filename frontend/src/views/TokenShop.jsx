import React, { useState, useEffect } from 'react';
import { Gift, ExternalLink, Calendar, Key, Loader2, Sparkles, CheckCircle2, Package, MapPin, Phone, User, Clock, Truck, ShieldCheck, X } from 'lucide-react';
import * as api from '../services/api';

export default function TokenShop({ userProfile, onUpdateTokens }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders'
  const [catalog, setCatalog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Shipping Modal State
  const [selectedReward, setSelectedReward] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    fullName: userProfile?.name || '',
    phoneNumber: userProfile?.phoneNumber || '',
    shippingAddress: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const data = await api.getRewardsCatalog();
      setCatalog(data.catalog || []);
      setInventory(data.inventory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRedeemModal = (reward) => {
    if ((userProfile.tokens || 0) < reward.tokenCost) {
      alert(`Insufficient tokens. You need ${reward.tokenCost} tokens to redeem this item.`);
      return;
    }
    setSelectedReward(reward);
    setFormErrors({});
    setShippingForm({
      fullName: userProfile?.name || '',
      phoneNumber: userProfile?.phoneNumber || '',
      shippingAddress: ''
    });
  };

  const validateForm = () => {
    const errors = {};
    const name = shippingForm.fullName.trim();
    if (!name) {
      errors.fullName = 'Full Name is required.';
    } else if (name.length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters long.';
    }

    const digitsOnly = shippingForm.phoneNumber.replace(/\D/g, '');
    if (!shippingForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Contact Phone Number is required.';
    } else if (digitsOnly.length !== 10) {
      errors.phoneNumber = 'Phone Number must be a valid 10-digit mobile number (e.g. 9876543210).';
    }

    const addr = shippingForm.shippingAddress.trim();
    if (!addr) {
      errors.shippingAddress = 'Delivery Shipping Address is required.';
    } else if (addr.length < 10) {
      errors.shippingAddress = 'Please enter a complete address (at least 10 characters with street, city & pincode).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmRedeem = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await api.redeemReward(selectedReward.id, {
        fullName: shippingForm.fullName.trim(),
        phoneNumber: shippingForm.phoneNumber.trim(),
        shippingAddress: shippingForm.shippingAddress.trim()
      });

      const orderIdStr = res.Redemption?.orderId || res.Redemption?.OrderId || 'Generated';
      alert(`🎉 ${res.message}\nOrder ID: ${orderIdStr}`);
      
      if (onUpdateTokens && res.tokens !== undefined) {
        onUpdateTokens(res.tokens);
      }

      setSelectedReward(null);
      await fetchRewards();
      setActiveTab('orders'); // Auto switch to tracking view
    } catch (err) {
      alert(err.message || 'Redemption failed.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return { bg: 'rgba(0, 200, 150, 0.15)', border: '#00C896', text: '#00C896', icon: CheckCircle2, label: 'Delivered' };
      case 'dispatched':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: '#60A5FA', icon: Truck, label: 'Dispatched' };
      default: // 'waiting'
        return { bg: 'rgba(234, 179, 8, 0.15)', border: '#EAB308', text: '#EAB308', icon: Clock, label: 'Waiting Approval' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#8A8FA8' }}>
        <Loader2 style={{ width: 36, height: 36, color: '#00C896', animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
        <p style={{ fontSize: '0.875rem' }}>Loading Reward Merchant & Orders Catalog...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* ── Header Banner ── */}
      <div className="surface" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Gift style={{ width: 22, height: 22, color: '#00C896' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
              Rewards Merchant & Swag Store
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#8A8FA8', maxWidth: 600, lineHeight: 1.5 }}>
            Redeem your earned tokens for developer swag items like custom water bottles, hoodies, t-shirts, pens, and 1-on-1 mentorship slots.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="surface-2" style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(0,200,150,0.3)', background: 'rgba(0,200,150,0.08)', borderRadius: 10 }}>
            <Sparkles style={{ width: 18, height: 18, color: '#00C896' }} />
            <div>
              <span style={{ fontSize: '0.65rem', color: '#8A8FA8', textTransform: 'uppercase', display: 'block' }}>Available Balance</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.15rem', fontWeight: 700, color: '#00C896' }}>
                {userProfile.tokens || 0} Tokens
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          className={activeTab === 'catalog' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.55rem 1.25rem', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Gift style={{ width: 15, height: 15 }} /> Reward Catalog ({catalog.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.55rem 1.25rem', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Package style={{ width: 15, height: 15 }} /> My Orders & Delivery Tracking ({inventory.length})
        </button>
      </div>

      {/* ── TAB 1: REWARD CATALOG ── */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {catalog.map(item => {
            const canAfford = (userProfile.tokens || 0) >= item.tokenCost;
            return (
              <div
                key={item.id}
                className="surface surface-hover"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div>
                  {/* Item Image */}
                  <div style={{ width: '100%', height: 170, borderRadius: 8, overflow: 'hidden', background: '#08090E', marginBottom: '1rem', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5068' }}>
                        <Gift style={{ width: 48, height: 48 }} />
                      </div>
                    )}
                    <span style={{ position: 'absolute', top: 10, right: 10, background: '#0F1117', border: '1px solid #00C896', color: '#00C896', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace' }}>
                      🪙 {item.tokenCost} Tokens
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 600, color: '#F1F2F4', marginBottom: '0.35rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Required</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 600, color: canAfford ? '#00C896' : '#F87171' }}>
                      {item.tokenCost} Tokens
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenRedeemModal(item)}
                    disabled={!canAfford}
                    className={canAfford ? 'btn-primary' : 'btn-ghost'}
                    style={{ fontSize: '0.78rem', padding: '0.5rem 1rem', opacity: !canAfford ? 0.4 : 1, cursor: !canAfford ? 'not-allowed' : 'pointer' }}
                  >
                    {canAfford ? 'Redeem Item' : 'Need More Tokens'}
                  </button>
                </div>
              </div>
            );
          })}

          {catalog.length === 0 && (
            <div style={{ gridColumn: 'span 3', padding: '4rem 0', textAlign: 'center', color: '#4B5068', fontSize: '0.875rem' }}>
              No reward items available in catalog currently.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY ORDERS & DELIVERY TRACKING ── */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {inventory.map(order => {
            const statusInfo = getStatusBadge(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="surface"
                style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Item thumbnail & details */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 260 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: '#08090E', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5068' }}>
                    {order.imageUrl ? (
                      <img src={order.imageUrl} alt={order.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package style={{ width: 28, height: 28 }} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.675rem', fontFamily: 'JetBrains Mono, monospace', color: '#00C896', background: 'rgba(0,200,150,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                        {order.orderId || 'ORD-REQ'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#4B5068' }}>
                        {new Date(order.redeemedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                      {order.title || 'Reward Item'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#8A8FA8' }}>🪙 {order.tokenCost} Tokens</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div style={{ minWidth: 240, maxWidth: 360, background: '#08090E', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin style={{ width: 11, height: 11, color: '#00C896' }} /> Shipping Address
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#F1F2F4', fontWeight: 600, display: 'block' }}>{order.fullName} ({order.phoneNumber})</span>
                  <span style={{ fontSize: '0.72rem', color: '#8A8FA8', lineHeight: 1.3, display: 'block', marginTop: '0.1rem' }}>{order.shippingAddress}</span>
                </div>

                {/* Delivery Status Badge */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Delivery Status</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: statusInfo.bg, border: `1px solid ${statusInfo.border}`, color: statusInfo.text, padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                    <StatusIcon style={{ width: 14, height: 14 }} /> {statusInfo.label}
                  </div>
                </div>
              </div>
            );
          })}

          {inventory.length === 0 && (
            <div className="surface" style={{ padding: '3rem', textAlign: 'center', color: '#8A8FA8' }}>
              <Package style={{ width: 40, height: 40, color: '#4B5068', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1rem', color: '#F1F2F4', fontWeight: 600 }}>No Orders Yet</h3>
              <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.25rem' }}>You have not redeemed any physical rewards yet. Select an item from the catalog!</p>
            </div>
          )}
        </div>
      )}

      {/* ── SHIPPING DETAILS MODAL ── */}
      {selectedReward && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99, padding: '1rem' }}>
          <div className="surface" style={{ width: '100%', maxWidth: 480, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(0,200,150,0.3)', position: 'relative' }}>
            
            <button
              onClick={() => setSelectedReward(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#8A8FA8', cursor: 'pointer' }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            <div>
              <span className="badge badge-accent" style={{ fontSize: '0.675rem', marginBottom: '0.5rem' }}>Shipping Address Form</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#F1F2F4' }}>
                Redeem {selectedReward.title}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.2rem' }}>
                Provide your delivery address to receive your physical reward item.
              </p>
            </div>

            {/* Token Calculation Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: '#08090E', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '0.625rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Current Tokens</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F1F2F4' }}>{userProfile.tokens || 0}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.625rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Reward Cost</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F87171' }}>-{selectedReward.tokenCost}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.625rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Remaining</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#00C896' }}>{(userProfile.tokens || 0) - selectedReward.tokenCost}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmRedeem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8A8FA8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Full Name (Recipient)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Savan Chauhan"
                  value={shippingForm.fullName}
                  onChange={e => {
                    setShippingForm({ ...shippingForm, fullName: e.target.value });
                    if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: null });
                  }}
                  style={{
                    width: '100%',
                    background: '#08090E',
                    border: formErrors.fullName ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.1)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 6,
                    color: '#F1F2F4',
                    fontSize: '0.84rem'
                  }}
                />
                {formErrors.fullName && (
                  <span style={{ fontSize: '0.7rem', color: '#F87171', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.fullName}
                  </span>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.7rem', color: '#8A8FA8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Contact Phone Number
                  </label>
                  <span style={{ fontSize: '0.65rem', color: '#4B5068', fontFamily: 'JetBrains Mono, monospace' }}>
                    {shippingForm.phoneNumber.replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9876543210 (10 digits)"
                  value={shippingForm.phoneNumber}
                  onChange={e => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setShippingForm({ ...shippingForm, phoneNumber: onlyNums });
                    if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: null });
                  }}
                  style={{
                    width: '100%',
                    background: '#08090E',
                    border: formErrors.phoneNumber ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.1)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 6,
                    color: '#F1F2F4',
                    fontSize: '0.84rem',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                />
                {formErrors.phoneNumber ? (
                  <span style={{ fontSize: '0.7rem', color: '#F87171', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.phoneNumber}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#4B5068', marginTop: '0.2rem', display: 'block' }}>
                    Must be a valid 10-digit mobile number.
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#8A8FA8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Delivery Shipping Address
                </label>
                <textarea
                  rows={3}
                  placeholder="Flat / House No., Street Name, City, State, Pincode"
                  value={shippingForm.shippingAddress}
                  onChange={e => {
                    setShippingForm({ ...shippingForm, shippingAddress: e.target.value });
                    if (formErrors.shippingAddress) setFormErrors({ ...formErrors, shippingAddress: null });
                  }}
                  style={{
                    width: '100%',
                    background: '#08090E',
                    border: formErrors.shippingAddress ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.1)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 6,
                    color: '#F1F2F4',
                    fontSize: '0.84rem',
                    resize: 'none'
                  }}
                />
                {formErrors.shippingAddress && (
                  <span style={{ fontSize: '0.7rem', color: '#F87171', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.shippingAddress}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '0.65rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="btn-primary"
                  style={{ flex: 2, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {submittingOrder ? (
                    <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : (
                    'Confirm Order & Redeem'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
