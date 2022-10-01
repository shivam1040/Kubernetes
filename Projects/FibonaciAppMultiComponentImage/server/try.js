const{Client}=require('pg');
const pgClient=new Client({
    user:"postgres",
    host:"127.0.0.1",
    database:"postgres",
    password:"password",
    port:5432
});

pgClient.connect()

pgClient.query('SELECT * FROM values', (err, res)=>{
    if(!err)
        console.log(res.rows);
    else
        console.log(err.message)
    pgClient.end;
})