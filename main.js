// regular expression for validation
const phoneRegex = /^[0-9\-+]{3,15}$/;
// -------------------------------------------------- //
const groupSelector = document.getElementById('group-selector');
const fullscreenDiv = document.getElementById('fullscreen-div');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.getElementById('close-btn');
const modalBtns = document.getElementById('modal-btns');
const form = document.getElementById('modal');
const statusMessage = document.getElementById('status-message');

const addGroupBtn = document.getElementById('add-group-btn');
const saveGroupBtn = document.getElementById('save-groups-btn');

const contactBookList = document.getElementById('contacts-container');
const groupsContainer = document.getElementById('groups-container');

let contacts = []
let groups = ["Друзья", "Коллеги"]
let name = phone = group = "";


const DefaultMessage = '<div class="default-message">Список контактов пуст</div>'

/* Accordion content */
const ContactRecords =(contacts)=> {
  let html = "";
  
  contacts.forEach((contact) => {
    html += `<li class="record" data-id=${contact.id}>
      <span class="record__name">${contact.name}</span>
      <span class="record__number">${contact.phone}</span>
      <button type="button" id="edit-contact-btn" class="btn btn-primary action-button action-button_edit"></button>
      <button type="button" id="delete-contact-btn" class="btn btn-danger action-button action-button_remove"></button>
    </li>`
  })
  
  return html;
}

// Contact class
class Contact{
  constructor(id, name, phone, group){
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.group = group;
  }
  
  static getContacts(){
    if(localStorage.getItem('contacts') !== null){
      contacts = JSON.parse(localStorage.getItem('contacts'));
    }
    return contacts;
  }
  
  static addContact(contact){
    const contacts = Contact.getContacts();
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }
  
  static deleteContact(id){
    const contacts = Contact.getContacts();
    contacts.forEach((contact, index) => {
      if(contact.id === +id){
        contacts.splice(index, 1);
      }
    });
    
    localStorage.setItem('contacts', JSON.stringify(contacts));
    form.reset();
    UI.closeModal();
    contactBookList.innerHTML = "";
    UI.showContactList();
  }
  
  static updateContact(item){
    const contacts = Contact.getContacts();
    contacts.forEach(contact => {
      if(contact.id === +item.id){
        contact.name = item.name;
        contact.phone = item.phone;
        contact.group = item.group;
      }
    });
    localStorage.setItem('contacts', JSON.stringify(contacts));
    contactBookList.innerHTML = "";
    UI.showContactList();
  }
}

// Contact class
class Group{
  constructor(name){
    this.name = name;
  }
  
  static getGroups(){
    if(localStorage.getItem('groups') !== null){
      groups = JSON.parse(localStorage.getItem('groups'));
    }
    return groups;
  }
  
  static saveGroups(){
    let inputParent;
    let updatedValues=[];
    const inputElements = groupsContainer.querySelectorAll("input")
    // Get correct groups data
    for(let item of inputElements){
      if(item.value === ''){
        inputParent = item.parentElement
        groupsContainer.removeChild(inputParent);
      } else {
        updatedValues.push(item.value)
      }
    }
    
    localStorage.setItem('groups', JSON.stringify(updatedValues));
  }
  
  static deleteGroup(groupName){
    const groups = Group.getGroups();
    groups.forEach((group, index) => {
      if(group === groupName){
        groups.splice(index, 1);
      }
    });
    
    localStorage.setItem('groups', JSON.stringify(groups));
  }
}

// UI class
class UI{
  static showContactList(){
    const contacts = Contact.getContacts();
    if (contacts.length) {
      contactBookList.innerHTML = '';
      UI.addToContactListDOM(contacts);
    }else {
      contactBookList.innerHTML = DefaultMessage;
    }
  }
  
  static showGroupList(){
    const groups = Group.getGroups();
    groups.forEach(group => UI.addGroupInputDOM(group));
    UI.showGroupSelector()
  }
  
  static addToContactListDOM(contacts){
    const groupedContacts = groupContacts(contacts)
    let html = "";

    groupedContacts.forEach((list, index) => {
      let contactsRecords = ContactRecords(list.contacts)
      
      html += `<div class="accordion-item">
          <h2 class="accordion-header" id="heading_${index}">
            <button class="accordion-button" type="button"  data-bs-toggle="collapse" data-bs-target="#collapse_${index}" aria-expanded="true" aria-controls="collapse_${index}">
              ${list.group}
            </button>
          </h2>
          <div id="collapse_${index}" class="accordion-collapse collapse show" aria-labelledby="collapse_${index}">
            <ul class="accordion-body">
              ${contactsRecords}
            </ul>
          </div>
        </div>`;
    });
    
    contactBookList.innerHTML = html;
  }
  
  static addGroupInputDOM(group=''){
    const newGroupInput = document.createElement('li');
    newGroupInput.classList.add('group');
    newGroupInput.innerHTML = `
      <input type="text" class="form-control form-item" placeholder="Введите название" value=${group}>
      <button id="delete-group-btn" type="button" class="btn btn-danger action-button action-button_remove"></button>
    `;
    
    groupsContainer.appendChild(newGroupInput);
  }
  
  static showGroupSelector(){
    const groups = Group.getGroups()
    let html = '';
    
    groups.forEach(group => {
      html += `<option value=${group}>${group}</option>`;
    });
    
    groupSelector.innerHTML = html;
  }
  
  static showModalData(id){
    const contacts = Contact.getContacts();
    contacts.forEach(contact => {
      if(contact.id === +id){
        form.name.value = contact.name;
        form.phone.value = contact.phone;
        form.groupName.value = contact.group;
        document.getElementById('modal-title').innerHTML = "Изменение контакта";
        document.getElementById('modal-btns').innerHTML = `
          <button
            type = "submit"
            id = "update-btn"
            data-id = "${id}"
            class="btn btn-primary"
          >
            Обновить
          </button>
        `;
      }
    });
  }
  
  static showModal(){
    modal.style.display = "block";
    fullscreenDiv.style.display = "block";
  }
  
  static closeModal(){
    modal.style.display = "none";
    fullscreenDiv.style.display = "none";
  }
  
}

// DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
  eventListeners();
  UI.showContactList();
  UI.showGroupList();
});

// event listeners
function eventListeners(){
  // show add item modal
  addBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('modal-title').innerHTML = "Добавление контакта";
    UI.showModal();
    document.getElementById('modal-btns').innerHTML = `
      <button type = "submit" id = "save-btn" class="btn btn-primary"> Сохранить </button>
    `;
  });
  
  // close add item modal
  closeBtn.addEventListener('click', UI.closeModal);
  
  // add an contact item
  modalBtns.addEventListener('click', (event) => {
    event.preventDefault();
    if(event.target.id === "save-btn"){
      let isFormValid = getFormData();
      if(!isFormValid){
        form.querySelectorAll('input').forEach(input => {
          setTimeout(() => {
            input.classList.remove('errorMsg');
          }, 1500);
        });
      } else {
        let allItem = Contact.getContacts();
        let lastItemId = (allItem.length > 0) ? allItem[allItem.length - 1].id : 0;
        lastItemId++;
        
        const contact = new Contact(lastItemId, name, phone, group);
        Contact.addContact(contact);
        UI.closeModal();
        UI.showContactList();
        form.reset();
      }
    }
  });
  
  contactBookList.addEventListener('click', (event) => {
    let listItem, viewID;
    if (event.target.tagName === 'BUTTON') {
      listItem =  event.target.parentElement;
      viewID = listItem.dataset.id;
    }
    
    if(event.target.id === "edit-contact-btn"){
      UI.showModal();
      UI.showModalData(viewID);
    }
    
    if(event.target.id === "delete-contact-btn"){
      Contact.deleteContact(viewID);
    }
  });
  
  // delete an contact item
  modalBtns.addEventListener('click', (event) => {
    if(event.target.id === 'delete-btn'){
      Contact.deleteContact(event.target.dataset.id);
    }
  });
  
  // update an contact item
  modalBtns.addEventListener('click', (event) => {
    event.preventDefault();
    if(event.target.id === "update-btn"){
      let id = event.target.dataset.id;
      let isFormValid = getFormData();
      if(isFormValid){
        const contact = new Contact(id, name, phone, group);
        Contact.updateContact(contact);
        UI.closeModal();
        form.reset();
      }
    }
  });
  
  addGroupBtn.addEventListener('click', function(){
    UI.addGroupInputDOM();
  });
  
  groupsContainer.addEventListener('click', function(event){
    let groupToDelete, groupName;
    
    if(event.target.id === 'delete-group-btn'){
      groupToDelete = event.target.parentElement;
      groupName = groupToDelete.querySelector('input').value;
      groupsContainer.removeChild(groupToDelete);
      Group.deleteGroup(groupName);
      UI.showGroupSelector();
    }
  });
  
  saveGroupBtn.addEventListener('click', function(){
    Group.saveGroups();
    UI.showGroupSelector();
  });
}

// get form data

function getFormData(){
  let inputValidStatus = [];
  
  if(form.name.value === ''){
    addErrorStyle(form.name);
    inputValidStatus[0] = false;
  } else {
    name = form.name.value;
    removeErrorStyle(form.name);
    inputValidStatus[0] = true;
  }
  
  if(!phoneRegex.test(form.phone.value)){
    addErrorStyle(form.phone);
    inputValidStatus[1] = false;
  } else {
    phone = form.phone.value;
    removeErrorStyle(form.phone);
    inputValidStatus[1] = true;
  }
  group = form.groupName.value;
  
  if (inputValidStatus.includes(false)){
    setMessage('error', 'Проверьте вводимые данные');
  } else {
    removeMessage();
  }
  
  return !inputValidStatus.includes(false);
}

function addErrorStyle(inputBox){
  inputBox.classList.add('error');
}

function removeErrorStyle(inputBox){
  inputBox.classList.remove('error');
}

// Displaying message

function setMessage(status, message){
  if(status === "error"){
    statusMessage.innerHTML = `<p>${message}</p>`;
    statusMessage.classList.add('error');
  }
  if(status === "success"){
    statusMessage.innerHTML = `${message}`;
    statusMessage.classList.add('success');
  }
}

// Displaying message

function removeMessage(){
  statusMessage.innerHTML = ``;
}

/*  Utils  */

// -------------------------------------------------- //
/* allows to transform data to
[{group: 'friends', contacts: [{name...}]}, ...]*/

class GroupedContacts{
  constructor(group, contacts){
    this.group = group;
    this.contacts = contacts;
  }
}

const groupContacts =(arr)=>{
  const map = new Map();
  
  for (let contact of arr) {
    if (map.has(contact.group)) {
      map.get(contact.group).push(contact);
    }
    if (!map.has(contact.group)) {
      let contacts = [];
      contacts.push(contact);
      map.set(contact.group, contacts);
    }
  }
  
  return convertToResult(map);
}


const convertToResult=(map)=>{
  let resultArr = [];
  const keys = map.keys();
  
  for (let key of keys){
    resultArr.push(new GroupedContacts(key, map.get(key)));
  }
  
  return resultArr;
}
// -------------------------------------------------- //
