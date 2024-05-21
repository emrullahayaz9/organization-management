DROP DATABASE DBProject;
CREATE DATABASE IF NOT EXISTS DBProject;

USE DBProject;




CREATE TABLE IF NOT EXISTS Authorization (
    email VARCHAR(255) PRIMARY KEY,
    Fname VARCHAR(255) NOT NULL,
    Mname VARCHAR(255),
    Lname VARCHAR(255),
    password VARCHAR(255),
    user_type VARCHAR(255),
    phone_number BIGINT UNIQUE,
    CHECK (LENGTH(`Fname`) > 0),
    CHECK (phone_number > 0)
);


CREATE TABLE IF NOT EXISTS Customer 
(customer_id INT AUTO_INCREMENT PRIMARY KEY,active_event_count INT DEFAULT 0,fk_auth_email VARCHAR(255),
FOREIGN KEY (fk_auth_email) REFERENCES Authorization(email));

CREATE TABLE IF NOT EXISTS Organizer (organizer_id INT AUTO_INCREMENT PRIMARY KEY,
fk_auth_email VARCHAR(255),FOREIGN KEY (fk_auth_email) REFERENCES Authorization(email));

CREATE TABLE IF NOT EXISTS Location_Address (location_id INT AUTO_INCREMENT PRIMARY KEY,city VARCHAR(255),
state VARCHAR(255),street VARCHAR(255),door_number INT);


CREATE TABLE IF NOT EXISTS Venue 
(venue_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), availability BOOLEAN DEFAULT false,location_id INT,
FOREIGN KEY (location_id) REFERENCES Location_Address(location_id));
CREATE TABLE IF NOT EXISTS Event (event_id INT AUTO_INCREMENT PRIMARY KEY,customer_id INT,organizer_id INT,venue_id INT,event_date DATE,
FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),FOREIGN KEY (organizer_id) REFERENCES Organizer(organizer_id),
FOREIGN KEY (venue_id) REFERENCES Venue(venue_id));





CREATE TABLE IF NOT EXISTS Event (event_id INT AUTO_INCREMENT PRIMARY KEY,customer_id INT,organizer_id INT,venue_id INT,
    event_date DATE,FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),FOREIGN KEY (organizer_id) REFERENCES Organizer(organizer_id),
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id));
    
CREATE INDEX idx_customer_id ON Event (customer_id);
CREATE INDEX idx_organizer_id ON Event (organizer_id);
CREATE INDEX idx_venue_id ON Event (venue_id);
CREATE INDEX idx_event_date ON Event (event_date);

DELIMITER //
CREATE TRIGGER authorization_trigger AFTER INSERT ON Authorization
FOR EACH ROW
BEGIN
 DECLARE user_type_val VARCHAR(255);
 DECLARE email_val VARCHAR(255);
 SET user_type_val = NEW.user_type;
 SET email_val = NEW.email;

 IF user_type_val = 'customer' THEN
   INSERT INTO Customer (fk_auth_email) VALUES (email_val);
 ELSEIF user_type_val = 'manager' THEN
   INSERT INTO Organizer (fk_auth_email) VALUES (email_val);
 END IF;
END//
DELIMITER ;

CREATE VIEW Customer_Events_View_2 AS 
SELECT 
    Event.event_date AS event_date,
    Organizer.organizer_id AS organizer_id,
    Organizer.fk_auth_email AS organizer_email,
    Authorization.Fname AS organizer_first_name,
    Authorization.Lname AS organizer_last_name,
    Authorization.phone_number AS organizer_phone_number,
    Venue.name AS venue_name,
    Location_Address.city AS venue_city,
    Location_Address.state AS venue_state,
    Location_Address.street AS venue_street,
    Location_Address.door_number AS venue_door_number,
    Customer.customer_id AS customer_id
FROM 
    Event
JOIN 
    Organizer ON Event.organizer_id = Organizer.organizer_id
JOIN 
    Authorization ON Organizer.fk_auth_email = Authorization.email
JOIN 
    Venue ON Event.venue_id = Venue.venue_id
JOIN 
    Location_Address ON Venue.location_id = Location_Address.location_id
JOIN
    Customer ON Event.customer_id = Customer.customer_id;
    
    
    
    
   CREATE VIEW Event_Manager_View AS
SELECT 
    Event.event_id AS event_id,
    Event.event_date AS event_date,
    Venue.name AS venue_name,
    Location_Address.city AS venue_city,
    Location_Address.state AS venue_state,
    Location_Address.street AS venue_street,
    Location_Address.door_number AS venue_door_number,
    Customer.customer_id AS customer_id,
    Authorization.Fname AS customer_first_name,
    Authorization.Lname AS customer_last_name,
    Authorization.email AS customer_email,
    Authorization.phone_number AS customer_phone_number,
    Organizer.organizer_id AS organizer_id,
    Organizer.fk_auth_email AS organizer_email,
    Organizer_Auth.Fname AS organizer_first_name,
    Organizer_Auth.Lname AS organizer_last_name,
    Organizer_Auth.phone_number AS organizer_phone_number
FROM 
    Event
JOIN 
    Venue ON Event.venue_id = Venue.venue_id
JOIN 
    Location_Address ON Venue.location_id = Location_Address.location_id
JOIN
    Customer ON Event.customer_id = Customer.customer_id
JOIN
    Authorization ON Customer.fk_auth_email = Authorization.email
JOIN
    Organizer ON Event.organizer_id = Organizer.organizer_id
JOIN
    Authorization AS Organizer_Auth ON Organizer.fk_auth_email = Organizer_Auth.email;
