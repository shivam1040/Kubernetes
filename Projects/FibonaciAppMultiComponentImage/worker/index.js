const keys = require('./keys');
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    //retry once every 1000 secs
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index){
    if(index<2) return 1;
    return fib(index-1)+fib(index-2);
}
//calling callback function whenever new input/message is recieved
sub.on('message', (channel, message)=>{
    //process message for fib, insert returned value at message key
    redisClient.hset('values', message, fib(parseInt(message)));
});

//watcher for new messages/inputs inserted in redis, specified event name is insert in server package
sub.subscribe('insert');
