### web based organization-management system
Database Project with Node.js
This project is a Node.js application that manages a database for an event management system. It includes schemas for users (customers and organizers), venues, events, and related details. The database is created using MySQL.

#### Features
User authorization system with customers and organizers.
Management of venues and events.
Views to simplify querying customer and event data.
Triggers to automate customer and organizer creation.
Indexes to optimize query performance.
#### Database Schema
The database consists of the following tables:

Authorization: Stores user information and credentials.
Customer: Stores customer-specific information.
Organizer: Stores organizer-specific information.
Location_Address: Stores address details for venues.
Venue: Stores venue information.
Event: Stores event details.
#### Relationships
Each customer and organizer references the Authorization table.
Venues reference the Location_Address table.
Events reference Customer, Organizer, and Venue tables.
#### Views
Two views are created to simplify data access:

Customer_Events_View_2: Provides detailed information about events from a customer's perspective.
Event_Manager_View: Provides detailed information about events from a manager's perspective.
Triggers
A trigger authorization_trigger ensures that when a new user is added to the Authorization table, they are automatically inserted into the appropriate Customer or Organizer table based on their user type.

Setup Instructions
Prerequisites
Node.js
MySQL
