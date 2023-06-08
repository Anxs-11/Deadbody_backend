const URI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@ac-e6yaoe5-shard-00-00.ixuw5fa.mongodb.net:27017,ac-e6yaoe5-shard-00-01.ixuw5fa.mongodb.net:27017,ac-e6yaoe5-shard-00-02.ixuw5fa.mongodb.net:27017/?ssl=true&replicaSet=atlas-13pser-shard-0&authSource=admin&retryWrites=true&w=majority`;
const Mongodb = require("mongodb");

const get = async (req) => {
  const client = new Mongodb.MongoClient(URI);
  const database = req.query.database;
  const collection = req.query.collection;
  delete req.query["database"];
  delete req.query["collection"];
  let dataCollection;
  try {
    await client.connect();
    const db = client.db(database);
    dataCollection = await db
      .collection(collection)
      .find(req.query)
      .toArray();
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: `server error: ${err}`,
    };
  }
  return {
    success: true,
    data: dataCollection,
  };
};

async function requestHandler(req, res) {
  var response;
  switch (req.method) {
    case "GET":
      response = await get(req);
      break;
    default:
      response = {
        success: false,
        message: "Invalid request type !!!",
      };
      break;
  }
  console.log(`sending: ${response}`);
  return res.status(200).json(response);
}
exports.execute = requestHandler;
