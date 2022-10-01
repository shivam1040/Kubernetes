const keys=require('./keys');
//express setup
const express=require('express');
const bodyParser=require('body-parser');
//cross origin request
const cors=require('cors');

const app=express();
app.use(cors());
app.use(bodyParser.json());

//postgres client setup
const{Client}=require('pg');
const pgClient=new Client({
    user:"postgres",
    host:"postgres",
    database:"postgres",
    password:"password",
    port:5432
});

  pgClient
  .connect()
  .then(() => console.log('connected'))
  .catch(err => console.error('connection error', err.stack))
pgClient.on('error', ()=>console.log("lost pg"));

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)', (err, res)=>{
    if(!err)
        console.log("create!")
    else
        console.log("notcreate!")
})

//redis client
const redis=require('redis');
const redisClient=redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: ()=>1000
});
const redisPublisher=redisClient.duplicate();

//express route
app.get('/', (req, res)=>{
    res.send('Hi');
});
app.get('/values/all', async (req, res1)=>{
    const values=await pgClient.query('SELECT * FROM values');
    res1.send(values.rows);
});
app.get('/values/current', async(req, res)=>{
    redisClient.hgetall('values', (err, values)=>{
        res.send(values);
    });
});

app.post('/values', async(req, res)=>{
    const index=req.body.index
    if(parseInt(index)>40){
        return res.status(422).send('Index high');
    }
    redisClient.hset('values', index, 'Nothing');
    //this publishes an insert event and since worker process is listening to events so it will start calculating fib
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({working:true});
});
//listening on port 5000
app.listen(5000, err=>{
    console.log('listening')
});