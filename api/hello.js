const requestHandler = (req, res) => {
  return res.status(200).send({
    success: true,
    message: "API endpoint is working.",
  });
};
exports.execute = requestHandler;
