const express = require('express');
const router = express.Router();
const mysql = require("mysql");


const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "DBProject"
});

connection.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("connected..route");
    }
});

router.get('', (req, res, next) => {
    res.render("home/home");
});

router.get('/register', (req, res, next) => {
    res.render("home/register");
});

router.post('/register', (req, res, next) => {
    const { email, fname, mname, lname, password, user_type, phone_number } = req.body;

    const insertQuery = `INSERT INTO Authorization (email, Fname, Mname, Lname, password, user_type, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [email, fname, mname, lname, password, user_type, phone_number];

    connection.query(insertQuery, values, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred while registering the user.");
        } else {
            console.log("User registered successfully.");
            res.redirect('/login');
        }
    });
});

router.get('/login', (req, res, next) => {
    res.render("home/login"); 
});

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM Authorization WHERE email = ? AND password = ?";
    const values = [email, password];

    connection.query(query, values, function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred while logging in.");
        } else {

            if (results.length > 0) {
                var q = "SELECT active_event_count FROM Customer WHERE fk_auth_email=?";
                var v = [email];
                connection.query(q, v, function(err, reslt){
                    if(err){
                        console.log(err);
                        res.status(500).send("An error occurred while query.");
                    }else{
                        if(results[0].user_type==="customer"){
                            
                            req.session.user = {
                                email: email,
                                user_type: results[0].user_type,
                                active_event_count: reslt[0].active_event_count
                            };
                            res.redirect("/welcome");
    
                        }else{
                            req.session.user = {
                                email: results[0].email,
                                user_type: results[0].user_type,
                            };
                            res.redirect("/welcome");
                        }
                    }
                });
               
            } else {
                res.status(401).send("Invalid email or password.");
            }
        }
    });
});

router.get("/welcome", (req, res, next)=>{
    const user = req.session.user;
    if (user) {
        if (user.user_type === "customer") {

            const r = "SELECT * FROM Venue";
            connection.query(r, function(err, result){
                if(err){
                    console.log(err);
                    res.status(500).send("An error occurred while getting venues.");
                }else{
                    var venues = result; 
                    const q = "SELECT * FROM Organizer, Authorization WHERE email=fk_auth_email";

                    connection.query(q, function(err, rslt){
                        if(err){
                            console.log(err);
                            res.status(500).send("An error occurred while getting venues.");
                        }else{
                        const h = "SELECT * FROM Event WHERE customer_id = (SELECT customer_id FROM Customer WHERE fk_auth_email = ?)";
                        connection.query(h, [user.email], function(err, events) {
                            if (err) {
                                console.log(err);
                                res.status(500).send("An error occurred while getting events.");
                            } else {
                            const h = `SELECT * FROM Customer_Events_View_2 WHERE customer_id = (SELECT customer_id FROM Customer WHERE fk_auth_email = ?);`;

                            connection.query(h, [user.email], function(err, events) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send("An error occurred while getting events.");
                                } else {
                                    res.render("home/welcome_customer", {
                                        active_event_count: events.length,
                                        email: user.email,
                                        user_type: user.user_type,
                                        organizers: rslt,
                                        venues: venues,
                                        active_events: events
                                    });
                                }
                            });
                            }
                        });}
                    })
                }
            })
        } 
        
        else if (user.user_type === "manager") {
            const h = "SELECT * FROM Event WHERE organizer_id = (SELECT organizer_id FROM Organizer WHERE fk_auth_email = ?)";
            connection.query(h, [user.email], function(err, events) {
                if (err) {
                    console.log(err);
                    res.status(500).send("An error occurred while getting events.");
                } else {
                const query = "SELECT * FROM Event_Manager_View WHERE organizer_email=?";
                connection.query(query, [user.email], function(err, events) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("An error occurred while getting events.");
                    } else {
            res.render("home/welcome_organizer",{
                events:events
            });
                    }
                });
                }
            });
        } 
        else if (user.user_type === "super_admin") {
            var q = "SELECT * FROM DBProject.Location_Address";

            connection.query(q, function(err, result){
                if(err){
                    console.log(err);
                    res.status(500).send("An error occurred while query.");
                }else{
                    const r = "SELECT * FROM Venue";
                    connection.query(r, function(err, reslt){
                        if(err){
                            console.log(err);
                            res.status(500).send("An error occurred while getting venues.");
                        }else{
                            var venues = reslt; 
                            res.render("home/welcome_superadmin", {locations: result, venues:venues});

                        }
                    })
                }
            });
        }
    } else {
        res.status(401).send("Unauthorized");
    }
});

router.post("/add-location", (req, res)=>{
    const { city, state, street, door_number } = req.body;
    const insertQuery = `INSERT INTO Location_Address (city, state, street, door_number) VALUES (?, ?, ?, ?)`;
    const values = [city, state, street, door_number];
    connection.query(insertQuery, values, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred while adding location.");
        } else {
            console.log("Location added successfully.");
            res.redirect("/welcome");
        }
    });
})

router.post("/add-venue", (req, res, next)=>{
    const { name, venueLocation } = req.body;
    const insertQuery = "INSERT INTO Venue(name, location_id) VALUES (?, ?)";
    const values = [name, venueLocation];
    connection.query(insertQuery, values, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred while adding location.");
        } else {
            console.log("Venue added successfully.");
            res.redirect("/welcome");
        }
    });
})

router.post("/create-event", (req, res, next) => {
    const { eventLocation, eventDate, eventVenue } = req.body;
    const user = req.session.user;
    const checkEventCountQuery = "SELECT active_event_count FROM Customer WHERE fk_auth_email = ?";
    connection.query(checkEventCountQuery, [user.email], (checkErr, checkResult) => {
        if (checkErr) {
            console.log(checkErr);
            res.status(500).send("An error occurred while checking event count.");
        } else {
            const activeEventCount = checkResult[0].active_event_count;
            if (activeEventCount >= 5) {
                console.log("Customer has reached the maximum number of active events.");
                res.render("home/error");
            } else {
                const querrry = "SELECT * FROM Event WHERE venue_id = (SELECT venue_id FROM Venue WHERE name = ?) AND event_date = ?";
                connection.query(querrry, [eventVenue, eventDate], (checkErr, checkResult) => {
                    if (checkErr) {
                        console.log(checkErr);
                        res.status(500).send("An error occurred while checking event count.");
                    } else {

                        if (checkResult.length > 0) {
                            console.log("Event already exists for the selected venue and date.");
                            res.render("home/istaken");
                        } else{

                const insertEventQuery = `INSERT INTO Event (customer_id, organizer_id, venue_id, event_date) VALUES ((SELECT customer_id FROM Customer WHERE fk_auth_email=?), (SELECT organizer_id FROM Organizer WHERE fk_auth_email=?), (SELECT venue_id FROM Venue WHERE name=?), ?)`;
                const insertEventValues = [user.email, eventLocation, eventVenue, eventDate];
                
                connection.query(insertEventQuery, insertEventValues, (insertErr, insertResult) => {
                    if (insertErr) {
                        console.log(insertErr);
                        res.status(500).send("An error occurred while creating the event.");
                    } else {
                        console.log("Event created successfully.");
                        const updateCountQuery = "UPDATE Customer SET active_event_count = active_event_count + 1 WHERE fk_auth_email = ?";
                        connection.query(updateCountQuery, [user.email], (updateErr, updateResult) => {
                            if (updateErr) {
                                console.log(updateErr);
                                res.status(500).send("An error occurred while updating active event count.");
                            } else {
                                console.log("Active event count updated successfully.");

                                const updateVenueAvailability = "UPDATE Venue SET availability = 1 WHERE name=?"
                                const v =  [eventVenue];


                                connection.query(updateVenueAvailability, v, (insertErr, v) => {
                                    if (insertErr) {
                                        console.log(insertErr);
                                        res.status(500).send("An error occurred while creating the event.");
                                    } else {
                                        res.redirect("/welcome");
                                    }
                                });
                            }
                        });
                    }
                });}
                    }})
            }
        }
    });
});

module.exports = router;
