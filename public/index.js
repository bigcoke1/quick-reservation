/**
 * Name: Eason Meng
 * Section AF
 * 5/31/2024
 *
 * The index.js defines the front-end behavior of the reservation website for my final porject
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  const MONTH = 2592000000;

  /**
   * add event listeners to all buttons, forms, etc
   * populates the gallery and the filter
   * displays home page if the user is already logged in
   * No params nor returns
   */
  async function init() {
    qs("#welcome-page p").addEventListener("click", () => {
      id("welcome-page").classList.add("hidden");
      id("register-page").classList.remove("hidden");
      id("register-form").addEventListener("submit", registerAccount);
    });
    id("login-form").addEventListener("submit", loginAccount);
    await makeAllRestaurantsRequest();
    if (await cookieStore.get("logged-in")) {
      displayHome();
    }
    id("home-btn").addEventListener("click", displayHome);
    id("reserve-form").addEventListener("submit", displayConfirm);
    qs("#reserve-form input").addEventListener("change", toggleReserveButton);
    qs("#confirm-page button").addEventListener("click", makeReserveRequest);
    id("history-btn").addEventListener("click", displayHistory);
    id("review-form").addEventListener("submit", submitReview);
    id("account-btn").addEventListener("click", displayAccount);
    qs("#account button").addEventListener("click", deleteAccount);

    await makeFilterRequest();
    id("filter").addEventListener("change", applyFilter);
    id("search-bar").addEventListener("change", toggleSearchButton);
    id("search-btn").addEventListener("click", makeSearchRequest);

    qs("#interface select").addEventListener("change", toggleStyle);
  }

  /**
   * toggles the layout of the gallery
   * No params nor returns
   */
  function toggleStyle() {
    let cards = qsa("#gallery section");
    let view = qs("#interface select").value;
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      if (view === "cozy") {
        card.classList.add(view);
        card.classList.remove("compact");
      } else {
        card.classList.add(view);
        card.classList.remove("cozy");
      }
    }
  }

  /**
   * makes a GET request to get information about all restaurants in the database
   * No params nor returns
   */
  async function makeAllRestaurantsRequest() {
    try {
      let res = await fetch("/info");
      await statusCheck(res);
      res = await res.json();
      displayRestaurants(res);
    } catch (err) {
      handleError();
    }
  }

  /**
   * displays all restaurants from the given array in gallery
   * @param {Array} res: array of restaurants in object form
   * No returns
   */
  function displayRestaurants(res) {
    let view = qs("#interface select").value;
    id("gallery").innerHTML = "";
    for (let i = 0; i < res.length; i++) {
      let card = document.createElement("section");
      let image = document.createElement("img");
      image.src = "img/" + res[i].img;
      let name = document.createElement("p");
      name.textContent = res[i].name;
      card.appendChild(image);
      card.appendChild(name);
      id("gallery").appendChild(card);

      image.addEventListener("click", () => {
        makeRestaurantRequest(res[i].name);
      });

      if (view === "cozy") {
        card.classList.add(view);
        card.classList.remove("compact");
      } else {
        card.classList.add(view);
        card.classList.remove("cozy");
      }
    }
  }

  /**
   * makes a GET request to retrieve information about the selected restaurant
   * @param {String} name: the name of the selected restaurant
   * No returns
   */
  async function makeRestaurantRequest(name) {
    try {
      let res = await fetch("/info/" + name);
      let rating = await fetch("/rating/" + name);
      await statusCheck(res);
      res = await res.json();
      rating = await rating.text();
      displayReserveView(res, rating);
    } catch (err) {
      handleError();
    }
  }

  /**
   * displays reservation page and hides all other pages
   * populate paragraphs in the reservation page with information about the selected restaurant
   * @param {Object} res: object representing all info about the selected restaurant
   * @param {String} rating: the average rating of the selected restaurant
   * No returns
   */
  function displayReserveView(res, rating) {
    id("register-page").classList.add("hidden");
    id("welcome-page").classList.add("hidden");
    id("gallery").classList.add("hidden");
    id("reservation-page").classList.remove("hidden");

    qs("#rating strong").textContent = rating;
    id("restaurant-name").textContent = res.name;
    id("address").textContent = res.address;
    id("capacity").textContent = "Seats available: " + res.capacity;
    id("min-guests").textContent = "minimum number of guests: " + res.minGuests;
  }

  /**
   * registers a new account using inputted email, phone, username, and password
   * upon a successful registration, displays home view
   * @param {Object} evt: the event object
   * No returns
   */
  async function registerAccount(evt) {
    try {
      evt.preventDefault();
      let params = new FormData(id("register-form"));
      let res = await fetch("/register", {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      displayHome();
      let username = qs("#register-form input").value;
      cookieStore.set({
        name: "logged-in",
        value: username,
        expires: Date.now() + MONTH
      });
    } catch (err) {
      handleError();
    }
  }

  /**
   * attempt logging in using the user's inputted username and password
   * upon a successful log-in, displays home view
   * @param {Object} evt: the event object
   * No returns
   */
  async function loginAccount(evt) {
    try {
      evt.preventDefault();
      let params = new FormData(id("login-form"));
      let res = await fetch("/login", {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      displayHome();
      let username = qs("#login-form input").value;
      cookieStore.set({
        name: "logged-in",
        value: username,
        expires: Date.now() + MONTH
      });
    } catch (err) {
      handleError();
    }
  }

  /**
   * display all restaurants on the gallery view and hide all other pages
   * No params nor returns
   */
  function displayHome() {
    id("register-page").classList.add("hidden");
    id("welcome-page").classList.add("hidden");
    id("home-page").classList.remove("hidden");
    id("gallery").classList.remove("hidden");
    id("reservation-page").classList.add("hidden");
    id("confirm-page").classList.add("hidden");
    id("history").classList.add("hidden");
    id("account").classList.add("hidden");
    qs(".error").classList.add("hidden");
    makeAllRestaurantsRequest();
  }

  /**
   * display confirmation page after user submits a reservation
   * @param {Object} evt: the event object
   * No returns
   */
  function displayConfirm(evt) {
    evt.preventDefault();
    id("confirm-page").classList.remove("hidden");
    qsa("#confirm-page p strong")[0].textContent = id("restaurant-name").textContent;
    qsa("#confirm-page p strong")[1].textContent = qs("#reserve-form input").value.toString();
  }

  /**
   * makes a reserve request to the server
   * upon a successful reservation, displays home view
   * No params nor returns
   */
  async function makeReserveRequest() {
    try {
      let username = (await cookieStore.get("logged-in")).value;
      let restaurant = qsa("#confirm-page p strong")[0].textContent;
      let numGuests = qsa("#confirm-page p strong")[1].textContent;
      let params = new FormData();
      params.append("username", username);
      params.append("restaurant", restaurant);
      params.append("numGuests", numGuests);
      let res = await fetch("/reserve", {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      res = await res.text();
      displayHome();
    } catch (err) {
      handleError();
    }
  }

  /**
   * display all reservation history of the current user on the history page
   * No params nor returns
   */
  async function displayHistory() {
    id("history").classList.remove("hidden");
    id("gallery").classList.add("hidden");
    id("account").classList.add("hidden");
    id("reservation-page").classList.add("hidden");
    id("confirm-page").classList.add("hidden");

    id("history").innerHTML = "";
    let account = await makeAccountRequest();
    let history = account.history;
    history = JSON.parse(history);
    for (let i = 0; i < history.length; i++) {
      let card = document.createElement("article");
      card.classList.add("card");
      let name = document.createElement("p");
      let confirmNum = document.createElement("p");
      let numGuests = document.createElement("p");
      name.textContent = history[i].restaurant;
      confirmNum.textContent = "Confirmation Number: " + history[i].confirmNum;
      numGuests.textContent = "Number of Guests: " + history[i].numGuest;
      card.appendChild(name);
      card.appendChild(confirmNum);
      card.appendChild(numGuests);
      id("history").prepend(card);
    }
  }

  /**
   * display info about the current logged-in account on the account page
   * No params nor returns
   */
  async function displayAccount() {
    id("history").classList.add("hidden");
    id("gallery").classList.add("hidden");
    id("account").classList.remove("hidden");
    id("reservation-page").classList.add("hidden");
    id("confirm-page").classList.add("hidden");

    let account = await makeAccountRequest();

    let username = account.username;
    let email = account.email;
    let phone = account.phone;

    let accountParas = qsa("#account p");
    accountParas[0].textContent = "Username: " + username;
    accountParas[1].textContent = "Email: " + email;
    accountParas[2].textContent = "Phone: " + phone;
  }

  /**
   * makes a fetch request to retrieve all information about the current logged-in user
   * No params
   * @return {Object}: object representing information about the user
   */
  async function makeAccountRequest() {
    try {
      let username = (await cookieStore.get("logged-in")).value;
      let res = await fetch("/user/" + username);
      await statusCheck(res);
      res = await res.json();
      return res;
    } catch (err) {
      handleError();
    }
  }

  /**
   * submits the review and add it to the database
   * @param {Object} evt: the event object
   * No returns
   */
  async function submitReview(evt) {
    try {
      evt.preventDefault();
      let username = (await cookieStore.get("logged-in")).value;
      let restaurant = id("restaurant-name").textContent;
      let params = new FormData(id("review-form"));
      params.append("username", username);
      params.append("restaurant", restaurant);
      let res = await fetch("/review", {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      qsa("#review-form input")[0].value = "";
      qsa("#review-form input")[1].value = "";
    } catch (err) {
      handleError();
    }
  }

  /**
   * makes a post request to delete the current account
   * No params nor returns
   */
  async function deleteAccount() {
    try {
      let params = new FormData();
      let username = (await cookieStore.get("logged-in")).value;
      params.append("username", username);
      let res = await fetch("/deleteAccount", {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      await cookieStore.delete("logged-in");
      id("account").classList.add("hidden");
      id("home-page").classList.add("hidden");
      id("welcome-page").classList.remove("hidden");
    } catch (err) {
      handleError();
    }
  }

  /**
   * makes a fetch request to get all distinct types of cuisines in the database
   * No params nor returns
   */
  async function makeFilterRequest() {
    try {
      let res = await fetch("/cuisine");
      await statusCheck(res);
      res = await res.json();
      populateFilter(res);
    } catch (err) {
      handleError();
    }
  }

  /**
   * populates the filter with all the types of cuisines available
   * @param {Array} res: array of all available cuisines
   * No returns
   */
  function populateFilter(res) {
    for (let i = 0; i < res.length; i++) {
      let option = document.createElement("option");
      option.textContent = res[i].cuisine;
      id("filter").appendChild(option);
    }
  }

  /**
   * enables/disables the reserve button
   * if the number of guests is empty, disables the reserve button
   * otherwise enables it
   * No params nor returns
   */
  function toggleReserveButton() {
    let numGuests = qs("#reserve-form input").value;
    if (numGuests) {
      id("reserve-btn").disabled = false;
    } else {
      id("reserve-btn").disabled = true;
    }
  }

  /**
   * display the restaurants that match the filter
   * No params nor returns
   */
  async function applyFilter() {
    try {
      let cuisine = id("filter").value;
      if (cuisine === "All") {
        makeAllRestaurantsRequest();
      } else {
        let res = await fetch("/filter/" + cuisine);
        await statusCheck(res);
        res = await res.json();
        displayRestaurants(res);
      }
    } catch (err) {
      handleError();
    }
  }

  /**
   * enables/disables the search button
   * if the search bar is empty or only contains white spaces, disables the search button
   * otherwise enables it
   * No params nor returns
   */
  function toggleSearchButton() {
    let query = id("search-bar").value.replaceAll(" ", "");
    if (query) {
      id("search-btn").disabled = false;
    } else {
      id("search-btn").disabled = true;
    }
  }

  /**
   * make a search request and displays restaurants that match the query
   * No params nor returns
   */
  async function makeSearchRequest() {
    try {
      let query = id("search-bar").value;
      let res = await fetch("/search?search=" + query);
      await statusCheck(res);
      res = await res.json();
      displayRestaurants(res);
    } catch (err) {
      handleError();
    }
  }

  /**
   * shows the error message
   * No params nor returns
   */
  function handleError() {
    qs(".error").classList.remove("hidden");
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }
})();