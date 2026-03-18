import psycopg2

conn = psycopg2.connect('dbname=pvg_auth user=postgres password=sai123 host=localhost port=5432')
cur = conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';")
for row in cur.fetchall():
    print(f'{row[0]} ({row[1]})')
