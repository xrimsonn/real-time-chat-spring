let loginPage = document.querySelector('#login');
let chatPage = document.querySelector('#chat');
let usernameForm = document.querySelector('#username-form');
let messageForm = document.querySelector('#message-form');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#area');
let loading = document.querySelector('#loading');

let stompClient = null;
let username = null;
let colors = [
  '#2196F3',
  '#32c787',
  '#00BCD4',
  '#ff5652',
  '#ffc107',
  '#ff85af',
  '#FF9800',
  '#39bbb0',
];

function connect(e) {
  username = document.querySelector('#username').value.trim();

  if (username) {
    loginPage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    let socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
  }

  e.preventDefault();
}

function onConnected() {
  stompClient.subscribe('/topic/public', onMessageReceived);
  stompClient.send(
    '/app/chat.addUser',
    {},
    JSON.stringify({ sender: username, type: 'JOIN' })
  );
  loading.classList.add('hidden');
}

function onError() {
  loading.classList.add('hidden');
  messageArea.innerHTML =
    'Could not connect to WebSocket server. Please refresh this page to try again!';
  messageArea.style.color = 'red';
}

function onMessageReceived(payload) {
  let message = JSON.parse(payload.body);
  let sender = null;
  let messageElement = document.createElement('li');

  if (message.type === 'JOIN') {
    messageElement.classList.add('event');
    message.content = message.sender + ' joined!';
  } else if (message.type === 'LEAVE') {
    messageElement.classList.add('event');
    message.content = message.sender + ' left!';
  } else {
    messageElement.classList.add('msg');
    sender = document.createElement('b');
    sender.innerHTML = message.sender + ': ';
  }

  let textElement = document.createElement('p');
  let messageText = document.createTextNode(message.content);

  if (sender !== null) {
    textElement.appendChild(sender);
    textElement.appendChild(messageText);
  } else {

    textElement.innerHTML = '<em>' + messageText.textContent + '</em>';
  }

  messageElement.appendChild(textElement);
  messageArea.appendChild(messageElement);
  messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage(e) {
  e.preventDefault();

  let messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    let chatMessage = {
      sender: username,
      content: messageInput.value,
      type: 'CHAT',
    };

    stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    messageInput.value = '';
  }
}

function getAvatarColor() {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = 31 * hash + username.charCodeAt(i);
  }
  let index = Math.abs(hash % colors.length);
  return colors[index];
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
