var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
const fs = require("fs");
const Database = require("./src/database.js");
const e = require("express");
const { request } = require("http");
const { response } = require("express");
const { stringify } = require("querystring");
const { DB_URI } = require("./src/dev.js");
const zipCodeData = require("zipcode-city-distance");
const moment = require("moment");

const router = express.Router();

var app = express();
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

////////////////////////////////
//gets
////////////////////////////////

app.get("/", function (request, response) {
  response.render("login.ejs", {
    error: null,
  });
});

app.get("/home", function (request, response) {
  if (request.session.loggedin) {
    response.render("home.ejs", {
      status: "Welcome " + request.session.username,
    });
  } else {
    response.send("you need to be signed in to see this page");
  }
});

app.get("/account", function (request, response) {
  if (request.session.loggedin) {
    const db = new Database();
    async function account() {
      try {
        var obj = await db.getUser(request.session.username);

        response.render("account.ejs", {
          win: obj[1].win,
          loss: obj[1].loss,
          user: obj[1].user,
          ongoingTournament: obj[1].ongoingTournament,
        });
      } catch (e) {
        response.render(errorpage);
      }
    }
    account();
  } else {
    response.send("you need to be signed in to see this page");
  }
});

//register no
app.get("/register", function (request, response) {
  response.render("registration.ejs", {
    error: null,
  });
});

app.get("/tournamentregister", function (request, response) {
  if (request.session.loggedin) {
    response.render("tournamentregister.ejs", {
      error: null,
    });
  } else {
    response.send("you need to be signed in to see this page");
  }
});

app.get("/allTournaments", function (request, response) {
  if (request.session.loggedin) {
    var id = request.query.id;

    //console.log(id);
    async function allT() {
      const db = new Database();
      var tournaments = await db.allTourn();
      //for (tournaments.time > Date.now()){
      //now do tournament.time to make new obj containing proper ones to display
      //};
      //add time verfication from tournaments
      if (id == null) {
        validtourns = [{}];
        for (i = 1; i < tournaments.length; i++) {
          //tournaments[i].zipcode
          // let zipCodeDistance = zipCodeData.zipCodeDistance(zipcodeenter, tournaments[i].zipcode,'M');
          // let tourndate = tournaments[i].date;
          // console.log(mtournaments[i]);//.isAfter(moment()));
          if (moment(tournaments[i].date).isAfter(moment())) {
            validtourns.push({
              name: tournaments[i].name,
              type: tournaments[i].type,
              format: tournaments[i].format,
              style: tournaments[i].style,
              location: tournaments[i].location,
              start: tournaments[i].start,
            });
          }
        }
        response.render("allTournaments.ejs", {
          error: null,
          tournaments: validtourns,
        });
        response.end();
      }

      if (id != null) {
        //need to check if user is already registered if so display an error at top of page and reload
        if (
          (await db.checkUserInTournament(request.session.username, id)) == 0
        ) {
          await db.addusertotournament(request.session.username, id);
          //0name 1time 2date appended like that
          await db.addTournToUser(id, request.session.username);
          response.render("home.ejs", {
            status: "Thank you for registering to " + id,
          });
        } else {
          response.render("allTournaments.ejs", {
            error: "You are already registered to that tournament!",
            tournaments: tournaments,
          });
        }
        //response.render('home.ejs')
        response.end();
        return;
      }
    }
    if (request.session.loggedin) {
      allT();
    } else response.send("Please login to view this page!");
    //start of code to show all avaliable tournaments
    //we need database code to back this up
    //need ejs to display out to user.
  } else {
    response.send("Please login to view this page!");
  }
});

// get for account page about
app.get("/account/About", function (request, response) {
  if (request.session.loggedin) {
    response.render("about.ejs", {});
  } else {
    response.send("Please login to view this page!");
  }
});

app.get("/account/yourTournaments", function (request, response) {
  async function goh() {
    if (request.session.loggedin) {
      const db = new Database();
      var val = await db.allTourn();
      var use = request.session.username;
      //console.log(val[1].registeredToo[0]);
      //once the hit the href we need to go that id tournament and grabs that tournaments info such as registered user and get scores things of that nature
      //on this page tho we should probably display relavent info such as registrered to and what not that makes the most sense
      //such as start time comment things of that nature
      //needs date validation like everything does lol
      var valid = [{}];
      for await (const doc of val) {
        console.log(doc.owner);
        if (use == doc.owner) {
          valid.push({
            name: doc.name,
            date: doc.date,
            start: doc.time,
          });
        }
      }
      //console.log(valid);
      if (request.session.loggedin) {
        response.render("yourTournaments.ejs", {
          tournaments: valid,
          error: null,
        });
      } else {
        response.send("Please login to view this page!");
      }
    }
  }
  goh();
});
app.get("/account/registeredTournament", function (request, response) {
  async function goh() {
    if (request.session.loggedin) {
      const db = new Database();
      var val = await db.getUser(request.session.username);
      //console.log(val[1].registeredToo[0]);
      //once the hit the href we need to go that id tournament and grabs that tournaments info such as registered user and get scores things of that nature
      //on this page tho we should probably display relavent info such as registrered to and what not that makes the most sense
      //such as start time comment things of that nature
      //needs date validation like everything does lol
      var valid = [];
      for (i = 2; i <= val[1].registeredToo.length; i = i + 3) {
        //console.log(val[1].registeredToo[i]);
        //  console.log(moment(val[1].registeredToo[i]).isAfter(moment()));
        if (moment(val[1].registeredToo[i]).isAfter(moment())) {
          valid.push(val[1].registeredToo[i - 2]);
        }
      }
      //console.log(valid);
      response.render("registeredTournament.ejs", {
        tournaments: valid,
        error: null,
      });
    } else {
      response.send("Please login to view this page!");
    }
  }
  goh();
});

app.get("/signout", function (request, response) {
  request.session.loggedin = false;
  response.render("login.ejs", {
    error: null,
  });
});

app.get("/currentTourn", function (request, response) {
  id = request.query.id;
  request.session.lastid = id;
  go();
  async function go() {
    const db = await new Database();
    var obj = await db.getUsersinTourn(id);

    response.render("genericTourn.ejs", {
      error: null,
      users: obj,
    });
    //make function to retrieve database data
    //package data
    //send to html page that has a post for report data
  }
});

app.get("/yourTourn", function (request, response) {
  id = request.query.id;
  request.session.lastid = id;
  go();
  async function go() {
    const db = await new Database();
    var obj = await db.getUsersinTourn(id);

    response.render("genericYourTourn.ejs", {
      error: null,
      users: obj,
    });
    //make function to retrieve database data
    //package data
    //send to html page that has a post for report data
  }
});

app.get("/override", function (request, response) {
  var id = request.session.lastid;
  //console.log("id: " + id);
  try {
    async function go() {
      const db = new Database();
      var members = await db.getUsersinTourn(id);

      //var members = await db.getUsersinTourn(id);
      response.render("override.ejs", {
        members: members,
        error: null,
      });
    }
    go();
  } catch (e) {
    response.status(404).render("/errorpage.ejs");

    console.log("something went wrong");
  } finally {
    //response.end();
    // response.render("home.ejs", {
    // status: "You have started your tournament!",
    //});
  }
});

////////////////////////////////
//posts
////////////////////////////////

app.post("/auth", function (request, response) {
  //need login code
  //async login code please
  var user = request.body.username;
  var pass = request.body.password;

  request.session.username = user;

  async function login() {
    const db = await new Database();
    if (await db.login(user.toString().toLowerCase(), pass)) {
      request.session.loggedin = true;
      response.redirect("/home");
    } else {
      response.render("login.ejs", {
        error: "Password or username is incorrect",
      });
    }
  }
  login();
});

app.post("/register", function (request, response) {
  response.redirect("/register");
});

app.post("/login", function (request, response) {
  response.render("login.ejs", {
    error: null,
  });
});

//code for registration
app.post("/registerUser", function (request, response) {
  try {
    var user = request.body.usernameRegistration;
    var passOne = request.body.passwordFirst;
    var passTwo = request.body.passwordSecond;
    console.log(user, passOne, passTwo);

    async function registration() {
      const db = await new Database();

      //if duplicate username
      //need to make names lower becuase user names are not case sensitive in db
      if (await db.checkUser(user.toLowerCase())) {
        response.render("registration.ejs", {
          error: "Username Exists",
        });
      } else if (passOne != passTwo) {
        //if passwords dont match
        response.render("registration.ejs", {
          error: "Passwords do not match",
        });
      } else {
        //send user to login page upon succesful registration
        await db.addUser(user.toString().toLowerCase(), passOne, null);

        response.render("login.ejs", {
          error: null,
        });
      }
    }
    //database calls need to be done async
    registration();
  } catch (e) {
    response.status(404).render("/errorpage.ejs");

    console.log("something went wrong");
  } finally {
    //response.end();
  }
});

//post for tournament registration
app.post("/registerTournament", function (request, response) {
  try {
    //need verificaiton to see if tournment exists before we go to to register a new one
    //append creation time and date onto name
    //need to check if user has active already
    async function registration() {
      //all from user input post request
      var tName = request.body.tournamentName;
      var type = request.body.type;
      var format = request.body.format;
      var style = request.body.style;
      var location = request.body.location;
      var date = request.body.date;
      var start = request.body.start;
      var zipcode = request.body.zipcode;

      //need to grab username in a different wat
      var username = request.session.username;

      const db = await new Database();

      db.tournamentadd(
        tName,
        type,
        format,
        style,
        location,
        username,
        start,
        date,
        zipcode
      );
    }
    //database calls need to be done async
    registration();
  } catch (e) {
    response.status(404).render("/errorpage.ejs");

    console.log("something went wrong");
  } finally {
    //response.end();
    response.render("home.ejs", {
      status: "Thank you for registering the tournament!",
    });
  }
});

app.post("/distance", function (request, response) {
  if (request.session.loggedin) {
    var id = request.query.id;
    var zipcodeenter = request.body.zipcode;
    var distance = request.body.distancefrom;
    //console.log(zipcodeenter);
    //console.log(id);
    async function allT() {
      const db = new Database();
      var tournaments = await db.allTourn();
      //for (tournaments.time > Date.now()){
      //now do tournament.time to make new obj containing proper ones to display
      //};
      //add time verfication from tournaments
      //console.log(tournaments.length);
      var validtourns = [{}];
      //console.log(tournaments);
      if (id == null) {
        for (i = 1; i < tournaments.length; i++) {
          //tournaments[i].zipcode
          let zipCodeDistance = zipCodeData.zipCodeDistance(
            zipcodeenter,
            tournaments[i].zipcode,
            "M"
          );
          // let tourndate = tournaments[i].date;
          // console.log(mtournaments[i]);//.isAfter(moment()));
          if (
            zipCodeDistance <= distance &&
            moment(tournaments[i].date).isAfter(moment())
          ) {
            validtourns.push({
              name: tournaments[i].name,
              type: tournaments[i].type,
              format: tournaments[i].format,
              style: tournaments[i].style,
              location: tournaments[i].location,
              start: tournaments[i].start,
            });
          }
          //console.log(tournaments[5])
          //  console.log(validtourns)
        }
        response.render("allTournaments.ejs", {
          error: null,
          tournaments: validtourns,
        });
        response.end();
      }

      if (id != null) {
        //need to check if user is already registered if so display an error at top of page and reload
        if (
          (await db.checkUserInTournament(request.session.username, id)) == 0
        ) {
          await db.addusertotournament(request.session.username, id);
          //0name 1time 2date appended like that
          await db.addTournToUser(id, request.session.username);
          response.render("home.ejs", {
            status: "Thank you for registering to " + id,
          });
        } else {
          response.render("allTournaments.ejs", {
            error: "You are already registered to that tournament!",
            tournaments: tournaments,
          });
        }
        //response.render('home.ejs')
        response.end();
        return;
      }
    }
    if (request.session.loggedin) {
      allT();
    } else response.send("Please login to view this page!");
    //start of code to show all avaliable tournaments
    //we need database code to back this up
    //need ejs to display out to user.
  } else {
    response.send("Please login to view this page!");
  }
});

app.post("/start", function (request, response) {
  var id = request.session.lastid;
  console.log("id: " + id);
  try {
    go();
    async function go() {
      const db = new Database();
      var members = await db.getUsersinTourn(id);

      // var members = await db.getUsersinTourn(id);

      // await db.addToListToPlay("New Tourn","user5","user4")
      // l = members.length
      //console.log(Math.floor(l/2))
      var count = 1;
      // console.log(l)
      for (var d = 1; d <= members.length - 1; d++) {
        count = 1;
        //console.log("loop 1 star")
        for (var i = 0; i <= 2; i++) {
          //console.log(i);
          //update 1 and last of lis=0
          //requires a min of 4 players
          //limites to 3 rounds atm

          //populate db with list of players
          if (d + i >= members.length - 1) {
            await db.addToListToPlay(
              id,
              members[d].username,
              members[count].username
            );
            count++;
          } else {
            await db.addToListToPlay(
              id,
              members[d].username,
              members[d + i + 1].username
            );
          }
          // console.log("case 1")

          //to play next
          if (i == 0) {
            if (d + i >= members.length - 1) {
              await db.updatePlayNext(
                id,
                members[d].username,
                members[count - 1].username
              );
            } else
              await db.updatePlayNext(
                id,
                members[d].username,
                members[d + i + 1].username
              );
          }
        }
      }
    }
  } catch (e) {
    response.status(404).render("/errorpage.ejs");

    console.log("something went wrong");
  } finally {
    //response.end();
    response.render("home.ejs", {
      status: "You have started your tournament!",
    });
  }
});

app.post("/override", function (request, response) {
  var wins = request.body.wins;
  var losses = request.body.losses;
  var userto = request.body.userto;

  //console.log(wins + losses + userto)
  var id = request.session.lastid;
  // console.log("id: " + id);
  try {
    async function go() {
      const db = new Database();

      await db.updateWinInTourn(id, userto, wins);
      await db.updateLossInTourn(id, userto, losses);

      //var members = await db.getUsersinTourn(id);

      // var members = await db.getUsersinTourn(id);

      // await db.addToListToPlay("New Tourn","user5","user4")
      // l = members.length
      //console.log(Math.floor(l/2))
      //  var count = 1;
    }
    go();
  } catch (e) {
    response.status(404).render("/errorpage.ejs");

    console.log("something went wrong");
  } finally {
    //response.end();
    response.render("home.ejs", {
      status: "You have updated " + userto + " in your tournament!",
    });
  }
});

app.post("/selfreport", function (request, response) {
  var wins = parseInt(request.body.wins);
  var losses = parseInt(request.body.losses);

  //var userto = request.body.userto;
  var user = request.session.username;
  //console.log(wins + losses + userto)
  var id = request.session.lastid;
  // console.log("id: " + id);
  var statusreport = "default";
  try {
    async function go() {
      const db = new Database();

      var use = await db.getUSerDataFromTorun(id, user);
      if (use[1].playnext != "User Finished") {
        // console.log(user + " " + id)
        //  console.log(use[1].wins + " " + use[1].losses);
        //update user 1
        await db.updateWinInTourn(id, user, wins + use[1].wins);
        await db.updateLossInTourn(id, user, losses + use[1].losses);

        var otheruser = await db.getUSerDataFromTorun(id, use[1].playnext);
        //update user2
        await db.updateWinInTourn(
          id,
          otheruser[1].user,
          losses + otheruser[1].wins
        );
        await db.updateLossInTourn(
          id,
          otheruser[1].user,
          wins + otheruser[1].losses
        );

        /////////////////
        //
        //////////////////
        var update;
        var update2;
        //advance the user playnext list and drop one
        //find what to update via their list of play next
        for (i = 0; i <= use[1].listtoplay.length - 1; i++) {
          if (i == use[1].listtoplay.length - 1) {
            update = "User Finished";
          } else {
            if (use[1].listtoplay[i] == use[1].playnext) {
              update = use[1].listtoplay[i + 1];
              break;
            }
          }
        }

        for (i = 0; i <= otheruser[1].listtoplay.length - 1; i++) {
          if (i == otheruser[1].listtoplay.length - 1) {
            update2 = "User Finished";
          } else {
            if (otheruser[1].listtoplay[i] == otheruser[1].playnext) {
              update2 = otheruser[1].listtoplay[i + 1];
              break;
            }
          }
        }

        // console.log(update);
        // console.log(update2);

        await db.updatePlayNext(id, user, update);
        await db.updatePlayNext(id, otheruser[1].user, update2);
        //var members = await db.getUsersinTourn(id);

        // var members = await db.getUsersinTourn(id);

        // await db.addToListToPlay("New Tourn","user5","user4")
        // l = members.length
        //console.log(Math.floor(l/2))
        //  var count = 1;
        //statusreport = 
      } 
      else {
       // statusreport = "You can not report any more games";
      }
    }
    go();
  } catch (e) {
    response.status(404).render("/errorpage.ejs");

    console.log("something went wrong");
  } finally {
    //response.end();
    //  console.log(statusreport)
    response.render("home.ejs", {
      status: statusreport,
    });
  }
});
app.post("/endTourn", function (request, response) {
    var id = request.session.lastid;
    //console.log("id: " + id);
    try {
      go();
      async function go() {
        const db = new Database();
        var members = await db.getUsersinTourn(id);

        for (var d = 1; d < members.length; d++) {
            db.updateRecord(members[d].username,members[d].loss,members[d].wins);
        
        }

        }
      
    } catch (e) {
      response.status(404).render("/errorpage.ejs");
  
      console.log("something went wrong");
    } finally {
      //response.end();
      response.render("home.ejs", {
        status: "You have ended",
      });
    }
  });


//wep bage setup stuff
//not https
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");
app.use("/", router);
app.listen(3000, () => console.log(" go to http://localhost:3000"));
app.use(express.static("public"));
