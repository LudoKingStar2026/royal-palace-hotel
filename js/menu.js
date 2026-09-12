/* =========================================
   ROYAL PALACE HOTEL
   MOBILE MENU SYSTEM
========================================= */

function closeMobileMenu() {
    const menu = document.getElementById("menuToggle");

    if (menu) {
        menu.checked = false;
    }
}


/* =========================================
   NAVIGATION
========================================= */

function showView(view) {

    // Mobile menu बंद करें
    closeMobileMenu();

    // सभी views hide करें
    document.querySelectorAll(".view").forEach(function(section) {
        section.classList.remove("active");
    });

    // चुना हुआ view दिखाएँ
    const selectedView = document.getElementById(view + "View");

    if (selectedView) {
        selectedView.classList.add("active");
    }


    // सभी navigation buttons से active हटाएँ
    document.querySelectorAll(".nav button").forEach(function(button) {
        button.classList.remove("active");
    });


    // सही button active करें
    if (view === "dashboard") {

        const button = document.getElementById("navDashboard");

        if (button) {
            button.classList.add("active");
        }

        const title = document.getElementById("topTitle");

        if (title) {
            title.textContent = "Dashboard";
        }
    }


    if (view === "rooms") {

        const button = document.getElementById("navRooms");

        if (button) {
            button.classList.add("active");
        }

        const title = document.getElementById("topTitle");

        if (title) {
            title.textContent = "Room Management";
        }
    }


    if (view === "bookings") {

        const button = document.getElementById("navBookings");

        if (button) {
            button.classList.add("active");
        }

        const title = document.getElementById("topTitle");

        if (title) {
            title.textContent = "Booking History";
        }
    }


    if (view === "settings") {

        const button = document.getElementById("navSettings");

        if (button) {
            button.classList.add("active");
        }

        const title = document.getElementById("topTitle");

        if (title) {
            title.textContent = "Settings";
        }
    }
}


/* =========================================
   ESC = CLOSE MENU
========================================= */

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeMobileMenu();
    }

});


/* =========================================
   PAGE SHOW / BACK BUTTON FIX
========================================= */

window.addEventListener("pageshow", function() {

    closeMobileMenu();

});


/* =========================================
   DESKTOP MENU RESET
========================================= */

window.addEventListener("resize", function() {

    if (window.innerWidth > 800) {
        closeMobileMenu();
    }

});
