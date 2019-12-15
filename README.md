# **Tourie**

This is a back-end part of the **Tourie** mobile application.

## Table of contents
* [General info](#general-info)
* [Requirements](#requirements)
* [Technologies](#technologies)
* [Third-party](#third-party)
* [Setup](#setup)
* [Features](#features)
* [Environment variables](#environment-variables)
* [Available scripts](#available-scripts)
* [Contact](#contact)

## General info

This is **Tourie** a smart city guide, that may help one to find amazing places in any city, provide plenty of information about them and plan a city tour using a dedicated recommender system. It was implemented as a Progressive Web Application.

## Requirements
* Node.js
* MongoDB
* Yarn
* Corresponding front-end application

## Technologies
* JavaScript
* Node.js
* MongoDB

## Third-party
* Google Maps API
* Google Places API
* Google Roads API
* Wit.ai

## Setup
```bash
git clone https://github.com/piotrjaniszewski1/Tourie-backend.git
cd Tourie-backend
yarn
```

## Features
* Database with various places assigned to various categories
* User accounts (creating account, logging in, altering user data, deleting account)
* Creating routes - user chooses categories / time / starting point
* Showing full route before accepting it
* Travel mode - after accepting the route user sees list of places on the route, information about the place, sort of a navigation while traveling
* Application can be run from the phone's desktop
* Application works to certain extent when offline
* Performing action with voice commands
* History of previous routes
* Planning routes for the future (without immediately going to travel mode)
* Saving favourite places, routes, whatever
* Quick edit of places in route before accepting it
* Route statistics

### Environment variables

External services are configured using environment variables.
They can also be loaded from a `.env` file.

```text
MONGODB_URI=mongodb://127.0.0.1:27017/tourie
GOOGLE_MAPS_API_KEY=... # get it from https://console.developers.google.com
WIT_ACCESS_TOKEN=... # get it from https://wit.ai/your-username/your-app/settings
PORT=3000
```

## Available Scripts

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

## Authors
Created by students from Poznań University of Technology:
* [Piotr Janiszewski](mailto:1piotr.janiszewski@gmail.com)
* Tomasz Gil
* Piotr Ptak
* Mikołaj Rozwadowski

Feel free to contact us!
