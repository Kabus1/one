const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const Token = require("../models/UserVerification");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const userController = {};

userController.regisetr = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({
    name,
    email,
    password,
  });
  try {
    const user = await newUser.save();

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const url = `
    Please verify your mail to continue ...
    ${process.env.URI}api/v1/${user.id}/verify/${token.token}
    `;
    await sendEmail(user.email, "Verify Email", url);

    res
      .status(201)
      .send({ message: "An Email sent to your account please verify" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

userController.login = async (req, res, next) => {
  //Username, password in request
  const { email, password } = req.body;
  try {
    //Retrieve user information
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error(`The email ${email} was not found on our system`);
      err.status = 401;
      return next(err);
    }
    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `
        Please verify your mail to continue ...
        <a href="${process.env.URI}api/v1/${user.id}/verify/${token.token}">verify</a>
        `;
        await sendEmail(user.email, "Verify Email", url);
      }
      return res
        .status(400)
        .send({ error: "An Email sent to your account please verify" });
    }

    //Check the password
    user.isPasswordMatch(password, user.password, (err, matched) => {
      if (matched) {
        //Generate JWT
        const secret = process.env.JWT_SECRET;
        const expire = process.env.JWT_EXPIRATION;

        const token = jwt.sign(
          { _id: user._id, isAdmin: this.isAdmin },
          secret,
          {
            expiresIn: expire,
          }
        );
        return res.send({ token });
      }

      res.status(401).send({
        error: "Invalid username/password combination",
      });
    });
  } catch (e) {
    next(e);
  }
};

userController.verify = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    await User.updateOne({ _id: user._id, verified: true });
    await token.remove();

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

userController.verified = async (req, res) => {
  res.render("verified");
}

userController.me = (req, res, next) => {
  const { user } = req;
  res.send({ user });
};

module.exports = userController;
