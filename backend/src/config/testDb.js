const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.ewmdpgndepghphhevoov:8989SplitNest12@@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });
client.connect().then(() => client.query(`
DROP TABLE IF EXISTS settlements;
CREATE TABLE settlements (
  id SERIAL PRIMARY KEY,
  group_id INT REFERENCES groups(id),
  paid_by INT REFERENCES users(id),
  paid_to INT REFERENCES users(id),
  amount DECIMAL(10,2),
  settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`)).then(() => { console.log('Table fixed'); client.end(); }).catch(console.error);