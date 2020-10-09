const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql'); 
const e = require('express');
require('dotenv').config();
const DB = require('./DBscripts');




const con = DB.getConnection();

function init() 
{
	DB.connect(() => 
	{
		DB.setUp(() => 
		{
			DB.createDefaultUsers();
		});

	});
}


const app = express();
const port = process.env.PORT || 6548;

app.use(cors());


init();
app.listen(port, () => console.log(`Listening on port ${port}`));


/**
 * 
 * 
 * @param {Request} req - Request recieved from express
 * @param {function (data)} callback - Function to call when finished, with data in arguments
 */
function handleLogin(req, callback)
{
	var user = req.query.username; 
	var pass = req.query.password;

	console.log("Username:" + user + ", Password:" + pass);
	console.log("QUERY OF: " + "SELECT * FROM users WHERE username=\"" + user + "\" AND WHERE password=\"" + pass + "\"");
	var response = {logined: false};
	con.query("SELECT * FROM users WHERE (username=\"" + user + "\" OR email=\"" + user + "\") AND password=\"" + pass + "\"", (err, res) => 
	{ 
		if(err)
			console.log("ERROR");
		
		

		if(res.length > 0 )
		{

			let query = "SELECT * FROM profiles WHERE id=" + res[0].ID;
			con.query(query, (err, res) => 
			{ 
				if(err)
					console.log("ERROR: " + err.message);
				else
				{
					console.log(res[0].name + " has logined");
					response = {logined: true, id: 1, res};
					console.log("resp:" + response);
					
					callback(response)
				}
			});
		}
		else 
		{
			console.log("ENDED UP IN ELSE BRACKET (it shouldn't) ");
			response = {logined: false};
		}
		

	});

}

app.get('/login', (req, res) => 
{

	handleLogin(req, (ans) => {
		res.send(ans);

	});
	
  	
});

app.get("/validation", (req, res) =>{
	console.log("Validation:" + req.url );
	if(req.query.user)
	{
		con.query("SELECT username FROM users WHERE username=\"" +  req.query.user + "\"", (err, result) => {
			if(err)
				console.log("Error at validating username: " + req.query.user + ", message:" + err.message);
			else
			{
				res.send({exists : (result.length > 0) });
			}

		});
	}
	else if(req.query.mail)
	{
		console.log("For email: " + req.query.mail)
		con.query("SELECT email FROM users WHERE email=\"" +  req.query.mail + "\"", (err, result) => {
			if(err)
				console.log("Error at validating mail: " + req.query.mail + ", message:" + err.message);
			else
			{
				res.send({exists : (result.length > 0) });
			}

		});
	}
	
});
app.get('/register', (req, res) => 
{
	console.log("REGISTER INCOMING: " + req.url);


	handle(req, (ans) => {
		res.send(ans);

	});
	
  	
});



