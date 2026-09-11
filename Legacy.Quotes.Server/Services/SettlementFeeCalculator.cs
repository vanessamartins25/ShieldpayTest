namespace Legacy.Quotes.Server.Services
{
    public class SettlementFeeCalculator
    {
        // Pure calculation; no IO, no DB, deterministic.
        public static decimal Calculate(
            decimal amount,
            string currencyCode,
            string? customerTier,
            decimal discountPct,
            bool expedited,
            DateTime bookedAtUtc,
            decimal minimumFee)
        {
            // rate selection: follows the stored-proc rules (date switches bands)
            decimal rate;
            if (bookedAtUtc < new DateTime(2019, 4, 1))
            {
                rate = amount < 10000m ? 0.0250m
                     : amount < 50000m ? 0.0180m
                     : 0.0125m;
            }
            else
            {
                rate = amount <= 7500m ? 0.0245m
                     : amount <= 40000m ? 0.0175m
                     : 0.0110m;
            }

            // Tier adjustments
            var tier = string.IsNullOrEmpty(customerTier) ? "STANDARD" : customerTier;
            if (tier == "PARTNER") rate -= 0.0025m;
            if (tier == "LEGACY_2016") rate = 0.0200m; // explicit override

            // Follow stored-proc arithmetic ordering:
            // 1) fee = ROUND(amount * rate, 2)
            // 2) fee = ROUND(fee * (1 - discountPct), 2)
            // 3) if fee < minimumFee then fee = minimumFee
            // 4) if expedited then fee += 12.50
            decimal fee = Math.Round(amount * rate, 2, MidpointRounding.AwayFromZero);
            fee = Math.Round(fee * (1 - discountPct), 2, MidpointRounding.AwayFromZero);
            if (fee < minimumFee) fee = minimumFee;
            if (expedited) fee += 12.50m;
            return fee;
        }
    }
}
