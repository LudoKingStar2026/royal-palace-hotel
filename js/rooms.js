/* =========================================================
   ROYAL PALACE HOTEL
   ROOM MANAGEMENT MODULE
   FINAL VERSION
========================================================= */

(function () {

    "use strict";

    const ROOM_KEY = "royal_palace_rooms";

    let rooms = [];

    let searchText = "";


    /* =====================================================
       DEFAULT ROOMS
    ===================================================== */

    const defaultRooms = [

        {
            id: "ROOM001",
            name: "Premium Room",
            number: "101",
            type: "Premium",
            price: 2500,
            status: "available"
        },

        {
            id: "ROOM002",
            name: "Premium Room",
            number: "102",
            type: "Premium",
            price: 2500,
            status: "booked"
        },

        {
            id: "ROOM003",
            name: "Deluxe Room",
            number: "103",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },

        {
            id: "ROOM004",
            name: "Deluxe Room",
            number: "104",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },

        {
            id: "ROOM005",
            name: "Royal Suite",
            number: "201",
            type: "Suite",
            price: 4500,
            status: "booked"
        },

        {
            id: "ROOM006",
            name: "Royal Suite",
            number: "202",
            type: "Suite",
            price: 4500,
            status: "available"
        },

        {
            id: "ROOM007",
            name: "Royal Palace Suite",
            number: "301",
            type: "Suite",
            price: 6500,
            status: "available"
        },

        {
            id: "ROOM008",
            name: "Royal Palace Suite",
            number: "302",
            type: "Suite",
            price: 6500,
            status: "booked"
        }

    ];


    /* =====================================================
       LOAD ROOMS
    ===================================================== */

    function loadRooms() {

        try {

            const saved =
                localStorage.getItem(ROOM_KEY);

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                if (Array.isArray(parsed)) {

                    rooms = parsed;

                    return;

                }

            }

        } catch (error) {

            console.error(
                "Room data error:",
                error
            );

        }


        rooms =
            JSON.parse(
                JSON.stringify(defaultRooms)
            );

        saveRooms();

    }


    /* =====================================================
       SAVE ROOMS
    ===================================================== */

    function saveRooms() {

        try {

            localStorage.setItem(
                ROOM_KEY,
                JSON.stringify(rooms)
            );

        } catch (error) {

            console.error(
                "Unable to save rooms:",
                error
            );

        }

    }


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        return "₹" +
            Number(value || 0)
            .toLocaleString("en-IN");

    }


    /* =====================================================
       UPDATE ROOM STATISTICS
    ===================================================== */

    function updateRoomStats() {

        const total =
            rooms.length;

        const available =
            rooms.filter(function (room) {

                return room.status === "available";

            }).length;

        const booked =
            rooms.filter(function (room) {

                return room.status === "booked";

            }).length;


        const totalPrice =
            rooms.reduce(
                function (sum, room) {

                    return sum +
                        Number(room.price || 0);

                },
                0
            );


        const average =
            total
                ? Math.round(totalPrice / total)
                : 0;


        const totalEl =
            document.getElementById("roomTotal");

        const availableEl =
            document.getElementById("roomAvailable");

        const bookedEl =
            document.getElementById("roomBooked");

        const averageEl =
            document.getElementById("roomAverage");


        if (totalEl) {
            totalEl.textContent = total;
        }

        if (availableEl) {
            availableEl.textContent = available;
        }

        if (bookedEl) {
            bookedEl.textContent = booked;
        }

        if (averageEl) {
            averageEl.textContent =
                formatMoney(average);
        }

    }


    /* =====================================================
       RENDER ROOMS
    ===================================================== */

    function renderRooms() {

        const grid =
            document.getElementById("roomsGrid");

        if (!grid) {
            return;
        }


        const filtered =
            rooms.filter(function (room) {

                const text =
                    (
                        room.name +
                        " " +
                        room.number +
                        " " +
                        room.type
                    ).toLowerCase();

                return text.includes(searchText);

            });


        if (!filtered.length) {

            grid.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🛏️
                    </div>

                    <h3>
                        No rooms found
                    </h3>

                    <p>
                        Try another search
                        or add a new room.
                    </p>

                </div>

            `;

            return;

        }


        grid.innerHTML =
            filtered.map(function (room) {

                const booked =
                    room.status === "booked";


                return `

                    <div
                        class="
                            room-card
                            ${
                                booked
                                ? "room-booked"
                                : "room-available"
                            }
                        "
                    >

                        <div class="room-card-top">

                            <div class="room-icon">
                                🛏️
                            </div>

                            <span
                                class="
                                    room-status
                                    ${
                                        booked
                                        ? "room-status-booked"
                                        : "room-status-available"
                                    }
                                "
                            >
                                ${
                                    booked
                                    ? "Booked"
                                    : "Available"
                                }
                            </span>

                        </div>


                        <div class="room-card-body">

                            <h3>
                                ${escapeHTML(room.name)}
                            </h3>

                            <p class="room-number">
                                Room
                                ${escapeHTML(room.number)}
                            </p>

                            <p class="room-type">
                                ${escapeHTML(room.type)}
                            </p>


                            <div class="room-card-bottom">

                                <strong>
                                    ${formatMoney(room.price)}
                                    <small>/ night</small>
                                </strong>

                            </div>


                            <div class="room-actions">

                                <button
                                    type="button"
                                    onclick="editRoom('${room.id}')"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    onclick="toggleRoomStatus('${room.id}')"
                                >
                                    ${
                                        booked
                                        ? "🟢 Available"
                                        : "🔴 Booked"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="delete-room"
                                    onclick="deleteRoom('${room.id}')"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       UPDATE ROOM PAGE
    ===================================================== */

    function updateRoomsPage() {

        updateRoomStats();

        renderRooms();

    }


    /* =====================================================
       OPEN ADD ROOM MODAL
    ===================================================== */

    function openRoomModal() {

        const modal =
            document.getElementById("roomModal");

        const form =
            document.getElementById("roomForm");

        const title =
            document.getElementById("roomModalTitle");


        if (!modal) {
            return;
        }


        if (form) {
            form.reset();
        }


        const editId =
            document.getElementById("roomEditId");

        if (editId) {
            editId.value = "";
        }


        if (title) {
            title.textContent = "Add New Room";
        }


        /*
         * IMPORTANT:
         * CSS uses .modal-open
         */

        modal.classList.add("modal-open");

        document.body.classList.add("modal-open");

    }


    /* =====================================================
       CLOSE ROOM MODAL
    ===================================================== */

    function closeRoomModal() {

        const modal =
            document.getElementById("roomModal");


        if (modal) {

            modal.classList.remove("modal-open");

        }


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE ON OVERLAY
    ===================================================== */

    function closeRoomModalOnOverlay(event) {

        if (
            event.target &&
            event.target.id === "roomModal"
        ) {

            closeRoomModal();

        }

    }


    /* =====================================================
       SAVE ROOM
    ===================================================== */

    function saveRoom(event) {

        if (event) {
            event.preventDefault();
        }


        const editIdEl =
            document.getElementById("roomEditId");

        const nameEl =
            document.getElementById("roomName");

        const numberEl =
            document.getElementById("roomNumber");

        const priceEl =
            document.getElementById("roomPrice");

        const typeEl =
            document.getElementById("roomType");

        const statusEl =
            document.getElementById("roomStatus");


        if (
            !nameEl ||
            !numberEl ||
            !priceEl ||
            !typeEl ||
            !statusEl
        ) {

            return;

        }


        const editId =
            editIdEl
            ? editIdEl.value.trim()
            : "";


        const name =
            nameEl.value.trim();


        const number =
            numberEl.value.trim();


        const price =
            Number(priceEl.value);


        const type =
            typeEl.value;


        const status =
            statusEl.value;


        if (
            !name ||
            !number ||
            !type ||
            !Number.isFinite(price) ||
            price < 0
        ) {

            alert(
                "Please enter valid room details."
            );

            return;

        }


        const duplicate =
            rooms.some(function (room) {

                return (
                    String(room.number)
                    .toLowerCase() ===
                    number.toLowerCase()
                    &&
                    room.id !== editId
                );

            });


        if (duplicate) {

            alert(
                "This room number already exists."
            );

            return;

        }


        /* EDIT EXISTING ROOM */

        if (editId) {

            const room =
                rooms.find(function (item) {

                    return item.id === editId;

                });


            if (room) {

                room.name =
                    name;

                room.number =
                    number;

                room.price =
                    price;

                room.type =
                    type;

                room.status =
                    status;

            }

        }


        /* ADD NEW ROOM */

        else {

            rooms.push({

                id:
                    "ROOM" +
                    Date.now(),

                name:
                    name,

                number:
                    number,

                type:
                    type,

                price:
                    price,

                status:
                    status

            });

        }


        saveRooms();

        updateRoomsPage();

        closeRoomModal();

    }


    /* =====================================================
       EDIT ROOM
    ===================================================== */

    function editRoom(id) {

        const room =
            rooms.find(function (item) {

                return item.id === id;

            });


        if (!room) {
            return;
        }


        const modal =
            document.getElementById("roomModal");


        const editId =
            document.getElementById("roomEditId");

        const name =
            document.getElementById("roomName");

        const number =
            document.getElementById("roomNumber");

        const price =
            document.getElementById("roomPrice");

        const type =
            document.getElementById("roomType");

        const status =
            document.getElementById("roomStatus");

        const title =
            document.getElementById("roomModalTitle");


        if (editId) {
            editId.value = room.id;
        }

        if (name) {
            name.value = room.name;
        }

        if (number) {
            number.value = room.number;
        }

        if (price) {
            price.value = room.price;
        }

        if (type) {

            /*
             * Existing default data uses "Suite".
             * Convert it to the correct select value.
             */

            if (
                room.type === "Suite"
            ) {

                if (
                    room.name === "Royal Palace Suite"
                ) {

                    type.value =
                        "Royal Palace Suite";

                } else {

                    type.value =
                        "Royal Suite";

                }

            } else {

                type.value =
                    room.type;

            }

        }

        if (status) {
            status.value = room.status;
        }

        if (title) {
            title.textContent = "Edit Room";
        }


        if (modal) {

            modal.classList.add(
                "modal-open"
            );

        }


        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       TOGGLE ROOM STATUS
    ===================================================== */

    function toggleRoomStatus(id) {

        const room =
            rooms.find(function (item) {

                return item.id === id;

            });


        if (!room) {
            return;
        }


        room.status =
            room.status === "available"
            ? "booked"
            : "available";


        saveRooms();

        updateRoomsPage();

    }


    /* =====================================================
       DELETE ROOM
    ===================================================== */

    function deleteRoom(id) {

        const room =
            rooms.find(function (item) {

                return item.id === id;

            });


        if (!room) {
            return;
        }


        const confirmed =
            confirm(
                "Delete Room " +
                room.number +
                "?"
            );


        if (!confirmed) {
            return;
        }


        rooms =
            rooms.filter(function (item) {

                return item.id !== id;

            });


        saveRooms();

        updateRoomsPage();

    }


    /* =====================================================
       SEARCH ROOMS
    ===================================================== */

    function searchRooms(value) {

        /*
         * Supports:
         * searchRooms()
         * searchRooms(value)
         */

        if (
            typeof value === "undefined"
        ) {

            const input =
                document.getElementById(
                    "roomSearch"
                );

            value =
                input
                ? input.value
                : "";

        }


        searchText =
            String(value || "")
            .toLowerCase()
            .trim();


        renderRooms();

    }


    /* =====================================================
       CLOSE MODAL WITH ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeRoomModal();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            /*
             * Make absolutely sure modal
     
