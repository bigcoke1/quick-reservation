# Quick Reservation API Documentation
The Quick Reservation API allows storing information, such as each user's login information
and restaurant information, and retrieving information from the database.

## Check Login Info
**Request Format:** /login endpoint with POST parameters of the username and password in the format 'username' and 'password'

**Request Type:** POST

**Returned Data Format**: Plain text

**Description:** Checks if the input username and password matches an entry in the database

**Example Request:** Post parameters of 'username=UW1234' and 'password=123456'

**Example Response:**

```
Welcome, UW1234!
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If something goes wrong with the user input (i.e., wrong username or password), returns error with 'Wrong username or password!'

## Register Account
**Request Format:** /register endpoint with POST parameters of the username, email, phone number password
                    in the format 'username', 'email', 'phone', 'password'

**Request Type:** POST

**Returned Data Format**: Plain text

**Description:** Register an account with an username, email, phone number, and password

**Example Request:** Post parameters of 'username=UW1234', 'email=UW1234@gmail.com', 'phone=1234567890', password=123456'

**Example Response:**

```
Account Succesfully Registered!
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If something goes wrong with the user input (i.e., wrong username or password), returns error with `Request Error`

## Get Restaurant Info
**Request Format:** /info/:restaurant

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** retrieve information from the database of the restaurant inputted

**Example Request:** /info/Samurai Noodle

**Example Response:**

```json
{
  "name": "Samurai Noodle",
  "address": "4138 University Way NE, Seattle, WA 98105",
  "minGuests": 2,
  "img": "samurai.png",
  "cuisine": "Japanese",
  "capacity": 20
}
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If something goes wrong with the user input, returns error with `Request Error`

## Get All Restaurants Info
**Request Format:** /info

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** retrieve information of all restaurants in the database

**Example Request:** /info

**Example Response:**

```json
[
  {
    "name": "Kong Tofu House",
    "address": "1414 NE 42nd St STE 103A, Seattle, WA 98105",
    "minGuests": 4,
    "img": "kong.png",
    "cuisine": "Korean",
    "capacity": 30
  },
  {
    "name": "Nuodle Express",
    "address": "4245 University Wy NE, Seattle, WA 98105",
    "minGuests": 4,
    "img": "nuodle.jpg",
    "cuisine": "Chinese",
    "capacity": 20
  }
]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'

## Adding Review
**Request Format:** /review endpoint with POST parameters of the restaurant name, username, rating, and the comment in the format 'username', 'rating', and 'comment'

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Adds a review, along with the username, to the database (only if the user has reserved from the restaurant before)

**Example Request:** Post parameters of 'restaurant="Kong Tofu House"', 'username="UW1234"', 'rating=4', and 'comment="Not Bad"'

**Example Response:**

```
Review Succesfully Added
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If a parameter is missing or the user has never been to the restaurant, returns invalid param error

## Deleting Account
**Request Format:** /deleteAccount endpoint with POST parameter of the username in the format 'username'

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Delete the user's account forever

**Example Request:** Post parameters of 'username=UW1234'

**Example Response:**

```
Account Succesfully Deleted
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If something goes wrong with the user input, returns error with `Request Error`

## Make Reservation
**Request Format:** /reserve endpoint with POST parameter of the username, restaurant, and numGuests in the format 'username', 'restaurant' and 'numGuests'

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Make a reservation at the given restaurant and add the reservation history to the user's account history.

**Example Request:** Post parameters of 'username=UW1234', 'restaurant=Kong Tofu House', and 'numGuests=4'

**Example Response:**

```
1717462259440
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If one or more params is missing, returns invalid params error
  - if the number of guest is less than the minimum guests for that restaurant or the number of guest is greater than the capacity of the restaurant, returns params error

## Filter
**Request Format:** /filter/:cuisine

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Filters the restaurants based on the inputted cuisine

**Example Request:** /filter/Chinese

**Example Response:**

json
```
[
  {
    "name": "Nuodle Express",
    "address": "4245 University Wy NE, Seattle, WA 98105",
    "minGuests": 4,
    "img": "nuodle.jpg",
    "cuisine": "Chinese",
    "capacity": 16
  },
  {
    "name": "Call-a-Chicken",
    "address": "4237 University Way NE, Seattle, WA 98105",
    "minGuests": 2,
    "img": "call-a-chicken.jpeg",
    "cuisine": "Chinese",
    "capacity": 28
  }
]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'

## Search
**Request Format:** /search

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Search the restaurants based on the search query

**Example Request:** /search?search=house

**Example Response:**

json
```
[
  {
    "name": "Kong Tofu House",
    "address": "1414 NE 42nd St STE 103A, Seattle, WA 98105",
    "minGuests": 4,
    "img": "kong.png",
    "cuisine": "Korean",
    "capacity": 22
  }
]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'
- Possible 400 errors (all plain text):
  - If one or more params is missing, returns invalid params error

## Average Rating
**Request Format:** /rating/:restaurant

**Request Type:** GET

**Returned Data Format**: Plain text

**Description:** Returns the average rating of the inputted restaurant

**Example Request:** /rating/Kong Tofu House

**Example Response:**

```
4
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'

## User information
**Request Format:** /user/:username

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns information of the inputted user

**Example Request:** /user/UW1234

**Example Response:**

json
```
{
  "email": "apple@gmail.com",
  "username": "Apple",
  "password": "applebanana",
  "history": "[{\"restaurant\":\"Palmi Korean BBQ\",\"numGuest\":\"6\",\"confirmNum\":1717462226031},{\"restaurant\":\"Kong Tofu House\",\"numGuest\":\"4\",\"confirmNum\":1717462259440}]",
  "phone": 1235453455
}
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'

## Distinct Cuisines
**Request Format:** /cuisine

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns all distinct cuisines in the database

**Example Request:** /cuisine

**Example Response:**

json
```
[
  {
    "cuisine": "Korean"
  },
  {
    "cuisine": "Chinese"
  },
  {
    "cuisine": "Vietnamese"
  },
  {
    "cuisine": "Japanese"
  },
  {
    "cuisine": "Western"
  }
]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with 'An error occurred on the server. Try again later.'