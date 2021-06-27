# DCYIS
#### Video Demo:  https://youtu.be/QQdrCw34OEw

## Overview
DCYIS is a reimagined version of the CS50 'Finance' task, after my realization of the potential of a tool such as this. Within my school, I am the co-founder of a new co-curricular activity aimed at improving financial literacy within our school community, including investment and portfolio management. After seeing the 'Finance' task, I envisioned an upgraded version that could be used internally by our investment society to practice stock investing, the concept which lies at the foundations of this project. In designing this site, there was an emphasis on user-friendliness, readability, and providing more information to the user than in the original 'Finance' task. This readme will take you through the framework, languages and libraries used in the website, how each page was formulated, and some of the design decisions that went into the project.

## Background
Coming into this project, I had some previous experience in HTML and CSS design, along with Javascript. I had built two previous sites using Firebase and AngularJS, but wanted to push my skills while learning the newer and more powerful AngularCLI (Angular 2+). This was probably the hardest part of the project, figuring out all the pieces of the extensive default Angular2+ project and how they worked together (Typescript classes, components, services, modules, imports/exports, etc). This was also my first time using an external API in a JS/TS project, and I had to figure out how to write JS Promises, asynchronous code, and use 'fetch' requests. All of these aspects will be discussed in more detail in the rest of this readme.

## Languages and Components
This project was built with the Angular CLI in Angular 8. The frontend is written in HTML and CSS, with Typescript acting as the user-side logic control language. In general, each page will possess one HTML, one CSS, and one TS file which together work to create the page. Additional 'service' files are also written to allow for shared use of certain functions or operations, such as the 'lookup' function for stock, user authentication, and more.

Most of the website logic is adapted from my submission of the CS50 'Finance' project, with the Python from Flask being rewritten in Typescript, and some additional features. Various NodeJS modules and services are also utilized, including Bootstrap, Fontawesome, RXJS, and more.

The backend for this site utilizes a Firebase Realtime Database which stores information in a JSON tree, and is viewed and updated with asynchronous Javascript requests. This was used due to my previous experience with Firebase, the GoogleAuth handling provided by Firebase, and it's free hosting service on certain urls. This, combined with inexperience in setting up SQL databases for Angular projects, made Firebase the obvious choice.

API requests to IEX are made by a Javascript 'fetch' promise, and are passed through a proxy url designed to bypass CORS errors. Conscious of the free-plan limit on IEX requests, multiple API stock requests are compiled into a bundle request which can be fetched at a singular endpoint, greatly reducing the total requests made by the site. Furthermore, the website stores previously fetched data locally to minimise the need for repeated requests on loading of summary pages, but will always fetch the latest data before 'quote', 'buy' or 'sell' operations.

A great deal of this code can and will be refactored over the coming months, this was my first Angular 2+ project since I previously only had experience with AngularJS. There are several places where code is repeated and probably could be reused, but I had to at some point finish and submit the project. I have several ideas for extensions which will be discussed at the end of this file.

## Pages

### Homepage
The home/landing page for this website is quite simple, just having some basic information on our extra-curricular club and what to expect from the website. Most options are locked for non-logged-in users, and users are asked to sign in with Google to create their account and get started with the site.

The main effort in this page is in the HTML and CSS, in an attempt for new users to land on the page and feel excited about the project. It is also designed to not be too extensive, so there is opportunity to add more features as the investment society grows.

### Quote
The quote page is extremely simple aesthetically, with a small interface in the center of the page to query the current API price of a stock. A quality-of-life change made here is to keep the input editable after querying a stock, so that a page reload is not necessary for another query.

As explained above, the API query is performed by an asynchronous Javascript 'fetch' request to a URL formulated in the 'lookup' function of the 'helpers' service. Once the information is returned, the DOM is updated using Angular.

### Login
Login is also a visually simple page, with a large login button in the center of the page. When the user is already logged in, this will instead display a message including the user's display name (fetched from the GoogleAuth generated profile), along with an option to logout.

The authentication process can be seen in the 'auth' service, where a series of functions are called to generate a GoogleAuth instance using the Firebase API. Once this is complete, the user profile within the database will either be created or updated depending on if they have previously logged in, with this value subscribed to within the TS frontend using a RXJS observable. This allows the site to detect changes to the profile in real time and update accordingly. Each user profile has a unique key generated by Firebase, which corresponds to their portfolios elsewhere in the database.

### Dashboard
The user 'dashboard' consists of two main components, a 'profile' component which shows the stored user information in the name of transparency, and a 'portfolios' component which lists information on all the portfolios tied to the user account. When designing this site, I wanted for a user to be able to create multiple investment portfolios, so that our students could attempt different investment strategies and track their performance (eg. short-term vs long-term). On this page, users are also able to add new portfolios, customising a name, description, and starting balance, along with a 'transaction commission' applied to each transaction in that portfolio (to help emulate real-life brokers and stock trading). This commission can either be a percentage of the entire transaction, or a fixed value. Clicking on any portfolio will expose a further variety of pages which allow the user to navigate and manipulate that portfolio.

### Portfolio Overview
The 'overview' page is designed for the user to be able to see a brief summary of their portfolio. It lists their owned stocks, the 'ticker' for each stock, the quantity of each stock in their portfolio, the unit price of each stock, and the total value of all owned units of each stock. There is also information on the current cash balance of the account, and the current total value of their portfolio. This page uses a batch fetch request to the API, helping to not hit the request limit as described above. The page also stores this information in localstorage on the frontend, allowing it to share data with the 'history' page and prevent making duplicate requests to the IEX API.

### Buy and Sell
There are 3 main parts to the 'Buy' and 'Sell' pages. Upon first loading, there is a description to the side about the page and it's functions, which outlines how to use the page, the capabilities of the website, and disclaimers about the IEX API, time delays, etc. This is followed by a small box similar to the 'quote' page, containing input fields for a stock ticker, and the desired quantity.

Once the user submits this information, a series of checks are ran to determine the legitimacy of the request. Users will be unable to trade invalid stock symbols, or a quantity of 0 stock.

Should the request pass the above checks, the user is then shown a 'summary' of the transaction. This includes information on the current stock price, the total value of the transaction, the commission that will be applied to the transaction, the final price, the changes to owned stock quantities, and the new account balance. During this time, the inputs are disabled to prevent users attempting to change their values. Finally, the user is presented with options to either complete the purchase, or go back and edit it.

However, there are now more checks. Should the user attempt to purchase more stock than their account balance allows for, or attempt to sell more stock than they own, they will be informed of this. The receipt will still be displayed so they can determine by what margin they are surpassing the limits, but the option to complete the purchase will be disabled. Checks are ran on both the initial receipt construction as well as the 'complete purchase' operation, meaning that users are unable to edit the HTML to re-enable the buttons and attempt to forcefully submit illegitimate trades.

Should the trade be legitimate, the purchase will be completed by a series of asynchronous Javascript requests to the database, to calculate and update account stock quantity and balance values. It should be noted that the latest price of the stock is always fetched from the API right before this operation, to ensure that the request remains legitimate (users will be unable to generate the receipt, wait for the price to change, and still trade the stock).

Once the user has completed their trade, they will be rerouted to the overview of their portfolio, with the new values of portfolio stock and balance.

### History
Along with the 'buy' and 'sell' pages, the 'history' page is one of the most upgraded components of this website when compared to 'Finance'. This page includes a great deal more information, including tracking of both stock unit and transaction values at the time of the transaction versus the present. A % change is also calculated for each transaction, with the value being color coded for both buy and sell operations to help the user determine whether they made the correct decision.

The page also includes a portfolio summary at the bottom, including the starting balance of the portfolio, the current balance, the total portfolio value at the present, and the % change in the value of the portfolio since the start (once again color coded).

It should be once again noted that this page shares information with the portfilio 'overview' page, attempting to access previously fetched data from local storage before filling in any missing information with it's own batch request.

A design decision made was to hide the entire table until all the information is fully loaded, or else there was a jerky animation as information for each stock loaded in (along with inaccurate values for the total portfolio value and % change). This was made for user quality-of-life.

## Security
All authentication is handed with the Firebase GoogleAuth API, in order to negate the need for storing user passwords at all. This allows for secure logins and data preservation on the backend.

All API and database tokens are stored in environment variables, set to be ignored by Github and which cannot be dug up from the frontend user.

As outlined in the 'buy' and 'sell' pages, multiple checks are conducted on each transaction to ensure their legitimacy. Failure to pass these tests will result in front-end DOM updates to inform the user of the issue and allow them to rectify their transaction request.

Appropriate Firebase security rules have also been implemented in order to ensure unauthenticated requests to the database are denied.

## Future plans
As previously mentioned, this project was built to be used by an extra-curricular 'investment society' which I helped to found at my school. Depending on what users request as well as my own ideas, I intend for there to be multiple updates to this website. One of the foremost ideas is for us to host internal 'investment competitions' where users can create a single competitive portfolio and face off against other students, with a realtime leaderboard showing the top competitors. We believe that including this (optional) competitive aspect within the club will help promote student engagement and allow students to really put what they learn to use.

## Conclusion
Thank you for taking the time to read through this overview, I trust it has provided some insight into the inspiration, purpose, planning, development and publishing of this website. If you have any questions, queries, or concerns, feel free to contact me at my Github account @ChadRosseau.
