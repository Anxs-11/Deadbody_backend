var multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, `${req.query.key}_${file.originalname}`);
  },
});

var upload = multer({ storage: storage }).single("file");

const requestHandler = async (req, res) => {
  await upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(200).send({
        success: false,
        message: "server error",
      });
    }
    return res.status(200).send({
      success: true,
      message: "File uploaded successfully.",
    });
  });
  return true;
};
exports.execute = requestHandler;
