(function () {
    "use strict";

    /* =========================================================
       ROYAL PALACE HOTEL
       ROOM MANAGEMENT MODULE V9.0
       ========================================================= */

    const VERSION = "9.0";
    const STORAGE_KEY = "royal_palace_rooms";
    const INIT_KEY = "royal_palace_rooms_initialized_v9";

    const DEFAULT_ROOMS = [
        {
            id: "ROOM001",
            number: "101",
            name: "Premium Room 101",
            type: "Premium",
            price: 2500,
            status: "available"
        },
        {
            id: "ROOM002",
            number: "102",
            name: "Premium Room 102",
            type: "Premium",
            price: 2500,
            status: "booked"
        },
        {
            id: "ROOM003",
            number: "103",
            name: "Deluxe Room 103",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },
        {
            id: "ROOM004",
            number: "104",
            name: "Deluxe Room 104",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },
        {
            id: "ROOM005",
            number: "201",
            name: "Royal Suite 201",
            type: "Suite",
            price: 4500,
            status: "booked"
        },
        {
            id: "ROOM006",
            number: "202",
            name: "Royal Suite 202",
            type: "Suite",
            price: 4500,
            status: "available"
        },
        {
            id: "ROOM007",
            number: "301",
            name: "Royal Palace Suite 301",
            type: "Suite",
            price: 6500,
            status: "available"
        },
        {
            id: "ROOM008",
            number: "302",
            name: "Royal Palace Suite 302",
            type: "Suite",
            price: 6500,
            status: "booked"
        }
    ];

    let rooms = [];
    let editingRoomId = null;
    let currentSearch = "";

    /* =========================================================
       HELPERS
       ========================================================= */

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(value) {
        const n = Number(value) || 0;

        try {
            return "₹" + n.toLocaleString("en-IN");
        } catch (e) {
            return "₹" + n;
        }
    }

    function reportError(error) {
        console.error("[Royal Rooms]", error);

        try {
            if (
                typeof window.reportAppError ===
                "function"
            ) {
                window.reportAppError(
                    error,
                    "Rooms"
                );
            }
        } catch (ignored) {}
    }

    function getRoomId(room) {
        return String(
            room.id ||
            room.room_id ||
            room.roomId ||
            ""
        );
    }

    function getRoomNumber(room) {
        return String(
            room.number ||
            room.room_number ||
            room.roomNumber ||
            ""
        );
    }

    function getRoomName(room) {
        return String(
            room.name ||
            room.room_name ||
            room.room ||
            getRoomNumber(room) ||
            "Room"
        );
    }

    function getRoomType(room) {
        return String(
            room.type ||
            room.room_type ||
            "Standard"
        );
    }

    function getRoomPrice(room) {
        return (
            Number(
                room.price ??
                room.price_per_night ??
                room.rate ??
                0
            ) || 0
        );
    }

    function getRoomStatus(room) {
        const status = String(
            room.status ||
            "available"
        ).toLowerCase();

        return status === "booked"
            ? "booked"
            : "available";
    }

    /* =========================================================
       STORAGE
       ========================================================= */

    function normalizeRoom(room, index) {
        return {
            id:
                getRoomId(room) ||
                "ROOM" +
                    String(index + 1).padStart(
                        3,
                        "0"
                    ),

            number:
                getRoomNumber(room) ||
                String(index + 101),

            name:
                getRoomName(room),

            type:
                getRoomType(room),

            price:
                getRoomPrice(room),

            status:
                getRoomStatus(room)
        };
    }

    function loadRooms() {
        try {
            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (saved !== null) {
                const parsed =
                    JSON.parse(saved);

                if (Array.isArray(parsed)) {

                    /*
                     * If an old broken/empty storage
                     * exists and V9 has never initialized,
                     * restore the default hotel rooms once.
                     */
                    const initialized =
                        localStorage.getItem(
                            INIT_KEY
                        );

                    if (
                        parsed.length === 0 &&
                        !initialized
                    ) {
                        rooms =
                            DEFAULT_ROOMS.map(
                                function (room) {
                                    return Object.assign(
                                        {},
                                        room
                                    );
                                }
                            );

                        localStorage.setItem(
                            INIT_KEY,
                            "1"
                        );

                        saveRooms(false);

                        return rooms;
                    }

                    rooms =
                        parsed.map(
                            normalizeRoom
                        );

                    return rooms;
                }
            }
        } catch (error) {
            reportError(error);
        }

        rooms =
            DEFAULT_ROOMS.map(
                function (room) {
                    return Object.assign(
                        {},
                        room
                    );
                }
            );

        try {
            localStorage.setItem(
                INIT_KEY,
                "1"
            );
        } catch (ignored) {}

        saveRooms(false);

        return rooms;
    }

    function saveRooms(dispatchEvent) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(rooms)
            );

            localStorage.setItem(
                INIT_KEY,
                "1"
            );
        } catch (error) {
            reportError(error);
        }

        if (dispatchEvent !== false) {
            try {
                document.dispatchEvent(
                    new CustomEvent(
                        "royalRoomsChanged",
                        {
                            detail: {
                                rooms:
                                    rooms.slice()
                            }
                        }
                    )
                );
            } catch (error) {
                reportError(error);
            }
        }

        try {
            if (
                typeof window.updateDashboard ===
                "function"
            ) {
                window.updateDashboard();
            }
        } catch (ignored) {}
    }

    /* =========================================================
       FIELD HELPERS
       ========================================================= */

    function findElement(ids) {
        for (
            let i = 0;
            i < ids.length;
            i++
        ) {
            const element =
                document.getElementById(
                    ids[i]
                );

            if (element) {
                return element;
            }
        }

        return null;
    }

    function getRoomIdInput() {
        return findElement([
            "roomId",
            "roomEditId"
        ]);
    }

    function getRoomNumberInput() {
        return findElement([
            "roomNumber",
            "roomNo"
        ]);
    }

    function getRoomNameInput() {
        return findElement([
            "roomName"
        ]);
    }

    function getRoomTypeInput() {
        return findElement([
            "roomType"
        ]);
    }

    function getRoomPriceInput() {
        return findElement([
            "roomPrice"
        ]);
    }

    function getRoomStatusInput() {
        return findElement([
            "roomStatus"
        ]);
    }

    function getModal() {
        return (
            document.getElementById(
                "roomModal"
            ) ||
            document.getElementById(
                "addRoomModal"
            )
        );
    }

    /* =========================================================
       ID GENERATOR
       ========================================================= */

    function generateRoomId() {
        let number = 1;
        let id = "";

        do {
            id =
                "ROOM" +
                String(number).padStart(
                    3,
                    "0"
                );

            number++;
        } while (
            rooms.some(
                function (room) {
                    return (
                        getRoomId(room) ===
                        id
                    );
                }
            )
        );

        return id;
    }

    function generateRoomNumber() {
        let number = 101;

        while (
            rooms.some(
                function (room) {
                    return (
                        getRoomNumber(
                            room
                        ) ===
                        String(number)
                    );
                }
            )
        ) {
            number++;
        }

        return String(number);
    }

    /* =========================================================
       MODAL
       ========================================================= */

    function openRoomModal(roomId) {
        const modal = getModal();

        if (!modal) {
            console.warn(
                "Room modal not found."
            );
            return;
        }

        editingRoomId =
            roomId
                ? String(roomId)
                : null;

        const title =
            document.getElementById(
                "roomModalTitle"
            );

        const idInput =
            getRoomIdInput();

        const numberInput =
            getRoomNumberInput();

        const nameInput =
            getRoomNameInput();

        const typeInput =
            getRoomTypeInput();

        const priceInput =
            getRoomPriceInput();

        const statusInput =
            getRoomStatusInput();

        if (editingRoomId) {
            const room =
                rooms.find(
                    function (item) {
                        return (
                            getRoomId(
                                item
                            ) ===
                            editingRoomId
                        );
                    }
                );

            if (!room) {
                editingRoomId = null;
                return;
            }

            if (title) {
                title.textContent =
                    "Edit Room";
            }

            if (idInput) {
                idInput.value =
                    getRoomId(room);
                idInput.readOnly = true;
            }

            if (numberInput) {
                numberInput.value =
                    getRoomNumber(room);
            }

            if (nameInput) {
                nameInput.value =
                    getRoomName(room);
            }

            if (typeInput) {
                typeInput.value =
                    getRoomType(room);
            }

            if (priceInput) {
                priceInput.value =
                    getRoomPrice(room);
            }

            if (statusInput) {
                statusInput.value =
                    getRoomStatus(room);
            }
        } else {
            if (title) {
                title.textContent =
                    "Add New Room";
            }

            if (idInput) {
                idInput.value =
                    generateRoomId();

                idInput.readOnly = false;
            }

            if (numberInput) {
                numberInput.value =
                    generateRoomNumber();
            }

            if (nameInput) {
                nameInput.value = "";
            }

            if (typeInput) {
                typeInput.value =
                    "Premium";
            }

            if (priceInput) {
                priceInput.value = "";
            }

            if (statusInput) {
                statusInput.value =
                    "available";
            }
        }

        modal.style.display = "flex";

        modal.classList.add(
            "modal-open"
        );

        document.body.classList.add(
            "room-modal-active"
        );
    }

    function closeRoomModal() {
        const modal = getModal();

        if (!modal) return;

        modal.classList.remove(
            "modal-open"
        );

        modal.style.display = "none";

        document.body.classList.remove(
            "room-modal-active"
        );

        editingRoomId = null;
    }

    function closeRoomModalOnOverlay(
        event
    ) {
        const modal = getModal();

        if (
            modal &&
            event.target === modal
        ) {
            closeRoomModal();
        }
    }

    /* =========================================================
       SAVE ROOM
       ========================================================= */

    function saveRoom(event) {
        if (event) {
            event.preventDefault();
        }

        try {
            const idInput =
                getRoomIdInput();

            const numberInput =
                getRoomNumberInput();

            const nameInput =
                getRoomNameInput();

            const typeInput =
                getRoomTypeInput();

            const priceInput =
                getRoomPriceInput();

            const statusInput =
                getRoomStatusInput();

            let id =
                idInput &&
                String(
                    idInput.value || ""
                ).trim();

            let number =
                numberInput &&
                String(
                    numberInput.value || ""
                ).trim();

            const name =
                nameInput &&
                String(
                    nameInput.value || ""
                ).trim();

            const type =
                typeInput &&
                String(
                    typeInput.value || ""
                ).trim();

            const price =
                Number(
                    priceInput &&
                    priceInput.value
                ) || 0;

            const status =
                statusInput &&
                String(
                    statusInput.value ||
                        "available"
                ).toLowerCase();

            if (!id) {
                id =
                    editingRoomId ||
                    generateRoomId();
            }

            if (!number) {
                number =
                    generateRoomNumber();
            }

            if (!name) {
                alert(
                    "Please enter room name."
                );

                if (nameInput) {
                    nameInput.focus();
                }

                return false;
            }

            if (price <= 0) {
                alert(
                    "Please enter a valid room price."
                );

                if (priceInput) {
                    priceInput.focus();
                }

                return false;
            }

            const finalStatus =
                status === "booked"
                    ? "booked"
                    : "available";

            /*
             * Prevent duplicate room number.
             */
            const duplicateNumber =
                rooms.find(
                    function (room) {
                        return (
                            getRoomNumber(
                                room
                            ) ===
                                number &&
                            getRoomId(
                                room
                            ) !== id
                        );
                    }
                );

            if (duplicateNumber) {
                alert(
                    "Room number " +
                        number +
                        " already exists."
                );

                if (numberInput) {
                    numberInput.focus();
                }

                return false;
            }

            const room = {
                id: id,
                number: number,
                name: name,
                type:
                    type || "Standard",
                price: price,
                status: finalStatus
            };

            const existingIndex =
                rooms.findIndex(
                    function (item) {
                        return (
                            getRoomId(
                                item
                            ) === id
                        );
                    }
                );

            if (
                editingRoomId &&
                existingIndex >= 0
            ) {
                rooms[
                    existingIndex
                ] = room;
            } else {
                rooms.push(room);
            }

            saveRooms(true);

            renderRooms();

            updateRoomCounters();

            closeRoomModal();

            showRoomToast(
                editingRoomId
                    ? "Room updated successfully."
                    : "Room added successfully."
            );

            return true;
        } catch (error) {
            reportError(error);

            alert(
                "Unable to save room."
            );

            return false;
        }
    }

    /* =========================================================
       EDIT
       ========================================================= */

    function editRoom(roomId) {
        openRoomModal(
            String(roomId)
        );
    }

    /* =========================================================
       TOGGLE STATUS
       ========================================================= */

    function toggleRoomStatus(
        roomId
    ) {
        const id =
            String(roomId);

        const index =
            rooms.findIndex(
                function (room) {
                    return (
                        getRoomId(room) ===
                        id
                    );
                }
            );

        if (index < 0) return;

 
        rooms[index].status =
            getRoomStatus(rooms[index]) ===
            "booked"
                ? "available"
                : "booked";

        saveRooms(true);
        renderRooms();
        updateRoomCounters();

        showRoomToast(
            rooms[index].status === "booked"
                ? "Room marked as booked."
                : "Room marked as available."
        );
    }

    /* =========================================================
       DELETE ROOM
    ========================================================= */

    function deleteRoom(roomId) {
        try {
            const id = String(roomId);

            const room =
                rooms.find(function (item) {
                    return (
                        getRoomId(item) === id
                    );
                });

            if (!room) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Delete " +
                        getRoomName(room) +
                        "?"
                );

            if (!confirmed) {
                return;
            }

            rooms =
                rooms.filter(function (item) {
                    return (
                        getRoomId(item) !== id
                    );
                });

            saveRooms(true);
            renderRooms();
            updateRoomCounters();

            showRoomToast(
                "Room deleted successfully."
            );
        } catch (error) {
            reportError(error);

            alert(
                "Unable to delete room."
            );
        }
    }

    /* =========================================================
       SEARCH ROOMS
    ========================================================= */

    function searchRooms(value) {
        const search =
            String(value || "")
                .trim()
                .toLowerCase();

        if (!search) {
            renderRooms();
            return;
        }

        const filtered =
            rooms.filter(function (room) {
                const text =
                    [
                        getRoomId(room),
                        getRoomName(room),
                        room.roomNumber || "",
                        getRoomType(room),
                        getRoomStatus(room),
                        getRoomPrice(room)
                    ]
                        .join(" ")
                        .toLowerCase();

                return text.includes(search);
            });

        renderRooms(filtered);
    }
}

/* =========================================================
   ROOM TOAST
   ========================================================= */

function showRoomToast(message) {
    try {
        let toast =
            document.getElementById("roomToast");

        if (!toast) {
            toast =
                document.createElement("div");

            toast.id = "roomToast";

            toast.style.position = "fixed";
            toast.style.left = "50%";
            toast.style.bottom = "25px";
            toast.style.transform =
                "translateX(-50%)";
            toast.style.zIndex = "99999";
            toast.style.padding =
                "12px 20px";
            toast.style.borderRadius =
                "14px";
            toast.style.background =
                "linear-gradient(135deg,#6d28d9,#2563eb)";
            toast.style.color = "#fff";
            toast.style.fontWeight = "700";
            toast.style.fontSize = "14px";
            toast.style.boxShadow =
                "0 10px 30px rgba(0,0,0,.25)";
            toast.style.transition =
                "opacity .3s ease";

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = "1";

        clearTimeout(
            toast._timer
        );

        toast._timer =
            setTimeout(function () {
                toast.style.opacity = "0";
            }, 2200);

    } catch (error) {
        reportError(error);
    }
}

/* =========================================================
   ROOM COUNTERS
   ========================================================= */

function updateRoomCounters() {
    try {
        const total =
            rooms.length;

        const available =
            rooms.filter(
                function (room) {
                    return (
                        getRoomStatus(room) ===
                        "available"
                    );
                }
            ).length;

        const booked =
            rooms.filter(
                function (room) {
                    return (
                        getRoomStatus(room) ===
                        "booked"
                    );
                }
            ).length;

        let totalPrice = 0;

        rooms.forEach(
            function (room) {
                totalPrice +=
                    getRoomPrice(room);
            }
        );

        const average =
            total > 0
                ? Math.round(
                      totalPrice / total
                  )
                : 0;

        const totalEl =
            document.getElementById(
                "roomTotal"
            );

        const availableEl =
            document.getElementById(
                "roomAvailable"
            );

        const bookedEl =
            document.getElementById(
                "roomBooked"
            );

        const averageEl =
            document.getElementById(
                "roomAverage"
            );

        if (totalEl) {
            totalEl.textContent =
                total;
        }

        if (availableEl) {
            availableEl.textContent =
                available;
        }

        if (bookedEl) {
            bookedEl.textContent =
                booked;
        }

        if (averageEl) {
            averageEl.textContent =
                money(average);
        }

    } catch (error) {
        reportError(error);
    }
}

/* =========================================================
   RENDER ROOMS
   ========================================================= */

function renderRooms(list) {
    try {
        const container =
            document.getElementById(
                "roomsGrid"
            );

        if (!container) {
            return;
        }

        const source =
            Array.isArray(list)
                ? list
                : rooms;

        if (!source.length) {
            container.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    padding:45px 20px;
                    text-align:center;
                    background:#fff;
                    border-radius:18px;
                    border:1px solid #eee;
                    box-shadow:0 5px 20px rgba(0,0,0,.05);
                ">
                    <div style="
                        font-size:48px;
                        margin-bottom:12px;
                    ">
                        🏨
                    </div>

                    <div style="
                        font-size:20px;
                        font-weight:800;
                        color:#222;
                    ">
                        No Rooms Found
                    </div>

                    <div style="
                        margin-top:8px;
                        color:#777;
                        font-size:14px;
                    ">
                        Add a new room to start
                        your room management.
                    </div>
                </div>
            `;

            updateRoomCounters();
            return;
        }

        container.innerHTML =
            source.map(
                function (room) {
                    return createRoomCard(
                        room
                    );
                }
            ).join("");

        updateRoomCounters();

    } catch (error) {
        reportError(error);
    }
}

/* =========================================================
   ROOM SEARCH INPUT
   ========================================================= */

function initRoomSearch() {
    try {
        const searchInput =
            document.getElementById(
                "roomSearch"
            );

        if (!searchInput) {
            return;
        }

        searchInput.addEventListener(
            "input",
            function () {
                searchRooms(
                    searchInput.value
                );
            }
        );

    } catch (error) {
        reportError(error);
    }
}

/* =========================================================
   ROOM MODAL EVENTS
   ========================================================= */

function initRoomEvents() {
    try {
        const modal =
            getModal();

        if (modal) {
            modal.addEventListener(
                "click",
                closeRoomModalOnOverlay
            );
        }

        initRoomSearch();

        const form =
            document.getElementById(
                "roomForm"
            );

        if (form) {
            form.addEventListener(
                "submit",
                function (event) {
                    event.preventDefault();
                    saveRoom();
                }
            );
        }

        const addButton =
            document.getElementById(
                "addRoomButton"
            );

        if (addButton) {
            addButton.addEventListener(
                "click",
                function () {
                    openRoomModal();
                }
            );
        }

        const closeButton =
            document.getElementById(
                "closeRoomModal"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeRoomModal
            );
        }

        const cancelButton =
            document.getElementById(
                "cancelRoomButton"
            );

        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                closeRoomModal
            );
        }

        const saveButton =
            document.getElementById(
                "saveRoomButton"
            );

        if (
            saveButton &&
            !form
        ) {
            saveButton.addEventListener(
                "click",
                function () {
                    saveRoom();
                }
            );
        }

        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key ===
                    "Escape"
                ) {
                    closeRoomModal();
                }
            }
        );

    } catch (error) {
        reportError(error);
    }
}

/* =========================================================
   ROOM PAGE UPDATE
   ========================================================= */

function updateRoomsPage() {
    try {
        loadRooms();
        renderRooms();
        updateRoomCounters();
    } catch (error) {
        reportError(error);
    }
}

/* =========================================================
   ROOM STORAGE EVENT
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {
        if (
            event.key ===
            STORAGE_KEY
        ) {
            loadRooms();
            renderRooms();
            updateRoomCounters();
        }
    }
);

/* =========================================================
   ROOM CHANGE EVENT
   ========================================================= */

document.addEventListener(
    "royalRoomsChanged",
    function () {
        try {
            renderRooms();
            updateRoomCounters();
        } catch (error) {
            reportError(error);
        }
    }
);

/* =========================================================
   PUBLIC API
   ========================================================= */

window.openRoomModal =
    openRoomModal;

window.closeRoomModal =
    closeRoomModal;

window.saveRoom =
    saveRoom;

window.editRoom =
    editRoom;

window.toggleRoomStatus =
    toggleRoomStatus;

window.deleteRoom =
    deleteRoom;

window.searchRooms =
    searchRooms;

window.updateRoomsPage =
    updateRoomsPage;

window.renderRooms =
    renderRooms;

window.getRooms =
    function () {
        return rooms.slice();
    };

window.getRoomById =
    function (roomId) {
        return (
            rooms.find(
                function (room) {
                    return (
                        getRoomId(room) ===
                        String(roomId)
                    );
                }
            ) || null
        );
    };

window.reloadRooms =
    function () {
        loadRooms();
        renderRooms();
        updateRoomCounters();
    };

window.ROYAL_ROOMS =
    window.ROYAL_ROOMS || {};

window.ROYAL_ROOMS.version =
    VERSION;

window.ROYAL_ROOMS.getAll =
    function () {
        return rooms.slice();
    };

/* =========================================================
   START
   ========================================================= */

function startRooms() {
    loadRooms();
    initRoomEvents();
    renderRooms();
    updateRoomCounters();
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        startRooms,
        {
            once: true
        }
    );
} else {
    startRooms();
}


    /* =========================================================
       ROOM TOAST
    ========================================================= */

    function showRoomToast(message) {
        try {
            let toast =
                document.getElementById(
                    "roomToast"
                );

            if (!toast) {
                toast =
                    document.createElement(
                        "div"
                    );
        toast.id =
            "roomToast";

        toast.style.position =
            "fixed";

        toast.style.left =
            "50%";

        toast.style.bottom =
            "25px";

        toast.style.transform =
            "translateX(-50%)";

        toast.style.zIndex =
            "999999";

        toast.style.padding =
            "12px 20px";

        toast.style.borderRadius =
            "14px";

        toast.style.background =
            "linear-gradient(135deg,#6d28d9,#2563eb)";

        toast.style.color =
            "#fff";

        toast.style.fontWeight =
            "700";

        toast.style.fontSize =
            "14px";

        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.25)";

        toast.style.transition =
            "opacity .3s ease";

        document.body.appendChild(
            toast
        );
    }

    toast.textContent =
        message;

    toast.style.opacity =
        "1";

    clearTimeout(
        window.__roomToastTimer
    );

    window.__roomToastTimer =
        setTimeout(
            function () {
                toast.style.opacity =
                    "0";
            },
            2500
        );

} catch (error) {
    console.warn(
        "Room toast error:",
        error
    );
}
}

/* =====================================================
   PUBLIC ROOM API
===================================================== */

window.editRoom =
    editRoom;

window.toggleRoomStatus =
    toggleRoomStatus;

window.deleteRoom =
    deleteRoom;

window.searchRooms =
    searchRooms;

window.updateRoomsPage =
    updateRoomsPage;

window.renderRooms =
    renderRooms;

window.getRooms =
    function () {
        return rooms.slice();
    };

window.getRoomById =
    function (roomId) {
        return (
            rooms.find(
                function (room) {
                    return (
                        getRoomId(room) ===
                        String(roomId)
                    );
                }
            ) || null
        );
    };

window.reloadRooms =
    function () {
        loadRooms();
        renderRooms();
        updateRoomCounters();
    };

window.ROYAL_ROOMS =
    window.ROYAL_ROOMS || {};

window.ROYAL_ROOMS.version =
    VERSION;

window.ROYAL_ROOMS.getAll =
    function () {
        return rooms.slice();
    };

/* =====================================================
   FINAL START
===================================================== */

function bootRooms() {
    loadRooms();
    initRoomEvents();
    renderRooms();
    updateRoomCounters();
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        bootRooms,
        {
            once: true
        }
    );
} else {
    bootRooms();
}

})();
                toast.id =
                    "roomToast";

                toast.style.position =
                    "fixed";

                toast.style.left =
                    "50%";

                toast.style.bottom =
                    "25px";

                toast.style.transform =
                    "translateX(-50%)";

                toast.style.zIndex =
                    "99999";

                toast.style.padding =
                    "12px 20px";

                toast.style.borderRadius =
                    "14px";

                toast.style.background =
                    "linear-gradient(135deg,#6d28d9,#2563eb)";

                toast.style.color =
                    "#fff";

                toast.style.fontWeight =
                    "700";

                toast.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,.25)";

                document.body.appendChild(
                    toast
                );
            }

            toast.textContent =
                message;

            toast.style.display =
                "block";

            clearTimeout(
                toast._timer
            );

            toast._timer =
                setTimeout(function () {
                    toast.style.display =
                        "none";
                }, 2200);
        } catch (error) {
            console.log(message);
        }
    }

    /* =========================================================
       ROOM COUNTERS
    ========================================================= */

    function updateRoomCounters() {
        const total =
            rooms.length;

        const available =
            rooms.filter(function (room) {
                return (
                    getRoomStatus(room) !==
                    "booked"
                );
            }).length;

        const booked =
            rooms.filter(function (room) {
                return (
                    getRoomStatus(room) ===
                    "booked"
                );
            }).length;

        let average = 0;

        if (total > 0) {
            const sum =
                rooms.reduce(
                    function (result, room) {
                        return (
                            result +
                            getRoomPrice(room)
                        );
                    },
                    0
                );

            average =
                Math.round(
                    sum / total
                );
        }

        const totalEl =
            document.getElementById(
                "roomTotal"
            );

        const availableEl =
            document.getElementById(
                "roomAvailable"
            );

        const bookedEl =
            document.getElementById(
                "roomBooked"
            );

        const averageEl =
            document.getElementById(
                "roomAverage"
            );

        if (totalEl) {
            totalEl.textContent =
                total;
        }

        if (availableEl) {
            availableEl.textContent =
                available;
        }

        if (bookedEl) {
            bookedEl.textContent =
                booked;
        }

        if (averageEl) {
            averageEl.textContent =
                money(average);
        }
    }

    /* =========================================================
       RENDER ROOMS
    ========================================================= */

    function renderRooms(list) {
        const container =
            document.getElementById(
                "roomsGrid"
            );

        if (!container) {
            return;
        }

        const source =
            Array.isArray(list)
                ? list
                : rooms;

        if (!source.length) {
            container.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    padding:45px 20px;
                    text-align:center;
                    border-radius:20px;
                    background:linear-gradient(
                        135deg,
                        #f5f3ff,
                        #eff6ff
                    );
                    border:1px solid #e5e7eb;
                ">
                    <div style="
                        font-size:42px;
                        margin-bottom:10px;
                    ">
                        🏨
                    </div>

                    <div style="
                        font-size:20px;
                        font-weight:800;
                        color:#1f2937;
                    ">
                        No Rooms Found
                    </div>

                    <div style="
                        margin-top:6px;
                        color:#6b7280;
                    ">
                        Add a new room to start
                        managing your hotel.
                    </div>
                </div>
            `;

            updateRoomCounters();
            return;
        }

        container.innerHTML =
            source
                .map(function (room) {
                    return createRoomCard(
                        room
                    );
                })
                .join("");

        updateRoomCounters();
    }

    /* =========================================================
       ROOM EVENTS
    ========================================================= */

    function initRoomEvents() {
        const searchInput =
            document.getElementById(
                "roomSearch"
            );

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                function () {
                    searchRooms(
                        searchInput.value
                    );
                }
            );
        }

        const form =
            document.getElementById(
                "roomForm"
            );

        if (form) {
            form.addEventListener(
                "submit",
                function (event) {
                    event.preventDefault();

                    saveRoom();
                }
            );
        }

        const modal =
            getModal();

        if (modal) {
            modal.addEventListener(
                "click",
                closeRoomModalOnOverlay
            );
        }

        const addButton =
            document.getElementById(
                "addRoomBtn"
            );

        if (addButton) {
            addButton.addEventListener(
                "click",
                function () {
                    openRoomModal();
                }
            );
        }

        const cancelButton =
            document.getElementById(
                "cancelRoomBtn"
            );

        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                function () {
                    closeRoomModal();
                }
            );
        }
    }

    /* =========================================================
       PUBLIC FUNCTIONS
    ========================================================= */

    window.openRoomModal =
        openRoomModal;

    window.closeRoomModal =
        closeRoomModal;

    window.saveRoom =
        saveRoom;

    window.editRoom =
        editRoom;

    window.toggleRoomStatus =
        toggleRoomStatus;

    window.deleteRoom =
        deleteRoom;

    window.searchRooms =
        searchRooms;

    window.renderRooms =
        renderRooms;

    window.updateRoomsPage =
        function () {
            loadRooms();
            renderRooms();
            updateRoomCounters();
        };

    window.getRooms =
        function () {
            return rooms.slice();
        };

    window.getRoomById =
        function (roomId) {
            const id =
                String(roomId);

            return (
                rooms.find(
                    function (room) {
                        return (
                            getRoomId(room) ===
                            id
                        );
                    }
                ) || null
            );
        };

    window.reloadRooms =
        function () {
            loadRooms();
            renderRooms();
            updateRoomCounters();
        };

    window.ROYAL_ROOMS =
        window.ROYAL_ROOMS ||
        {};

    window.ROYAL_ROOMS.version =
        VERSION;

    window.ROYAL_ROOMS.getAll =
        function () {
            return rooms.slice();
        };

    /* =========================================================
       START
    ========================================================= */

    function startRooms() {
        loadRooms();
        initRoomEvents();
        renderRooms();
        updateRoomCounters();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            startRooms,
            {
                once: true
            }
        );
    } else {
        startRooms();
    }

})();
