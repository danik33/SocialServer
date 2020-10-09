const { json } = require('body-parser');
const mysql = require('mysql'); 
require('dotenv').config();


const con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASS
  });

/**
 * ENUM to use to update profile rows
 * 
 */
const PROFILECOLUMNS = {
	name : "name",
	lastname : "lastname", 
	gender : "gender",
	birthdate : "birthdate",
	country : "country",
	city : "city",
	phone : "phone"

}

/**
 * Connects to database
 * @param {function} callback function to be called upon connecting 
 */
function connect(callback) 
{
    con.connect((err) => 
    {

        if(err)
        {
            console.log("Couldn't connect to db");
            console.log(err);
        }
        else
        {
            console.log("Connected to db successfully");
            callback();
        }

    });
}


/**
 * Set up the datebase, and the tables
 * if they do not exist
 */
function  setUpDatabase(callback)       
{
    
	let flag = true;
	console.log("\nDatabase tables setup:");
	console.log("-----------------------");
	con.query("CREATE DATABASE IF NOT EXISTS TOODO", (err, res) => {
		if(err)
		{
			console.log("Couldn't create database" + err.message);
			flag = false;
		}
		else
		{
			con.query("USE TOODO");

			console.log("Database set.")
			createTableProfiles(flag, callback);

			
		}

	}); 

}



function createTableProfiles(flag, callback) 
{
    con.query
    (   "CREATE TABLE IF NOT EXISTS profiles (" +
        "ID int not null," + 
        "name varchar(20)," +
        "lastname varchar(20)," +
        "gender bool," +  
        "birthdate varchar(50)," + 
        "country varchar(30)," +  
        "city varchar(30)," +
        "phone varchar(15)," + 
        "unique(ID))" , (err, res) => 
        {
        if(err)
        {
            console.log("Couldn't create profile table: " + err.message);
            flag = false;
        }
        
        console.log("Profiles set.");

        createTableUsers(flag, callback);
        
        
            
    });

}
function createTableUsers(flag, callback)
{
    con.query("CREATE TABLE IF NOT EXISTS users (" +
                "username varchar(20)," +
                "email varchar(30)," +
                "password VARCHAR(40)," +
                "creationDate varchar(50)," +
                "ID int auto_increment primary key," +
                "unique(username, email))", (err, res) => {
            if(err)
            {
                flag = false;
                console.log("Couldn't create users table: " + err.message);
            }
            
                
            console.log("Users set.");
            createTableTasks(flag, callback);
            
    });
}


function createTableTasks(flag, callback)
{
    con.query("CREATE TABLE IF NOT EXISTS tasks (" +
                "taskid int auto_increment primary key," +
                "creationTime varchar(70), " +
                "belongingid int not null," +
                "title varchar(20) not null," +
                "description varchar(255)," +
                "completed bool," +
                "deadline varchar(70)," +
                "failondead bool," +
                "completeondead bool," + 
                "count int," +  
                "countString varchar(40))", 
                (err, res) => 
                {
                    if(err)
                    {
                        console.log("Error at creating tasks table: " + err.message );
                    }
                    else
                    {
                        console.log("Tasks set.");
                    }

                    createTableFriends(flag, callback);
                    
                    
                });

}

function createTableFriends(flag, callback)
{

    con.query("CREATE TABLE IF NOT EXISTS friends(userID int, friendID int, addedAt varchar(70), unique(userID, friendID) )", (err, data) => 
    {
        if(err)
        {
            console.log("Error at creating friends table: " + err.message);
            flag = false;
        }
        else
        {
            console.log("Friends set.");
        }
        
        createTableMessages(flag, callback);
    });
}

function createTableMessages(flag, callback)
{
    con.query("CREATE TABLE IF NOT EXISTS messages(userID int, toFriendID int, sentAt varchar(50), message varchar(5000))", (err, data) => {
        if(err)
        {
            console.log("Error at creating chat table: " + err.message);
            flag = false;
        }
        else 
        {
            console.log("Messages set.");
        }
        finishTables(flag, callback);
    });
}

function finishTables(flag, callback)
{
    console.log("-----------------------");
    if(flag)
    {
        console.log("Everything was set successfully");
        callback();
    }
    else
        console.log("Error at setting the database");
}


/**
 * Adds a friend to a person 	
 * @param {int/string} ID ID or the username of the person that adds friend  
 * @param {int/string} friendID ID or the username of the person to add 
 */
function addFriend(ID, friendID)
{
    if(ID && friendID)
    {
        var finalID, finalFriend;
        if(typeof ID == "string")
        {
            getID(ID, (id) => 
            {
                finalID = id;
            });
        }
        else if(typeof ID == "number")
            finalID = ID;
    
        if(typeof friendID == "string")
        {
            getID(friendID, (id) => 
            {
                finalFriend = id;
            });
        }
        else if(typeof friendID == "number")
            finalFriend = friendID;
        

        con.query("INSERT INTO friends values(" + finalID + ", " + finalFriend + ", " + JSON.stringify(new Date()) + ")", (err, data) => {
            if(err)
            {
                console.log("Error at adding friend: " + err.message);
            }
            
        });
    }
    else
    {
        console.log("Arguments not right: " + ID + ", " + friendID);
    }
	
	
}

/** Users with some tasks that are created with everyting to debug
 *  Obviously will be deleted later
 */
function createDefaultUsers()
{
    var alreadyExist = false;
    getID("vladi33", (vlaid) => {
        if(vlaid)
        {
            alreadyExist = true;
        }
        if(!alreadyExist)
        {
            console.log("Doesn't exist, creating");
            insertUser("vladi33", "vlad@gmail.com", "semen", () => 
            {
                insertUser("danek", "danik@gmail.com", "951235789", () => 
                {


                    getID("vladi33", (id) => 
                    {
                        defineUser(id, "Vladi", "Semyonov", new Date(1895, 5, 12), true, "Israel", "Haifa");
                        
                        getID("danek", (danekID) => 
                        {

                            addFriend(id, danekID);
                        });

                        insertTimeTask(id, "Cook dinner", "I might want to cook dinner in this year", new Date(2021, 0, 1), true, false);
                        insertTimeTask(id, "New year", "Gotta wait for the new year", new Date(2021, 0, 1), false, true);
                        insertSimpleTask(id, "I need to shit", "It's good to shit at least once a day");
                        insertCountTask(id, "Kill people", "Less people - less pollution", 100, " people dead");

                    });

                    



                    getID("danek", (id) => {
                        defineUser(id, "Danek", "Terosh", new Date(2001, 7, 18), true, "Israel", "Haifa");
                        getID("vladi33", (vladiID) => {
                            addFriend(id, vladiID);
                        });
                        insertTimeTask(id, "Cook dinner", "I might want to cook dinner in this year", new Date(2021, 0, 1), true, false);
                        insertTimeTask(id, "New year", "Gotta wait for the new year", new Date(2021, 0, 1), false, true);
                        insertSimpleTask(id, "I need to shit", "It's good to shit at least once a day");
                        insertCountTask(id, "Kill people", "Less people - less pollution", 100, " people dead");

                    });

                });

            });
        }
        else
        {
            console.log("Users exist, it's all cool");

        }

    });

    
}

/**
 * Defines all what there is to define in a user in one function
 * @param {int} id 
 * @param {string} name 
 * @param {string} lastname 
 * @param {Date} birthdate 
 * @param {boolean} gender 
 * @param {string} country 
 * @param {string} city 
 */
function defineUser(id, name, lastname, birthdate, gender, country, city)
{
    updateUser(id, PROFILECOLUMNS.name, name);
    updateUser(id, PROFILECOLUMNS.lastname, lastname);
    updateUser(id, PROFILECOLUMNS.birthdate, JSON.stringify(birthdate));
    updateUser(id, PROFILECOLUMNS.gender, gender);
    updateUser(id, PROFILECOLUMNS.country, country);
    updateUser(id, PROFILECOLUMNS.city, city);
    
  

}

/**
 * Gets ID by username
 *  
 * @param {string} username the username of person to get ID 
 * @param {function} callback callback function that called with the data in the parameter 
 */
function getID(username, callback)
{
	con.query("SELECT ID FROM users WHERE username='" + username + "'", (err, data) => {
		if(err || data.length == 0)
		{
            callback();
		}
		else 
		{
            
			callback(data[0].ID);
		}

	});
}

/**
 * Adding columns to profile instance
 * 
 * 
 * @param {int} ID ID of the profile to edit
 * @param {string} what Which column to edid, checkout PROFILECOLUMNS const 
 * @param {*} TO The value that will be assigned
 */
function updateUser(ID, what, to) 
{
	if(what != PROFILECOLUMNS.birthdate && (typeof to) == "string")
	{
		to = "'" + to + "'";
	}
	con.query("UPDATE profiles SET " + what + "=" + to +" WHERE ID=" + ID, (err, data) => {
		if(err)
		{
			console.log("Error at updating user: " + ID);
		}

	});

}

/**
 * Inserts a user into users table, and then inserts the ID in to the profile table to be edited later
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 */
function insertUser(username, email, password, callback)
{
	con.query("INSERT INTO users (username, email, password, creationDate) VALUES ('" +
	username + "', '" +
	email + "', '" +
	password + "', '" + 
	JSON.stringify(new Date()) + "')", (err, data) => {
		if(err)
		{
			if(!err.message.includes("ER_DUP_ENTRY"))
				console.error("Error at inserting user: " + username + ", " + err.message);
			else
				console.log("User exists");
		}
		else
		{
			con.query("select ID from users WHERE username='" + username + "'", (err, data) => {

				if(err)
				{
					console.error("Error at inserting user: " + username);
				}
				else
				{
					con.query("INSERT INTO profiles (ID) values(" + data[0].ID + ")", (err, data) => {
						if(err)
						{
							console.error("Error at inserting profile: " + err.message);
						}
						else
						{
                            console.log("Inserted user successfully (" + username + ")");
                            callback();
						}
					});

				}
				

			});
		}

	});

}


/**
 * Inserts into the database a simple task with the given parameters
 * 
 * @param {int} userID id of the user that the task belongs to  
 * @param {string} title title of the task 
 * @param {string} description description of the task 
 */
function insertSimpleTask(userID, title, description)
{
	con.query("INSERT INTO tasks (belongingid, creationTime, title, description) VALUES(" + userID + ", " + JSON.stringify(new Date()) + ", \"" + title + "\", \"" + description + "\")", (err, data) => {
		if(err)
		{
			console.log("Error at inserting simple task: " + err.message);
		}

	});
}

/**
 * Inserts a count task
 * 
 * @param {int} userID ID of the user the task belongs to
 * @param {string} title Title of the task
 * @param {string} description Description of the task
 * @param {int} count  Amount of the thing to do //probably should be double just in case
 * @param {string} countString The thing to do (E.g 10 {Sausages to cut})
 */
function insertCountTask(userID, title, description, count, countString)
{
	con.query("INSERT INTO tasks (belongingid, creationTime, title, description, count, countString) VALUES(" + 
    userID + ", " + 
    JSON.stringify(new Date()) + ", \"" +
	title + "\", \""  +
	description + "\"," +
	count + "," + "\"" +
	countString + "\")", (err, data) => {
		if(err)
		{
			console.log("Error at inserting count task ");
		}

	});
}


/**
 *  Inserts a timed task into the database
 * 
 * @param {int} userID ID of the user that the task belongs to 
 * @param {string} title title of the task
 * @param {string} description description of the task
 * @param {Date} deadline deadline of the task, in Date object
 * @param {boolean} failondead the task will be marked as failed when time expires
 * @param {boolean} doneondead the task will be marked as done when time expires
 */
function insertTimeTask(userID, title, description, deadline, failondead, doneondead)
{
	con.query("INSERT INTO tasks (belongingid, creationTime, title, description, deadline, failondead, completeondead) VALUES(" + 
    userID + ", " + 
    JSON.stringify(new Date()) + ", '" +
	title + "', " + "'" +
	description + "', '" +
	deadline + "'," +
	failondead + "," + 
	doneondead + ")", (err, data) => {
		if(err)
		{
			console.log("Error at inserting timed task: " + err.message);
		}

	});

}


exports.connect = connect;
exports.Columns = PROFILECOLUMNS;
exports.addTimeTask = insertTimeTask;
exports.addCountTask = insertCountTask;
exports.addSimpleTask = insertSimpleTask;
exports.addUser = insertUser;
exports.updateUser = updateUser;
exports.getID = getID;
exports.createDefaultUsers = createDefaultUsers;
exports.addFriend = addFriend;
exports.setUp = setUpDatabase;
exports.getConnection = () => { return con; }