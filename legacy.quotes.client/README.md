# Get it running and show us
Scaffolding of the project , database table and stored procedure in a seperate project. Please see the legacy.quotes.scaffolding folder for the scaffolding project. The scaffolding project has a set of scripts that will create the database, tables and stored procedures. You can run the scripts in the scaffolding project to
run the database 

# Program.cs holds the logic for the preview calculation, and the test project has a set of unit tests that compare the preview calculation to the stored procedure.


# what I Found

•	System of record: the SQL Server stored procedure dbo.usp_CalculateSettlementFee is the canonical behaviour (it writes the ledger). All tests and comparisons must use the stored proc as the truth.
•	Money type: use C# decimal everywhere for exact-magnitude fixed-point arithmetic (no double/float). SQL uses DECIMAL(18,4) — use decimal with matching scale/precision for calculations and final rounding.
•	C# preview applies the minimum-fee before discount; stored proc applies min fee after discount (behaviour mismatch).
•	C# preview ignores historic bands (bookedAtUtc pre-2019) and special tier LEGACY_2016.
•	JavaScript uses < band boundaries (not <=) for 7500/40000 — an edge-case mismatch.