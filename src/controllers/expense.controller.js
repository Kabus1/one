const Video = require("../models/video-quality");

const expenseController = {};

expenseController.index = async (req, res, next) => {
  try {
    const videos = await Video.find();
    return res.json(videos);
  } catch (err) {
    res.status(500).send({
      error: "error",
    });
  }
};

expenseController.create = async (req, res, next) => {
  const { title, Description, HD, SD } = req.body;
  const { file } = req;
  const newMovie = new Video({
    title,
    Description,
    HD,
    SD,
    receipt: (file && file.filename) || null,
  });

  if (!user.verified) {
    const Admin = await Token.findOne({ users: isAdmin });
  }

  try {
    const saved = await newMovie.save();
    return res.send({
      success: true,
      movie: saved,
    });
  } catch (e) {
    next(e);
  }
};

expenseController.update = async (req, res, next) => {
  const video_Id = req.params.video_Id;
  const { title, Description, HD, SD, receipt } = req.body;

  try {
    const video = await Video.update(
      { _id: video_Id },
      { title, Description, HD, SD, receipt }
    );
    return res.send({
      success: true,
      video,
    });
  } catch (e) {
    next(e);
  }
};

expenseController.delete = async (req, res) => {
  const video_Id = req.params.video_Id;

  try {
    await Video.deleteOne({ _id: video_Id });
    res.send({
      success: true,
      message: "Deleted video",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

expenseController.show = async (req, res) => {
  const video_Id = req.params.video_Id;

  try {
    const video = await Video.findById({ _id: video_Id });
    return res.send(video);
  } catch (err) {
    res.status(500).send({
      error: "an error has occured trying to fetch the video",
    });
  }
};

module.exports = expenseController;
