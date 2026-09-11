namespace Legacy.Quotes.Server.Models
{
    public class QuoteRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Tier { get; set; }
        public decimal DiscountPct { get; set; }
        public bool Expedited { get; set; }
        public DateTime BookedAtUtc { get; set; }
    }

}
