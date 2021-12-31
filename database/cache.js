const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const colors = require("colors");
const { promisify } = require("util");

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  auth_pass: process.env.REDIS_PASSWORD,
});

client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;
const scan = promisify(client.scan).bind(client);

client.on("connect", function () {
  console.log(
    `\n 🗄  ${colors.bgBlue("Conectado a Redis")}`,
    process.env.REDIS_HOST
  );
});

client.on("error", function (e) {
  console.log("error connect to redis", e);
});

// mongoose.Query.prototype.cache = function (options = { time: 5 }) {
//   this.useCache = true;
//   this.time = options.time;
//   console.log(options.key || this.mongooseCollection.name);
//   this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);
//   return this;
// };

// mongoose.Query.prototype.exec = async function () {
//   try {
//     if (!this.useCache) {
//       return await exec.apply(this, arguments);
//     }

//     // const key = JSON.stringify({ ...this.getQuery() });
//     const key = JSON.stringify(
//       Object.assign({}, this.getQuery(), {
//         collection: this.mongooseCollection.name,
//       })
//     );
//     console.log("key", key);

//     const cacheValue = await client.hget(this.hashKey, key);

//     if (cacheValue) {
//       console.log("Response from Redis", new Date());
//       const document = JSON.parse(cacheValue);
//       if (Array.isArray(document)) {
//         return document.map((d) => {
//           d._id = d.uid;
//           return new this.model(d);
//         });
//       } else {
//         console.log(document);
//         document._id = document.uid;
//         return new this.model(document);
//       }
//     }

//     const result = await exec.apply(this, arguments);
//     client.hset(this.hashKey, key, JSON.stringify(result));
//     client.expire(this.hashKey, this.time);

//     console.log("Response from MongoDB", new Date());
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// };

async function deleteKeysByPattern(key) {
  const [, keys] = await scan(0, "MATCH", key);
  if (keys.length) {
    keys.forEach((key) => client.del(key));
    console.log(` 🛁  Removed ${keys.length} keys`);
  }
}

module.exports = {
  getAsync: promisify(client.get).bind(client),
  setAsync: promisify(client.set).bind(client),
  deleteKeysByPattern,
};
