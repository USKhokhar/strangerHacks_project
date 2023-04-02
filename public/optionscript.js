let clearChatBtn = document.getElementById('clear-chat-btn')

clearChatBtn.addEventListener('click', handleClearChatClick);
function handleClearChatClick() {
    const confirmed = window.confirm('This will clear all chats across all your devices. Are you sure?');
    if (confirmed) {
        chrome.storage.sync.clear();
        alert("Chats Cleared")
    }
}