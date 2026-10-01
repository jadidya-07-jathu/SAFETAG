/* =========================================================
   SAFETAG FRONTEND PROTOTYPE
   No backend / No database
   Data stored in browser localStorage
========================================================= */


/* =========================================================
   DATABASE SIMULATION
========================================================= */

const STORAGE = {

    users: "safetag_users",

    hospitals: "safetag_hospitals",

    tags: "safetag_tags",

    logs: "safetag_logs",

    session: "safetag_session"

};


/* =========================================================
   INITIAL DATA
========================================================= */

function initializeData() {

    if (!localStorage.getItem(STORAGE.users)) {

        localStorage.setItem(
            STORAGE.users,
            JSON.stringify([])
        );

    }


    if (!localStorage.getItem(STORAGE.tags)) {

        localStorage.setItem(
            STORAGE.tags,
            JSON.stringify([])
        );

    }


    if (!localStorage.getItem(STORAGE.logs)) {

        localStorage.setItem(
            STORAGE.logs,
            JSON.stringify([])
        );

    }


    if (!localStorage.getItem(STORAGE.hospitals)) {

        const hospitals = [

            {
                id: "HOSP-001",

                name: "City Emergency Hospital",

                email: "hospital@safetag.com",

                password: "hospital123",

                role: "hospital",

                verified: true
            }

        ];


        localStorage.setItem(
            STORAGE.hospitals,
            JSON.stringify(hospitals)
        );

    }

}


initializeData();


/* =========================================================
   STORAGE HELPERS
========================================================= */

function getData(key) {

    return JSON.parse(
        localStorage.getItem(key) || "[]"
    );

}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


/* =========================================================
   SESSION
========================================================= */

let currentLoginRole = "user";


function getSession() {

    return JSON.parse(
        localStorage.getItem(STORAGE.session)
        || "null"
    );

}


function setSession(session) {

    localStorage.setItem(
        STORAGE.session,
        JSON.stringify(session)
    );

}


function clearSession() {

    localStorage.removeItem(
        STORAGE.session
    );

}


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const authPage =
    document.getElementById("authPage");

const userPage =
    document.getElementById("userPage");

const hospitalPage =
    document.getElementById("hospitalPage");

const adminPage =
    document.getElementById("adminPage");


/* =========================================================
   AUTH TABS
========================================================= */

function showAuth(type) {

    const login =
        document.getElementById("loginForm");

    const register =
        document.getElementById("registerForm");

    const tabs =
        document.querySelectorAll(".auth-tab");


    tabs.forEach(
        tab => tab.classList.remove("active")
    );


    if (type === "login") {

        login.classList.remove("hidden");

        register.classList.add("hidden");

        tabs[0].classList.add("active");

    } else {

        login.classList.add("hidden");

        register.classList.remove("hidden");

        tabs[1].classList.add("active");

    }

}


/* =========================================================
   LOGIN ROLE
========================================================= */

function selectLoginRole(
    role,
    button
) {

    currentLoginRole = role;


    document
        .querySelectorAll(".role-btn")
        .forEach(
            btn =>
                btn.classList.remove("active")
        );


    button.classList.add("active");

}


/* =========================================================
   USER REGISTRATION
========================================================= */

function registerUser(event) {

    event.preventDefault();


    const name =
        document
        .getElementById("registerName")
        .value
        .trim();


    const email =
        document
        .getElementById("registerEmail")
        .value
        .trim()
        .toLowerCase();


    const mobile =
        document
        .getElementById("registerMobile")
        .value
        .trim();


    const password =
        document
        .getElementById("registerPassword")
        .value;


    const message =
        document.getElementById(
            "registerMessage"
        );


    if (!/^[0-9]{10}$/.test(mobile)) {

        message.textContent =
            "Enter a valid 10-digit mobile number.";

        return;
    }


    const users =
        getData(STORAGE.users);


    if (
        users.some(
            user =>
                user.email === email
        )
    ) {

        message.textContent =
            "An account with this email already exists.";

        return;
    }


    const user = {

        id:
            "USR-" +
            Date.now(),

        name,

        email,

        mobile,

        password,

        role: "user",

        createdAt:
            new Date().toISOString()
    };


    users.push(user);


    saveData(
        STORAGE.users,
        users
    );


    message.style.color =
        "#86efac";


    message.textContent =
        "Account created successfully. You can now login.";


    event.target.reset();

}


/* =========================================================
   LOGIN
========================================================= */

function login(event) {

    event.preventDefault();


    const email =
        document
        .getElementById("loginEmail")
        .value
        .trim()
        .toLowerCase();


    const password =
        document
        .getElementById("loginPassword")
        .value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    /* ADMIN */

    if (
        currentLoginRole === "admin" &&
        email === "admin@safetag.com" &&
        password === "admin123"
    ) {

        setSession({

            id: "ADMIN-001",

            name: "System Administrator",

            email,

            role: "admin"

        });


        showDashboard();

        return;

    }


    /* HOSPITAL */

    if (
        currentLoginRole === "hospital"
    ) {

        const hospitals =
            getData(
                STORAGE.hospitals
            );


        const hospital =
            hospitals.find(
                h =>
                    h.email === email &&
                    h.password === password
            );


        if (!hospital) {

            message.textContent =
                "Invalid hospital credentials.";

            return;

        }


        setSession({

            id: hospital.id,

            name: hospital.name,

            email: hospital.email,

            role: "hospital"

        });


        showDashboard();

        return;

    }


    /* USER */

    if (
        currentLoginRole === "user"
    ) {

        const users =
            getData(
                STORAGE.users
            );


        const user =
            users.find(
                u =>
                    u.email === email &&
                    u.password === password
            );


        if (!user) {

            message.textContent =
                "Invalid user email or password.";

            return;

        }


        setSession({

            id: user.id,

            name: user.name,

            email: user.email,

            role: "user"

        });


        showDashboard();

    }

}


/* =========================================================
   DASHBOARD ROUTING
========================================================= */

function showDashboard() {

    const session =
        getSession();


    if (!session) {

        showAuthPage();

        return;

    }


    authPage.classList.add("hidden");

    userPage.classList.add("hidden");

    hospitalPage.classList.add("hidden");

    adminPage.classList.add("hidden");


    updateNavbar();


    if (session.role === "user") {

        userPage.classList.remove(
            "hidden"
        );

        loadUserDashboard();

    }


    else if (
        session.role === "hospital"
    ) {

        hospitalPage.classList.remove(
            "hidden"
        );

    }


    else if (
        session.role === "admin"
    ) {

        adminPage.classList.remove(
            "hidden"
        );

        loadAdminDashboard();

    }

}


/* =========================================================
   AUTH PAGE
========================================================= */

function showAuthPage() {

    authPage.classList.remove(
        "hidden"
    );

    userPage.classList.add(
        "hidden"
    );

    hospitalPage.classList.add(
        "hidden"
    );

    adminPage.classList.add(
        "hidden"
    );


    document.getElementById(
        "navActions"
    ).innerHTML = "";

}


/* =========================================================
   NAVBAR
========================================================= */

function updateNavbar() {

    const session =
        getSession();


    if (!session) {

        return;

    }


    document.getElementById(
        "navActions"
    ).innerHTML = `

        <button
            class="logout-btn"
            onclick="logout()">

            Logout

        </button>

    `;

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    clearSession();

    showAuthPage();

    showToast(
        "Logged out successfully."
    );

}


/* =========================================================
   USER DASHBOARD
========================================================= */

function loadUserDashboard() {

    const session =
        getSession();


    const users =
        getData(
            STORAGE.users
        );


    const user =
        users.find(
            u =>
                u.id === session.id
        );


    document.getElementById(
        "userWelcome"
    ).textContent =
        user ? user.name : "";


    const tags =
        getData(
            STORAGE.tags
        )
        .filter(
            tag =>
                tag.userId === session.id
        );


    const logs =
        getData(
            STORAGE.logs
        )
        .filter(
            log =>
                log.userId === session.id
        );


    document.getElementById(
        "userTagCount"
    ).textContent =
        tags.length;


    document.getElementById(
        "userActiveCount"
    ).textContent =
        tags.filter(
            tag =>
                tag.status === "active"
        ).length;


    document.getElementById(
        "userAccessCount"
    ).textContent =
        logs.length;


    renderUserTags(tags);

    renderUserLogs(logs);

}


/* =========================================================
   CREATE SAFETAG
========================================================= */

function createSafeTag(event) {

    event.preventDefault();


    const session =
        getSession();


    if (!session) {

        return;

    }


    const tagName =
        document
        .getElementById("tagName")
        .value
        .trim();


    const emergencyName =
        document
        .getElementById("emergencyName")
        .value
        .trim();


    const emergencyPhone =
        document
        .getElementById("emergencyPhone")
        .value
        .trim();


    const medicalAlert =
        document
        .getElementById("medicalAlert")
        .value
        .trim();


    if (
        !/^[0-9]{10}$/.test(
            emergencyPhone
        )
    ) {

        showToast(
            "Enter a valid emergency phone number."
        );

        return;

    }


    const photoInput =
        document.getElementById(
            "emergencyPhoto"
        );


    const file =
        photoInput.files[0];


    if (file && file.size > 5 * 1024 * 1024) {

        showToast(
            "Photo must be smaller than 5 MB."
        );

        return;

    }


    if (file) {

        const reader =
            new FileReader();


        reader.onload =
            function () {

                saveNewTag(
                    event.target,
                    tagName,
                    emergencyName,
                    emergencyPhone,
                    medicalAlert,
                    reader.result
                );

            };


        reader.readAsDataURL(file);

    } else {

        saveNewTag(
            event.target,
            tagName,
            emergencyName,
            emergencyPhone,
            medicalAlert,
            ""
        );

    }

}


/* =========================================================
   SAVE TAG
========================================================= */

function saveNewTag(
    form,
    tagName,
    emergencyName,
    emergencyPhone,
    medicalAlert,
    photo
) {

    const session =
        getSession();


    const tags =
        getData(
            STORAGE.tags
        );


    const tag = {

        id:
            generateTagId(),

        userId:
            session.id,

        ownerName:
            session.name,

        tagName,

        emergencyName,

        emergencyPhone,

        medicalAlert:
            medicalAlert ||
            "No medical alert provided.",

        photo,

        status: "active",

        createdAt:
            new Date().toISOString()

    };


    tags.push(tag);


    saveData(
        STORAGE.tags,
        tags
    );


    form.reset();


    showToast(
        "SafeTag created successfully."
    );


    loadUserDashboard();


    openQR(tag.id);

}


/* =========================================================
   RANDOM TAG ID
========================================================= */

function generateTagId() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let result =
        "ST-";


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }


    return result;

}


/* =========================================================
   GENERATE QR
========================================================= */

function openQR(tagId) {

    const qrContainer =
        document.createElement(
            "div"
        );


    qrContainer.innerHTML = `

        <div class="qr-modal">

            <div class="qr-box">

                <button
                    onclick="this.closest('.qr-modal').remove()"
                    class="close-qr">

                    ×

                </button>

                <h2>SafeTag QR</h2>

                <p>
                    QR contains only the SafeTag identifier.
                </p>

                <div id="generatedQR"></div>

                <strong>
                    ${tagId}
                </strong>

                <button
                    class="primary-btn"
                    onclick="downloadQR('${tagId}')">

                    Download QR

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        qrContainer
    );


    new QRCode(
        qrContainer.querySelector(
            "#generatedQR"
        ),
        {

            text:
                tagId,

            width:
                230,

            height:
                230,

            colorDark:
                "#000000",

            colorLight:
                "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        }
    );

}


/* =========================================================
   DOWNLOAD QR
========================================================= */

function downloadQR(tagId) {

    const qr =
        document.querySelector(
            "#generatedQR img"
        );


    if (!qr) {

        return;

    }


    const link =
        document.createElement(
            "a"
        );


    link.href =
        qr.src;


    link.download =
        `${tagId}-SafeTag.png`;


    link.click();

}


/* =========================================================
   USER TAGS
========================================================= */

function renderUserTags(tags) {

    const container =
        document.getElementById(
            "userTagsContainer"
        );


    if (!tags.length) {

        container.innerHTML = `

            <div class="empty">

                🏷️ You haven't created
                a SafeTag yet.

            </div>

        `;

        return;

    }


    container.innerHTML =
        tags.map(
            tag => `

            <div class="tag-card">

                <div>

                    <h3>
                        ${escapeHTML(
                            tag.tagName
                        )}
                    </h3>

                    <div class="tag-id">
                        ${tag.id}
                    </div>

                    <span class="status ${
                        tag.status
                    }">

                        ${tag.status.toUpperCase()}

                    </span>

                </div>


                <div class="tag-actions">

                    <button
                        class="small-btn"
                        onclick="openQR('${tag.id}')">

                        QR

                    </button>


                    ${
                        tag.status === "active"

                        ?

                        `<button
                            class="small-btn red"
                            onclick="revokeTag('${tag.id}')">

                            Revoke

                        </button>`

                        :

                        ""

                    }

                </div>

            </div>

        `
        ).join("");

}


/* =========================================================
   REVOKE TAG
========================================================= */

function revokeTag(tagId) {

    if (
        !confirm(
            "Revoke this SafeTag?"
        )
    ) {

        return;

    }


    const tags =
        getData(
            STORAGE.tags
        );


    const tag =
        tags.find(
            t =>
                t.id === tagId
        );


    if (tag) {

        tag.status =
            "revoked";


        tag.revokedAt =
            new Date().toISOString();

    }


    saveData(
        STORAGE.tags,
        tags
    );


    showToast(
        "SafeTag revoked."
    );


    loadUserDashboard();

}


/* =========================================================
   USER LOGS
========================================================= */

function renderUserLogs(logs) {

    const container =
        document.getElementById(
            "userLogsContainer"
        );


    if (!logs.length) {

        container.innerHTML = `

            <div class="empty">

                No emergency accesses recorded.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>

                    <th>Time</th>

                    <th>Responder</th>

                    <th>Reason</th>

                    <th>Tag</th>

                </tr>

            </thead>

            <tbody>

                ${

                    logs
                    .sort(
                        (a,b) =>
                            new Date(b.time) -
                            new Date(a.time)
                    )
                    .map(
                        log => `

                        <tr>

                            <td>
                                ${formatDate(
                                    log.time
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.responderName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.reason
                                )}
                            </td>

                            <td>
                                ${log.tagId}
                            </td>

                        </tr>

                    `
                    )
                    .join("")

                }

            </tbody>

        </table>

        </div>

    `;

}


/* =========================================================
   HOSPITAL LOOKUP
========================================================= */

function lookupTag(event) {

    event.preventDefault();


    const tagId =
        document
        .getElementById("lookupId")
        .value
        .trim()
        .toUpperCase();


    const reason =
        document
        .getElementById("accessReason")
        .value;


    const message =
        document.getElementById(
            "hospitalMessage"
        );


    const tags =
        getData(
            STORAGE.tags
        );


    const tag =
        tags.find(
            t =>
                t.id === tagId
        );


    if (!tag) {

        message.textContent =
            "SafeTag not found.";

        return;

    }


    if (
        tag.status !== "active"
    ) {

        message.textContent =
            "This SafeTag has been revoked.";

        return;

    }


    const session =
        getSession();


    /* CREATE ACCESS LOG */

    const logs =
        getData(
            STORAGE.logs
        );


    logs.push({

        id:
            "LOG-" +
            Date.now(),

        tagId:
            tag.id,

        userId:
            tag.userId,

        responderId:
            session.id,

        responderName:
            session.name,

        reason,

        time:
            new Date().toISOString()

    });


    saveData(
        STORAGE.logs,
        logs
    );


    message.style.color =
        "#86efac";


    message.textContent =
        "Emergency access recorded.";


    showEmergencyResult(
        tag
    );

}


/* =========================================================
   SHOW EMERGENCY PROFILE
========================================================= */

function showEmergencyResult(tag) {

    const result =
        document.getElementById(
            "emergencyResult"
        );


    result.classList.remove(
        "hidden"
    );


    document.getElementById(
        "emergencyPersonName"
    ).textContent =
        tag.ownerName;


    document.getElementById(
        "emergencyTagName"
    ).textContent =
        tag.tagName;


    document.getElementById(
        "emergencyContact"
    ).textContent =
        tag.emergencyName +
        " • " +
        tag.emergencyPhone;


    document.getElementById(
        "emergencyMedical"
    ).textContent =
        tag.medicalAlert;


    document.getElementById(
        "emergencyTagId"
    ).textContent =
        tag.id;


    const photoContainer =
        document.getElementById(
            "emergencyPhotoContainer"
        );


    if (tag.photo) {

        photoContainer.innerHTML = `

            <img
                src="${tag.photo}"
                class="emergency-photo"
                alt="Emergency profile">

        `;

    } else {

        photoContainer.innerHTML = `

            <div class="emergency-photo"
                 style="
                    display:grid;
                    place-items:center;
                    background:#172033;
                    font-size:30px;
                 ">

                👤

            </div>

        `;

    }


    document.getElementById(
        "callEmergency"
    ).href =
        "tel:" +
        tag.emergencyPhone;


    result.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function loadAdminDashboard() {

    const users =
        getData(
            STORAGE.users
        );


    const hospitals =
        getData(
            STORAGE.hospitals
        );


    const tags =
        getData(
            STORAGE.tags
        );


    const logs =
        getData(
            STORAGE.logs
        );


    document.getElementById(
        "adminUsers"
    ).textContent =
        users.length;


    document.getElementById(
        "adminHospitals"
    ).textContent =
        hospitals.length;


    document.getElementById(
        "adminTags"
    ).textContent =
        tags.length;


    document.getElementById(
        "adminAccess"
    ).textContent =
        logs.length;


    renderAdminUsers(users);

    renderAdminHospitals(
        hospitals
    );

    renderAdminTags(tags);

    renderAdminLogs(logs);

}


/* =========================================================
   ADMIN USERS
========================================================= */

function renderAdminUsers(users) {

    const container =
        document.getElementById(
            "adminUsersTable"
        );


    if (!users.length) {

        container.innerHTML =
            `<div class="empty">
                No users registered.
            </div>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Email</th>

                    <th>Mobile</th>

                    <th>Created</th>

                </tr>

            </thead>

            <tbody>

                ${

                    users.map(
                        user => `

                        <tr>

                            <td>
                                ${user.id}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        user.name
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    user.email
                                )}
                            </td>

                            <td>
                                ${user.mobile}
                            </td>

                            <td>
                                ${formatDate(
                                    user.createdAt
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")

                }

            </tbody>

        </table>

        </div>

    `;

}


/* =========================================================
   ADMIN HOSPITALS
========================================================= */

function renderAdminHospitals(
    hospitals
) {

    const container =
        document.getElementById(
            "adminHospitalsTable"
        );


    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Hospital</th>

                    <th>Email</th>

                    <th>Status</th>

                </tr>

            </thead>

            <tbody>

                ${

                    hospitals.map(
                        hospital => `

                        <tr>

                            <td>
                                ${hospital.id}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        hospital.name
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    hospital.email
                                )}
                            </td>

                            <td>

                                <span class="status active">

                                    VERIFIED

                                </span>

                            </td>

                        </tr>

                    `
                    ).join("")

                }

            </tbody>

        </table>

        </div>

    `;

}


/* =========================================================
   ADMIN TAGS
========================================================= */

function renderAdminTags(tags) {

    const container =
        document.getElementById(
            "adminTagsTable"
        );


    if (!tags.length) {

        container.innerHTML =
            `<div class="empty">
                No SafeTags created.
            </div>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>

                    <th>Tag ID</th>

                    <th>Owner</th>

                    <th>Tag Name</th>

                    <th>Status</th>

                    <th>Created</th>

                </tr>

            </thead>

            <tbody>

                ${

                    tags.map(
                        tag => `

                        <tr>

                            <td>
                                <strong>
                                    ${tag.id}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    tag.ownerName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    tag.tagName
                                )}
                            </td>

                            <td>

                                <span class="status ${
                                    tag.status
                                }">

                                    ${tag.status.toUpperCase()}

                                </span>

                            </td>

                            <td>
                                ${formatDate(
                                    tag.createdAt
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")

                }

            </tbody>

        </table>

        </div>

    `;

}


/* =========================================================
   ADMIN LOGS
========================================================= */

function renderAdminLogs(logs) {

    const container =
        document.getElementById(
            "adminLogsTable"
        );


    if (!logs.length) {

        container.innerHTML =
            `<div class="empty">
                No emergency access activity.
            </div>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>

                    <th>Time</th>

                    <th>SafeTag</th>

                    <th>Responder</th>

                    <th>Reason</th>

                    <th>Responder ID</th>

                </tr>

            </thead>

            <tbody>

                ${

                    logs
                    .sort(
                        (a,b) =>
                            new Date(b.time) -
                            new Date(a.time)
                    )
                    .map(
                        log => `

                        <tr>

                            <td>
                                ${formatDate(
                                    log.time
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${log.tagId}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.responderName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.reason
                                )}
                            </td>

                            <td>
                                ${log.responderId}
                            </td>

                        </tr>

                    `
                    )
                    .join("")

                }

            </tbody>

        </table>

        </div>

    `;

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "en-IN",
            {

                dateStyle:
                    "medium",

                timeStyle:
                    "short"

            }
        );

}


/* =========================================================
   BASIC XSS PROTECTION FOR DISPLAY
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   QR MODAL CSS INJECTOR
========================================================= */

const qrStyle =
document.createElement("style");


qrStyle.textContent = `

.qr-modal {

    position: fixed;

    inset: 0;

    z-index: 9999;

    display: grid;

    place-items: center;

    padding: 20px;

    background:
        rgba(0,0,0,.75);

    backdrop-filter:
        blur(8px);

}

.qr-box {

    position: relative;

    width: 100%;

    max-width: 390px;

    padding: 30px;

    text-align: center;

    border-radius: 25px;

    background: #101b2d;

    border:
        1px solid
        rgba(255,255,255,.12);

    box-shadow:
        0 30px 100px
        rgba(0,0,0,.6);

}

.qr-box h2 {

    margin-bottom: 5px;

}

.qr-box p {

    color: #94a3b8;

    font-size: 12px;

    margin-bottom: 20px;

}

#generatedQR {

    width: 250px;

    min-height: 250px;

    margin: 0 auto 18px;

    padding: 10px;

    border-radius: 15px;

    background: white;

}

#generatedQR img {

    display: block;

    width: 230px;

    height: 230px;

}

.qr-box strong {

    display: block;

    margin-bottom: 5px;

    color: #38bdf8;

    font-family: monospace;

}

.close-qr {

    position: absolute;

    top: 12px;

    right: 15px;

    width: 35px;

    height: 35px;

    border: none;

    border-radius: 50%;

    background: rgba(255,255,255,.08);

    color: white;

    font-size: 22px;

}

`;


document.head.appendChild(
    qrStyle
);


/* =========================================================
   START APPLICATION
========================================================= */

if (getSession()) {

    showDashboard();

} else {

    showAuthPage();

}