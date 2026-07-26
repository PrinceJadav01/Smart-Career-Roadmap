import React, { useState, useEffect } from 'react';
import { Gift, ExternalLink, Calendar, Key, Loader2, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import * as api from '../services/api';

export default function TokenShop({ userProfile, onUpdateTokens }) {
  const [catalog, setCatalog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

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

  const handleRedeem = async (rewardId, cost) => {
    if (userProfile.tokens < cost) {
      alert('Insufficient tokens. Complete weekly challenges to earn more.');
      return;
    }
    if (!confirm('Redeem this reward with your tokens?')) return;

    setRedeemingId(rewardId);
    try {
      const res = await api.redeemReward(rewardId);
      alert(res.message);
      
      if (onUpdateTokens) {
        onUpdateTokens(res.tokens);
      }

      fetchRewards();
    } catch (err) {
      alert(err.message || 'Redemption failed.');
    } finally {
      setRedeemingId(null);
    }
  };

  const isRedeemed = (rewardId) => {
    return inventory.some(item => item.rewardId === rewardId);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#8A8FA8' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#00C896', animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
        <p style={{ fontSize: '0.875rem' }}>Loading Rewards Catalog...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      
      {/* CATALOG */}
      <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
              Rewards & Benefits
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.25rem' }}>
              Redeem tokens earned from weekly challenges for learning perks and access.
            </p>
          </div>
          <div className="badge badge-accent" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}>
            Balance: {userProfile.tokens || 0} Tokens
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {catalog.map(item => {
            const redeemed = isRedeemed(item.id);
            const canAfford = userProfile.tokens >= item.tokenCost;
            return (
              <div 
                key={item.id} 
                className={`surface ${redeemed ? '' : 'surface-hover'}`}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '1rem',
                  position: 'relative',
                  background: redeemed ? 'rgba(0,200,150,0.04)' : '#0F1117',
                  borderColor: redeemed ? 'rgba(0,200,150,0.25)' : 'rgba(255,255,255,0.07)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                      {item.title}
                    </h3>
                    {redeemed && (
                      <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                        Redeemed
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Cost</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9375rem', fontWeight: 700, color: '#00C896' }}>
                      {item.tokenCost} Tokens
                    </span>
                  </div>

                  {redeemed ? (
                    <button disabled className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', opacity: 0.5, cursor: 'default' }}>
                      Claimed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRedeem(item.id, item.tokenCost)}
                      disabled={redeemingId !== null || !canAfford}
                      className={canAfford ? 'btn-primary' : 'btn-ghost'}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', opacity: !canAfford ? 0.4 : 1 }}
                    >
                      {redeemingId === item.id ? (
                        <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Claiming</>
                      ) : (
                        'Redeem Benefit'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {catalog.length === 0 && (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: '#4B5068', fontSize: '0.875rem' }}>
            No rewards are currently available. Check back soon.
          </div>
        )}
      </div>

      {/* USER INVENTORY */}
      <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            My Inventory
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
            {inventory.length} Items
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {inventory.map(item => (
            <div key={item.id} className="surface-2" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                  {item.title}
                </h4>
                <a 
                  href={item.rewardUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#00C896', display: 'flex', alignItems: 'center' }}
                  title="Claim link"
                >
                  <ExternalLink style={{ width: 13, height: 13 }} />
                </a>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#8A8FA8', lineHeight: 1.4 }}>{item.description}</p>
              <div style={{ fontSize: '0.65rem', color: '#4B5068', marginTop: '0.2rem' }}>
                Redeemed {new Date(item.redeemedAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {inventory.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#4B5068', fontSize: '0.8125rem' }}>
              Your inventory is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
