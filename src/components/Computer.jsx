import React, { useState } from 'react';
import './Computer.css';
import { calculatePrice } from '../utils/economy';

export default function Computer({
  time, cash, dayState, marketTab, setMarketTab,
  opdbDatabase, dailyMarket, buyMachine, buySupply, closeComputer
}) {
  const [activeWindow, setActiveWindow] = useState(null); // 'browser' or null
  const [purchasedItems, setPurchasedItems] = useState({});

  const openBrowser = (tab) => {
    setMarketTab(tab);
    setActiveWindow('browser');
  };

  const handlePurchaseMachine = (machine) => {
    buyMachine(machine);
    setPurchasedItems(prev => ({ ...prev, [machine.id]: true }));
    setTimeout(() => {
      setPurchasedItems(prev => ({ ...prev, [machine.id]: false }));
    }, 1500);
  };

  const handlePurchaseSupply = (type) => {
    buySupply(type);
    setPurchasedItems(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setPurchasedItems(prev => ({ ...prev, [type]: false }));
    }, 1500);
  };

  return (
    <div className="computer-overlay">
      <div className="win95-desktop">
        <div className="win95-icons">
          <div className="win95-icon" onClick={() => openBrowser('pinball')}>
            <div className="icon-img">💻</div>
            <span>Pinball Net</span>
          </div>
          <div className="win95-icon" onClick={() => openBrowser('supplies')}>
            <div className="icon-img">🍺</div>
            <span>Bar Supplies</span>
          </div>
        </div>

        {activeWindow === 'browser' && (
          <div className="win95-window">
            <div className="win95-titlebar">
              <div className="title">Netscape Navigator - {marketTab === 'pinball' ? 'Pinball Net' : 'Bar Supplies'}</div>
              <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
            </div>
            <div className="win95-toolbar">
              <span>Address: http://www.{marketTab === 'pinball' ? 'pinball-net.com' : 'barsupplies.com'}</span>
            </div>
            <div className="win95-content">
              <div className="browser-page">
                <h1 style={{ color: 'blue', textDecoration: 'underline' }}>Welcome to {marketTab === 'pinball' ? 'Pinball Net' : 'Bar Supplies'}</h1>
                <hr />
                {marketTab === 'pinball' && opdbDatabase.length === 0 && <div style={{color: 'black'}}>Dialing up OPDB Server... (Please Wait)</div>}
                <div className="marketplace-grid">
                  {marketTab === 'pinball' ? dailyMarket.map(machine => {
                    const mYear = machine.parsedYear;
                    const price = calculatePrice(mYear, time.year, 100);
                    const canAfford = price && cash >= price;
                    const isNew = mYear === time.year;

                    return (
                      <div key={machine.id} className="win95-card">
                        <div>
                           <strong>{machine.name}</strong>
                           {isNew && <span className="new-badge">NEW!</span>}
                        </div>
                        <div style={{fontSize:'0.8rem'}}>{machine.supplementary}</div>
                        <div style={{marginTop:'0.5rem'}}>Price: ${price}</div>
                        <button 
                          className="win95-btn" 
                          disabled={!canAfford || dayState === 'REPORT'} 
                          onClick={() => handlePurchaseMachine(machine)}
                        >
                          {purchasedItems[machine.id] ? 'Purchased!' : 'Order Now'}
                        </button>
                      </div>
                    )
                  }) : (
                    <>
                      <div className="win95-card">
                        <div><strong>Kegerator</strong></div>
                        <div style={{fontSize:'0.8rem'}}>Essential for serving drinks.</div>
                        <div style={{marginTop:'0.5rem'}}>Price: $1000</div>
                        <button 
                          className="win95-btn" 
                          disabled={cash < 1000 || dayState === 'REPORT'} 
                          onClick={() => handlePurchaseSupply('kegerator')}
                        >
                          {purchasedItems['kegerator'] ? 'Purchased!' : 'Order Now'}
                        </button>
                      </div>
                      <div className="win95-card">
                        <div><strong>Bartop</strong></div>
                        <div style={{fontSize:'0.8rem'}}>Where patrons order drinks.</div>
                        <div style={{marginTop:'0.5rem'}}>Price: $500</div>
                        <button 
                          className="win95-btn" 
                          disabled={cash < 500 || dayState === 'REPORT'} 
                          onClick={() => handlePurchaseSupply('bartop')}
                        >
                          {purchasedItems['bartop'] ? 'Purchased!' : 'Order Now'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="win95-taskbar">
          <button className="win95-start-btn" onClick={closeComputer}>
            <span style={{fontWeight: 'bold', marginRight: '5px'}}>Start</span> (Turn Off)
          </button>
          {activeWindow === 'browser' && (
            <div className="taskbar-item active">Netscape Navigator</div>
          )}
          <div className="taskbar-time">{time.year}</div>
        </div>
      </div>
    </div>
  );
}
