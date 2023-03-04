/**
 * Initiates contact page
 */
async function initContacts() {
    await init();
    renderContacts();
}


/**
 * Renders the contacts list
 */
function renderContacts() {
    let container = document.getElementById('contacts-menu-scrollable');
    container.innerHTML = '';
    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < users.length; j++) {
            if (alphabet[i] == getFirstLetterOfLastName(j)) {
                renderLetterSectionTitle(container, alphabet[i]);
                renderContactsOfLetter(container, alphabet[i], j);
                break;
            }
        }
    }
}

/**
 * Renders the letter section title in the contact list
 * @param {Object} container The HTML element for the contact list
 * @param {String} letter The current letter
 */
function renderLetterSectionTitle(container, letter) {
    container.innerHTML += `<div class="alphabet-letter">${letter}</div>`;
    container.innerHTML += `<div class="contacts-underline"></div>`;
}


/**
 * Renders all contacts with the current letter in their surname
 * @param {Object} container The HTML element for the contact list
 * @param {String} letter The current letter
 */
function renderContactsOfLetter(container, letter, start) {
    for (let u = start; u < users.length; u++) {
        if (letter == getFirstLetterOfLastName(u)) {
            renderContactDiv(container, u);
        }
    }
}


/**
 * Renders the contact in the list
 * @param {number} index Index of the user
 */
function renderContactDiv(container, index) {
    container.innerHTML += contactDivHTML(index);

    insertUserInformationById(index);
}


/**
 * Inserts all user information in the contact card
 * @param {number} index Index of the user
 */
function insertUserInformationById(index) {
    document.getElementById(`username-initials${index}`).innerHTML = users[index]['short_name'];
    document.getElementById(`username-initials${index}`).style.backgroundColor = users[index]['color'];
    document.getElementById(`users-name${index}`).innerHTML = escapeHtml(users[index]['name']);
    document.getElementById(`users-email${index}`).innerHTML = users[index]['email'];
}


/**
 * Renders the contact details
 * @param {number} index Index of the user
 */
function renderContactInformation(index) {
    let contactDIV = clearContactCard();
    contactDIV.innerHTML = contactCardHTML(index);

    renderContactInformationById(index);
    backgroundColorOfSelected(index);

    if (window.innerWidth < MOBILE_MAX_WIDTH) {
        toggleShowContactOnMobile();
    } else {
        contactSlideInAnimation();
    }
}


/**
 * Handles the view of the contacts page for mobile view
 */
function toggleShowContactOnMobile() {
    let contactsContainer = document.getElementById('contacts-container');
    let contentContainer = document.getElementById('content-container');
    if (!contactsContainer.style.display) {
        contactsContainer.style.display = 'block';
        document.body.style.backgroundColor = 'var(--bg-body)';
        toggleClassList('edit-contact', 'd-none'); /// TEST
        toggleClassList('delete-contact', 'd-none'); /// TEST
    } else {
        contactsContainer.style.removeProperty('display');
        contentContainer.style.removeProperty('margin-top');
        document.body.style.backgroundColor = 'white';
        resetBackgroundColorSelected();
    }
    toggleClassList('contacts-menu', 'd-none');
    toggleClassList('new-contact-btn', 'd-none');
    // toggleClassList('edit-contact', 'd-none');
    // toggleClassList('delete-contact', 'd-none');
}


/**
 * Writes the detailed contact information
 * @param {number} index Index of the user
 */
function renderContactInformationById(index) {
    document.getElementById(`u-initials${index}`).innerHTML = users[index]['short_name'];
    document.getElementById(`u-initials${index}`).style.backgroundColor = users[index]['color'];
    document.getElementById(`u-name${index}`).innerHTML = escapeHtml(users[index]['name']);
    document.getElementById(`u-email${index}`).innerHTML = users[index]['email'];
    document.getElementById(`u-email${index}`).href = 'mailto:' + users[index]['email'];
    if (users[index]['phone']) {
        document.getElementById(`u-phone-number${index}`).innerHTML = users[index]['phone'];
    }
    document.getElementById('edit-contact').setAttribute('onclick', `openContactEditor(${index})`);
    document.getElementById('confirm-delete-contact').setAttribute('onclick', `deleteContact(${index})`);
    document.getElementById('contact-edit-btn').setAttribute('onclick', `openContactEditor(${index})`);
}



/**
 * Highlights the selected user
 * @param {number} index Index of the user
 */
function backgroundColorOfSelected(index) {
    let contacts = document.querySelectorAll('.contact-div');
    for (let i = 0; i < contacts.length; i++) {
        contacts[i].classList.remove('activeContact');
        contacts[i].classList.remove('nohover');
    }
    toggleClassList(`contact-container${index}`, 'activeContact');
    toggleClassList(`contact-container${index}`, 'nohover');
}


/**
 * Resets the background color of the selected contact for mobile view
 */
function resetBackgroundColorSelected() {
    let contacts = document.querySelectorAll('.contact-div');
    for (let i = 0; i < contacts.length; i++) {
        contacts[i].classList.remove('activeContact');
        contacts[i].classList.remove('nohover');
    }
}


/**
 * Opens the add task modal with the current contact selected as assignee
 * @param {number} index Index of the selected contact
 */
async function openAddTaskContact(index) {
    currentAssignees = [];
    await openAddTask();
    renderAssignees();
    selectAssignee(index);
}


/**
 * Animation for the contact information in the contact card
 */
function contactSlideInAnimation() {
    let contactCard = document.getElementById('contact-div');

    contactCard.classList.add('animationContact');
    setTimeout(function () {
        contactCard.classList.remove('animationContact')
    }, 225);
}


/**
 * Deletes the selected user
 * @param {Number} id The ID of the user
 */
function deleteContact(id) {
    cancelDelete('request-delete-contact-popup');

    if (isUserLoggedIn(id)) {
        setTimeout(showPopup, 100, 'contact-del-cancel-login');
    } 
    else if (hasUserTasksAssigned(id)) {
        setTimeout(showPopup, 100, 'contact-del-cancel-taskassign');
    }
    else {
        execContactDelete(id);
    }
}


/**
 * Checks if selected user is logged-in
 * @param {Number} id The ID of the selected user
 * @returns Boolean
 */
function isUserLoggedIn(id) {
    return users[id]['email'] == currentUser['email'];
}


/**
 * Checks if the selected user has tasks assigned
 * @param {Number} id The ID of the selected user
 * @returns Boolean
 */
function hasUserTasksAssigned(id) {
    for (let s = 0; s < tasks.length; s++) {
        for (let t = 0; t < tasks[s].length; t++) {
            if (tasks[s][t]['assignees'].indexOf(users[id]['email']) >= 0)
                return true;
        }
    }
    return false;
}


/**
 * Executes the deletion of the selected user
 * @param {Number} id The ID of the selected user
 */
function execContactDelete(id) {
    users.splice(id, 1);
    saveOnServer('users', users);
    renderContacts();
    clearContactCard();
    showPopup('contact-del-confirm');
}


/**
 * Clears the contact details display
 * @returns HTML
 */
function clearContactCard() {
    let contactDIV = document.getElementById('contact-div');
    contactDIV.innerHTML = '';
    return contactDIV;
}