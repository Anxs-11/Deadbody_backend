const URI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@ac-e6yaoe5-shard-00-00.ixuw5fa.mongodb.net:27017,ac-e6yaoe5-shard-00-01.ixuw5fa.mongodb.net:27017,ac-e6yaoe5-shard-00-02.ixuw5fa.mongodb.net:27017/?ssl=true&replicaSet=atlas-13pser-shard-0&authSource=admin&retryWrites=true&w=majority`;
const Mongodb = require("mongodb");

const get = async (req) => {
  const client = new Mongodb.MongoClient(URI);
  const database = req.query.database;
  const collection = req.query.collection;
  delete req.query["database"];
  delete req.query["collection"];
  // //comment this return statement to bypass database user check.
  return {
    token: "123",
    success: true,
    "login-success": true,
    message: "login successfull",
  }
  if (req.query.username === "" || req.query.password === "") {
    return {
      token: "",
      success: true,
      "login-success": false,
      message: "login failed",
    };
  }
  if (
    req.query._id !== "" &&
    req.query._id !== undefined &&
    req.query._id !== null
  ) {
    req.query._id = Mongodb.ObjectID(req.query._id);
  }
  let token = "";
  try {
    await client.connect();
    const db = client.db(database);
    const usersCollection = await db
      .collection(collection)
      .find(req.query)
      .toArray();
    if (usersCollection.length !== 1) {
      return {
        token: "",
        success: true,
        "login-success": false,
        message: "login failed! invalid user.",
      };
    }
    token = usersCollection[0]._id.toString();
  } catch (err) {
    console.log(err);
    return {
      token: "",
      success: false,
      "login-success": false,
      message: `server error: ${err}`,
    };
  }
  return {
    token: token,
    success: true,
    "login-success": true,
    message: "login successfull",
  };
};
const post = async (req) => {
  const client = new Mongodb.MongoClient(URI);
  const database = req.body.database;
  const collection = req.body.collection;
  delete req.body["database"];
  delete req.body["collection"];
  let id;
  try {
    await client.connect();
    const db = client.db(database);
    for (var i = 0; i < req.body.checkKey.length; i++) {
      const Key = req.body.checkKey[i];
      const checkObject = {};
      checkObject[Key] = req.body[Key];
      const checkResponse = await db
        .collection(req.body.checkCollection[i])
        .find(checkObject)
        .toArray();
      console.log(
        `${checkResponse.length} ${req.body.checkValue[i]} ${req.body.checkCollection[i]}`
      );
      if (checkResponse.length !== req.body.checkValue[i]) {
        return {
          success: false,
          message: req.body.checkMessage[i],
        };
      }
    }
    let storeObject = {};
    req.body.insert.forEach((Key) => {
      storeObject[Key] = req.body[Key];
    });
    id = await db.collection(collection).insertOne(storeObject);
    id = id.insertedId;
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: `server error: ${err}`,
    };
  }
  return {
    success: true,
    message: "data inserted successfully",
    key: id,
  };
};

async function requestHandler(req, res) {
  var response;
  switch (req.method) {
    case "GET":
      response = await get(req);
      break;
    case "POST":
      response = await post(req);
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
