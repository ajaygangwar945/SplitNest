const fs = require("fs");
const csv = require("csv-parser");
const pool = require("../config/db");

const importCSV = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const rows = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        
        try {
          let imported = 0;
          let anomalies = 0;

          for (const row of rows) {
            // Check for missing payer
            if (!row.paid_by) {
              await pool.query(
                `
                INSERT INTO import_logs
                (anomaly_type, description, action_taken)
                VALUES ($1,$2,$3)
                `,
                [
                  "MISSING_PAYER",
                  row.description || "Unknown",
                  "Rejected"
                ]
              );
              anomalies++;
            } else {
              // If we were inserting valid rows into an expenses table, we'd do it here
              imported++;
            }
          }

          res.status(200).json({
            message: "Import complete",
            total_rows: rows.length,
            imported_rows: imported,
            anomalies_found: anomalies
          });

        } catch (dbError) {
          console.error(dbError);
          res.status(500).json({ message: "Database error during import" });
        }

      });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

module.exports = {
  importCSV
};