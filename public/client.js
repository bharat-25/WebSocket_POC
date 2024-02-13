const socket = io();
let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
const typingTimeoutDelay = 2000;

let senderMobileNo, receiverMobileNo;
let typing = false;
let typingTimeout;

// Function to send message
function sendMessage(message) {
  senderName = senderMobileNo;
  let msg = {
    senderMobileNo,
    receiverMobileNo,
    senderName,
    message: message.trim(),
  };

  // Append
  appendMessage(msg, "outgoing");
  textarea.value = "";
  scrollToBottom();

  // Send to server
  socket.emit("private-chat", msg);
}

// Function to append message
function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  let className = type;
  mainDiv.classList.add(className, "private-chat");

  let markup = `
        <h4>${msg.senderName}</h4>
        <p>${msg.message}</p>
    `;
  mainDiv.innerHTML = markup;
  messageArea.appendChild(mainDiv);
}

// Function to scroll to bottom
function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}

// Listen for receiving messages
socket.on("private-chat", (msg) => {
  appendMessage(msg, "incoming");
  scrollToBottom();
});


// Function to handle typing event
function handleTypingEvent() {
  if (!typing) {
    typing = true;
    socket.emit("typing", { senderMobileNo, receiverMobileNo });
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typing = false;
    socket.emit("stopTyping", { senderMobileNo, receiverMobileNo });
  }, typingTimeoutDelay);
}

// Listen for typing event
textarea.addEventListener("input", handleTypingEvent);

// Listen for typing event
socket.on("typing", (data) => {
  if (data.senderMobileNo === receiverMobileNo) {
    // Update UI to show typing indicator
    console.log("User is typing...");
    document.querySelector(".typing-indicator").classList.add("typing");
  }
});

// Listen for stopTyping event
socket.on("stopTyping", (data) => {
  if (data.senderMobileNo === receiverMobileNo) {
    // Update UI to hide typing indicator
    console.log("User stopped typing.");
    document.querySelector(".typing-indicator").classList.remove("typing");
  }
});

// Listen for keyup event to send message
textarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    sendMessage(e.target.value);
  }
});

// Prompt user for mobile numbers
do {
  senderMobileNo = prompt("Please enter your mobile number: ");
  receiverMobileNo = prompt("Please enter the receiver mobile number: ");
} while (!senderMobileNo || !receiverMobileNo);

// Emit new user connection event
socket.emit("new-user-connect", { senderMobileNo, receiverMobileNo });













// const socket = io();

// let senderMobileNo, receiverMobileNo;
// let textarea = document.querySelector('#textarea');
// let messageArea = document.querySelector('.message__area');

// do {
//     senderMobileNo = prompt('Please enter your mobile number: ');
//     receiverMobileNo = prompt('Please enter the receiver mobile number: ');
//     console.log(senderMobileNo,receiverMobileNo)
//     socket.emit('new-user-connect',{senderMobileNo,receiverMobileNo});
// } while (!senderMobileNo);

// textarea.addEventListener('keyup', (e) => {
//     if (e.key === 'Enter') {
//         sendMessage(e.target.value);
//     }
// });

// function sendMessage(message) {
//     let msg = {
//         senderMobileNo,
//         receiverMobileNo,
//         message: message.trim()
//     };

//     console.log(msg)
//     // Append
//     appendMessage(msg, 'outgoing');
//     textarea.value = '';
//     scrollToBottom();

//     // Send to server
//     socket.emit('private-chat', msg);
// }

// function appendMessage(msg, type) {
//     let mainDiv = document.createElement('div');
//     let className = type;
//     mainDiv.classList.add(className, 'private-chat');

//     let markup = `
//         <h4>${msg.senderMobileNo}</h4>
//         <p>${msg.message}</p>
//     `;
//     mainDiv.innerHTML = markup;
//     messageArea.appendChild(mainDiv);
// }

// // Receive messages
// socket.on('private-chat', (msg) => {
//     console.log()
//     appendMessage(msg, 'incoming');
//     scrollToBottom();
// });

// function scrollToBottom() {
//     messageArea.scrollTop = messageArea.scrollHeight;
// }
