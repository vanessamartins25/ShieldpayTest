import { useState, useMemo } from 'react';
import './style.css';

function computeFeeBreakdown(amount, tier, discountPct, expedited, bookedAtIso, minFee) {
    const amountNum = Number(amount) || 0;
    const bookedAt = new Date(bookedAtIso);
    let rate;
    if (bookedAt < new Date('2019-04-01')) {
        rate = amountNum < 10000 ? 0.0250 : amountNum < 50000 ? 0.0180 : 0.0125;
    } else {
        rate = amountNum <= 7500 ? 0.0245 : amountNum <= 40000 ? 0.0175 : 0.0110;
    }

    if (!tier) tier = 'STANDARD';
    if (tier === 'PARTNER') rate = rate - 0.0025;
    if (tier === 'LEGACY_2016') rate = 0.0200;

    // base fee rounded to 2 decimals
    let baseFee = Math.round(amountNum * rate * 100) / 100;
    let discounted = Math.round(baseFee * (1 - (Number(discountPct) || 0)) * 100) / 100;
    let floorApplied = discounted < Number(minFee) ? Number(minFee) : discounted;
    let expeditedAdded = expedited ? floorApplied + 12.5 : floorApplied;

    return {
        amount: amountNum,
        rate,
        baseFee,
        discounted,
        floorApplied,
        expeditedAdded,
        minFee: Number(minFee),
    };
}

function formatMoney(n, currency = 'GBP') {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
}

export default function App() {
    const [amount, setAmount] = useState(12500);
    const [tier, setTier] = useState('PARTNER');
    const [discount, setDiscount] = useState(0.10);
    const [expedited, setExpedited] = useState(false);
    const [bookedAt, setBookedAt] = useState('2018-06-01');
    const [minFee, setMinFee] = useState(15.0);
    const [currency, setCurrency] = useState('GBP');

    const breakdown = useMemo(
        () => computeFeeBreakdown(amount, tier, discount, expedited, bookedAt, minFee),
        [amount, tier, discount, expedited, bookedAt, minFee]
    );

    return (
        <div className="app-root">
            <header className="header">
                <h1>Quote preview</h1>
                <p className="subtitle">Interactive estimate of settlement fee — matches legacy logic.</p>
            </header>

            <main className="card">
                <section className="form">
                    <label>
                        Amount
                        <input
                            type="number"
                            value={amount}
                            min="0"
                            step="0.01"
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </label>

                    <label>
                        Currency
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option>GBP</option>
                            <option>EUR</option>
                            <option>USD</option>
                        </select>
                    </label>

                    <label>
                        Tier
                        <select value={tier} onChange={(e) => setTier(e.target.value)}>
                            <option>STANDARD</option>
                            <option>PARTNER</option>
                            <option>LEGACY_2016</option>
                        </select>
                    </label>

                    <label>
                        Discount %
                        <div className="range-row">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                            <input
                                type="number"
                                value={discount}
                                step="0.01"
                                min="0"
                                max="1"
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                        </div>
                    </label>

                    <label className="checkbox">
                        <input type="checkbox" checked={expedited} onChange={(e) => setExpedited(e.target.checked)} />
                        Expedited (+{formatMoney(12.5, currency)})
                    </label>

                    <label>
                        Booked at
                        <input type="date" value={bookedAt} onChange={(e) => setBookedAt(e.target.value)} />
                    </label>

                    <label>
                        Minimum fee
                        <input type="number" value={minFee} step="0.01" onChange={(e) => setMinFee(e.target.value)} />
                    </label>
                </section>

                <section className="result">
                    <div className="summary">
                        <div>
                            <div className="label">Preview fee</div>
                            <div className="fee">{formatMoney(breakdown.expeditedAdded, currency)}</div>
                        </div>

                        <div className="meta">
                            <div className="small">Amount: {formatMoney(breakdown.amount, currency)}</div>
                            <div className="small">Rate: {(breakdown.rate * 100).toFixed(3)}%</div>
                            <div className="small">Booked at: {new Date(bookedAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="breakdown">
                        <h3>Breakdown</h3>
                        <dl>
                            <dt>Base fee ({(breakdown.rate * 100).toFixed(3)}%):</dt>
                            <dd>{formatMoney(breakdown.baseFee, currency)}</dd>

                            <dt>After discount ({(discount * 100).toFixed(0)}%):</dt>
                            <dd>{formatMoney(breakdown.discounted, currency)}</dd>

                            <dt>Minimum fee applied:</dt>
                            <dd>{breakdown.floorApplied === breakdown.discounted ? 'No' : formatMoney(breakdown.minFee, currency)}</dd>

                            <dt>Post-floor:</dt>
                            <dd>{formatMoney(breakdown.floorApplied, currency)}</dd>

                            <dt>Expedited:</dt>
                            <dd>{expedited ? formatMoney(12.5, currency) : formatMoney(0, currency)}</dd>

                            <dt>Total:</dt>
                            <dd className="total">{formatMoney(breakdown.expeditedAdded, currency)}</dd>
                        </dl>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <small>Logic mirrors the legacy stored-procedure ordering: round → discount → floor → expedited.</small>
            </footer>
        </div>
    );
}