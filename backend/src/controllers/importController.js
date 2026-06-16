const fs = require("fs");
const csv = require("csv-parser");
const pool = require("../config/db");
const { parse, isValid, format } = require("date-fns");
const stringSimilarity = require("string-similarity");

const analyzeCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Fetch group members to use for matching
    // For the import, we need to know the group. We assume it's passed in the body.
    const { group_id } = req.body;
    if (!group_id) {
      return res.status(400).json({ message: "group_id is required" });
    }

    const membersRes = await pool.query(
      `SELECT u.id, u.name, gm.left_at 
       FROM users u 
       JOIN group_members gm ON u.id = gm.user_id 
       WHERE gm.group_id = $1`,
      [group_id]
    );
    const members = membersRes.rows;
    const memberNames = members.map(m => m.name);

    const rows = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        try {
          const report = [];
          
          for (const row of rows) {
            let status = "Valid";
            const issues = [];
            const proposed = { ...row };
            let skip = false;

            // --- 1. Case-sensitivity / Formatting in Names ---
            const resolveName = (name) => {
              if (!name) return null;
              const trimmed = name.trim();
              if (memberNames.length === 0) return trimmed;
              const match = stringSimilarity.findBestMatch(trimmed, memberNames);
              if (match.bestMatch.rating > 0.6) {
                return match.bestMatch.target;
              }
              return trimmed;
            };

            if (row.paid_by) {
              const originalPaidBy = row.paid_by;
              proposed.paid_by = resolveName(row.paid_by);
              if (proposed.paid_by !== originalPaidBy) {
                issues.push(`Payer name '${originalPaidBy}' normalized to '${proposed.paid_by}'`);
                status = "Warning";
              }
            }

            if (row.split_with) {
              const splitList = row.split_with.split(";").map(s => s.trim());
              const resolvedSplits = splitList.map(resolveName);
              proposed.split_with = resolvedSplits.join(";");
              
              // --- 9. Unknown Members / Guests ---
              resolvedSplits.forEach(name => {
                if (!memberNames.includes(name)) {
                  issues.push(`Unknown member/guest: '${name}'`);
                  status = "Warning";
                }
              });
            }

            // --- 2. Thousands Separator / Commas ---
            if (row.amount && row.amount.includes(",")) {
              issues.push("Removed commas from amount");
              proposed.amount = row.amount.replace(/,/g, "");
              status = "Warning";
            }

            // --- 3. Decimals / Precision ---
            if (proposed.amount) {
              const numAmount = parseFloat(proposed.amount);
              if (!isNaN(numAmount)) {
                if ((numAmount * 100) % 1 !== 0) { // has more than 2 decimals
                  issues.push("Rounded amount to 2 decimal places");
                  status = "Warning";
                  proposed.amount = numAmount.toFixed(2);
                } else {
                  proposed.amount = numAmount.toFixed(2);
                }
              }
            }

            // --- 4. Invalid / Mixed Date Formats ---
            if (row.date) {
              let parsedDate = null;
              // Try YYYY-MM-DD
              parsedDate = parse(row.date, 'yyyy-MM-dd', new Date());
              if (!isValid(parsedDate)) {
                // Try DD/MM/YYYY
                parsedDate = parse(row.date, 'dd/MM/yyyy', new Date());
              }
              if (!isValid(parsedDate)) {
                // Try MMM dd (e.g. Mar 14)
                parsedDate = parse(row.date, 'MMM dd', new Date());
              }
              
              if (isValid(parsedDate)) {
                const formatted = format(parsedDate, 'yyyy-MM-dd');
                if (formatted !== row.date) {
                  issues.push(`Standardized date format to ${formatted}`);
                  status = "Warning";
                  proposed.date = formatted;
                }
              } else {
                issues.push("Invalid date format");
                status = "Error";
                skip = true;
              }
            }

            // --- 5. Missing Currency ---
            if (!row.currency || row.currency.trim() === "") {
              issues.push("Missing currency, defaulted to INR");
              status = "Warning";
              proposed.currency = "INR";
            }

            // --- 6. Negative Amounts ---
            if (parseFloat(proposed.amount) < 0) {
              issues.push("Negative amount detected, treating as Refund");
              status = "Warning";
              // It's fine to insert negative, it naturally reduces balance.
            }

            // --- 8. Percentages don't add up to 100% ---
            if (row.split_type === "percentage" && row.split_details) {
              const details = row.split_details.split(";").map(s => s.trim());
              let totalPct = 0;
              details.forEach(d => {
                const match = d.match(/(\d+)%/);
                if (match) totalPct += parseInt(match[1]);
              });
              if (totalPct > 0 && totalPct !== 100) {
                issues.push(`Percentages sum to ${totalPct}%, re-normalizing proportionally`);
                status = "Warning";
              }
            }

            // --- 10. Zero Amount ---
            if (parseFloat(proposed.amount) === 0) {
              issues.push("Zero amount expense");
              status = "Error";
              skip = true;
            }

            // --- 11. Conflicting Split Type ---
            if (row.split_type === "equal" && row.split_details) {
              // Usually if it's equal, split_details is empty. If populated, it's actually shares/unequal
              if (row.split_details.includes(";") && !row.split_details.includes("%")) {
                issues.push("Split type is 'equal' but details are provided. Correcting to 'share'");
                status = "Warning";
                proposed.split_type = "share";
              }
            }

            // --- 12. Missing paid_by ---
            if (!row.paid_by || row.paid_by.trim() === "") {
              issues.push("Missing 'paid_by' field");
              status = "Error";
              skip = true;
            }

            // --- 13. Settlement masquerading as expense ---
            if (row.description && row.description.toLowerCase().includes("paid") && row.description.toLowerCase().includes("back")) {
              issues.push("Detected as a settlement, not an expense");
              status = "Warning";
              proposed.is_settlement = true;
            }

            // --- 14. Member left but still included ---
            if (proposed.date && proposed.split_with) {
              const expDate = new Date(proposed.date);
              const splitList = proposed.split_with.split(";");
              const validSplits = [];
              
              splitList.forEach(name => {
                const member = members.find(m => m.name === name);
                if (member && member.left_at) {
                  const leftDate = new Date(member.left_at);
                  if (expDate > leftDate) {
                    issues.push(`Member '${name}' had already left the group. Removed from split.`);
                    status = "Warning";
                  } else {
                    validSplits.push(name);
                  }
                } else {
                  validSplits.push(name);
                }
              });
              if (validSplits.length !== splitList.length) {
                proposed.split_with = validSplits.join(";");
              }
            }

            report.push({
              original: row,
              proposed,
              issues,
              status,
              skip
            });
          }

          // --- 7. Duplicate Entries ---
          // A simple duplicate check: same date, same amount, similar description
          for (let i = 0; i < report.length; i++) {
            for (let j = i + 1; j < report.length; j++) {
              const r1 = report[i].proposed;
              const r2 = report[j].proposed;
              if (r1.date === r2.date && Math.abs(parseFloat(r1.amount) - parseFloat(r2.amount)) <= 50) {
                // If amount is close and descriptions are similar
                const descSim = stringSimilarity.compareTwoStrings(r1.description.toLowerCase(), r2.description.toLowerCase());
                if (descSim > 0.7) {
                  report[j].issues.push("Possible duplicate of row " + (i + 1));
                  report[j].status = "Warning";
                  report[j].skip = true; // Propose skipping the second one
                }
              }
            }
          }

          res.status(200).json(report);

        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Error processing CSV" });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const confirmImport = async (req, res) => {
  try {
    const { group_id, rows } = req.body;
    if (!group_id || !rows || !Array.isArray(rows)) {
      return res.status(400).json({ message: "group_id and rows array are required" });
    }

    const membersRes = await pool.query(
      `SELECT u.id, u.name FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = $1`,
      [group_id]
    );
    const members = membersRes.rows;
    const getUserId = async (name) => {
      let m = members.find(m => m.name.toLowerCase() === name.toLowerCase());
      if (m) return m.id;
      
      // Auto-create missing user
      const email = `${name.replace(/\s+/g, '').toLowerCase()}_${Date.now()}@splitnest.local`;
      try {
        const uRes = await pool.query(
          `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
          [name, email, 'dummy_hash']
        );
        const newId = uRes.rows[0].id;
        await pool.query(
          `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
          [group_id, newId]
        );
        members.push({ id: newId, name });
        return newId;
      } catch (e) {
        console.error("Failed to auto-create user", e);
        return null;
      }
    };

    let importedExpenses = 0;
    let importedSettlements = 0;

    for (const row of rows) {
      if (row.skip) continue;

      const payerId = await getUserId(row.proposed.paid_by);
      if (!payerId) {
        console.log("Skipping row, payer not found/created", row.proposed.paid_by);
        continue;
      }

      if (row.proposed.is_settlement) {
        const receiverId = await getUserId(row.proposed.split_with);
        if (receiverId) {
          await pool.query(
            `INSERT INTO settlements (group_id, paid_by, paid_to, amount, settled_at) VALUES ($1, $2, $3, $4, $5)`,
            [group_id, payerId, receiverId, parseFloat(row.proposed.amount), row.proposed.date]
          );
          importedSettlements++;
        }
      } else {
        // Insert Expense
        const expRes = await pool.query(
          `INSERT INTO expenses (group_id, title, amount, currency, paid_by, expense_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [group_id, row.proposed.description, parseFloat(row.proposed.amount), row.proposed.currency, payerId, row.proposed.date]
        );
        const expId = expRes.rows[0].id;

        // Insert Splits
        const splitWith = row.proposed.split_with.split(";").map(s => s.trim());
        const numPeople = splitWith.length;
        if (numPeople > 0) {
          let splitValue = parseFloat(row.proposed.amount) / numPeople;
          
          if (row.proposed.split_type === "percentage" && row.proposed.split_details) {
            const details = row.proposed.split_details.split(";").map(s => s.trim());
            const parsedDetails = details.map(d => {
              const parts = d.split(" ");
              const name = parts[0];
              const pct = parseFloat(parts[1].replace("%", ""));
              return { name, pct };
            });
            const totalPct = parsedDetails.reduce((sum, p) => sum + p.pct, 0);

            for (const p of parsedDetails) {
              const uId = await getUserId(p.name);
              if (uId) {
                const amount = (parseFloat(row.proposed.amount) * (p.pct / totalPct)).toFixed(2);
                await pool.query(`INSERT INTO expense_splits (expense_id, user_id, split_amount) VALUES ($1, $2, $3)`, [expId, uId, amount]);
              }
            }
            importedExpenses++;
            continue;
          } 
          
          if (row.proposed.split_type === "share" && row.proposed.split_details) {
            const details = row.proposed.split_details.split(";").map(s => s.trim());
            const parsedDetails = details.map(d => {
              const parts = d.split(" ");
              const name = parts[0];
              const share = parseFloat(parts[parts.length - 1]);
              return { name, share };
            });
            const totalShares = parsedDetails.reduce((sum, p) => sum + p.share, 0);

            for (const p of parsedDetails) {
              const uId = await getUserId(p.name);
              if (uId) {
                const amount = (parseFloat(row.proposed.amount) * (p.share / totalShares)).toFixed(2);
                await pool.query(`INSERT INTO expense_splits (expense_id, user_id, split_amount) VALUES ($1, $2, $3)`, [expId, uId, amount]);
              }
            }
            importedExpenses++;
            continue;
          }
          
          if (row.proposed.split_type === "unequal" && row.proposed.split_details) {
             const details = row.proposed.split_details.split(";").map(s => s.trim());
             for (const d of details) {
               const parts = d.split(" ");
               const name = parts[0];
               const amt = parseFloat(parts[parts.length - 1]);
               const uId = await getUserId(name);
               if (uId) {
                 await pool.query(`INSERT INTO expense_splits (expense_id, user_id, split_amount) VALUES ($1, $2, $3)`, [expId, uId, amt]);
               }
             }
             importedExpenses++;
             continue;
          }

          // Default Equal
          for (const name of splitWith) {
            const uId = await getUserId(name);
            if (uId) {
              await pool.query(`INSERT INTO expense_splits (expense_id, user_id, split_amount) VALUES ($1, $2, $3)`, [expId, uId, splitValue.toFixed(2)]);
            }
          }
          importedExpenses++;
        }
      }
    }

    res.status(200).json({ message: "Import successful", importedExpenses, importedSettlements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  analyzeCSV,
  confirmImport
};