using Legacy.Quotes.Server.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

class Program
{
    // Simple runner that loads the currency floors from a file and prints sample outputs.
    static void Main(string[] args)
    {
        var dataPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "data", "CurrencyFeeFloor.json");
        if (!File.Exists(dataPath))
        {
            Console.WriteLine("Data file not found: " + dataPath);
            return;
        }

        var json = File.ReadAllText(dataPath);
        var floors = JsonSerializer.Deserialize<Dictionary<string, decimal>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                     ?? new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);

        var samples = new[]
        {
            (Amount: 12500m, Currency: "GBP", Tier: "PARTNER", Discount: 0.10m, Expedited: false, BookedAt: new DateTime(2018,6,1)),
            (Amount: 500m, Currency: "GBP", Tier: "STANDARD", Discount: 0m, Expedited: false, BookedAt: DateTime.UtcNow),
            (Amount: 1000m, Currency: "USD", Tier: "STANDARD", Discount: 0.50m, Expedited: true, BookedAt: DateTime.UtcNow)
        };

        foreach (var s in samples)
        {
            floors.TryGetValue(s.Currency, out var minFee);
            if (minFee == 0) minFee = 15.00m;
            var fee = SettlementFeeCalculator.Calculate(s.Amount, s.Currency, s.Tier, s.Discount, s.Expedited, s.BookedAt, minFee);
            Console.WriteLine($"{s.Currency} {s.Amount} tier={s.Tier} discount={s.Discount} expedited={s.Expedited} bookedAt={s.BookedAt:yyyy-MM-dd} => fee={fee}");
        }
    }
}