const express = require("express");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt"); 
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRouter = express.Router();

var userDetails;

// github API endpoint

// const github_client_id = process.env.github_client_id;
// const github_clint_secret = process.env.github_client_secret;

const client_id =  "7985eda3cc93ebd0ce4a";    //"e969e0187a8b8ce20b01"
const client_secret = "cfe2589b9802b27d935a578e88af6eb24a017195";

// authRouter.get("/github", async (req, res) => {
// 	const { code } = req.query;
// 	console.log(code);
// 	const accessToken = await fetch(
// 		"https://github.com/login/oauth/access_token",
// 		{
// 			method: "POST",
// 			headers: {
// 				Accept: "application/json",
// 				"content-type": "application/json",
// 			},
// 			body: JSON.stringify({
// 				client_id: client_id,
// 				client_secret: clint_secret,
// 				code: code,
// 			}),
// 		}
// 	).then((res) => res.json());
// 	console.log(accessToken);

// 	const user = await fetch("https://api.github.com/user", { 
// 		method: "GET",
// 		headers: {
// 			Authorization: "Bearer " + accessToken.access_token,
// 		},
// 	})
// 		.then((res) => res.json())
// 		.catch((err) => console.log(err));

// 	console.log(user);
//     userDetails = user

// 	res.send("Sign in with github successfully");
// });
//github updated code 
authRouter.get("/github", async (req, res) => {
	const { code } = req.query;
	console.log(code);
	try {
	  const accessToken = await fetch(
		"https://github.com/login/oauth/access_token",
		{
		  method: "POST",
		  headers: {
			Accept: "application/json",
			"content-type": "application/json",
		  },
		  body: JSON.stringify({
			client_id: client_id,
			client_secret: client_secret,
			code: code,
		  }),
		}
	  ).then((res) => res.json());
  
	  console.log(accessToken);
  
	  const user = await fetch("https://api.github.com/user", {
		method: "GET",
		headers: {
		  Authorization: "Bearer " + accessToken.access_token,
		},
	  }).then((res) => res.json());
  
	  console.log(user);
	  userDetails = user; // Store the user details
  
	  res.redirect("/auth/github/success"); // Redirect to the success endpoint after authentication
	} catch (err) {
	  console.error("GitHub API Error:", err.message);
	  res.status(500).send("Failed to authenticate with GitHub.");
	}
  });
  
  authRouter.get("/github/success", (req, res) => {
	res.send(userDetails); // Send the stored user details here 
  });
// google API endpoint




const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GOOGLE_CLIENT_ID =
	"608771081220-on5gm9g8uhhek2ednjcnieqvcl5iif98.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			callbackURL: "http://localhost:8080/auth/google/callback",
			passReqToCallback: true,
		},
		async function (request, accessToken, refreshToken, profile, done) {
            userDetails = profile

            let email = profile._json.email;
            let name = profile._json.name;
            let password = profile._json.given_name
            let user = await UserModel.findOne({ email });
            if(!user){
                bcrypt.hash(password, 5, async (err, hash) => {
                    const user = new UserModel({ email, password: hash, name });
                    console.log(user);
                    await user.save();
                });
            }
            return done(null, profile);
		}
	)
);

authRouter.get(
	"/google",
	passport.authenticate("google", { scope: ["email", "profile"] })
);

authRouter.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: "/auth/google/success",
		failureRedirect: "/auth/google/failure",
        session: false
	}),
    function (req,res){
        console.log(req.user)
        res.redirect("/")
    }
);
authRouter.get('/google/success', (req, res) => {
    res.send(userDetails)
  }) 
  authRouter.get('/profile', (req, res) => res.send(userProfile));





module.exports = {
	authRouter,
}; 
