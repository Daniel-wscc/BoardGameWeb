function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function broadcast(wss, data) {
    var json = JSON.stringify(data);
    wss.clients.forEach(function(client) {
        client.send(json);
    });
}

module.exports = { broadcast, escapeHtml };
