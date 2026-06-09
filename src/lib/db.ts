import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

const sql = postgres(connectionString, {
  ssl: 'require',
  prepare: false, // requerido para Neon pooler
})

export default sql
