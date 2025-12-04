// frontend/js/main.js
// Handles form submission from index.html (keeps same IDs & endpoint)
(function () {
  const API_BASE = 'https://tomoca.onrender.com'; // Render backend
  const form = document.getElementById('supportForm');
  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  const responseMessage = document.getElementById('responseMessage');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value?.trim();
    const department = document.getElementById('department').value;
    const urgency = document.getElementById('urgency').value;
    const issue = document.getElementById('issue').value?.trim();

    if (!name || !department || !urgency || !issue) {
      window._utils.showMessage(responseMessage, 'error', '❌ Please fill in all required fields.');
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    window._utils.setLoading(loading, true);
    responseMessage.style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/submit-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, department, urgency, issue })
      });
      const data = await res.json();

      if (data && data.success) {
        // show ticket id and copy button + link to success page
        window._utils.showMessage(responseMessage, 'success', `
          ✅ <strong>Ticket Submitted Successfully!</strong><br>
          Your Ticket ID: <code id="ticketId">${data.ticketId}</code><br>
          <div style="margin-top:8px;">
            <button id="copyTicketBtn" style="padding:8px 12px;border-radius:8px;border:none;cursor:pointer;background:#a76e45;color:#fff;">Copy Ticket ID</button>
            <a href="success.html?ticket=${encodeURIComponent(data.ticketId)}" style="margin-left:10px;color:#555;font-weight:600;text-decoration:none;">Open confirmation</a>
          </div>
        `);
        form.reset();

        // attach copy
        document.getElementById('copyTicketBtn')?.addEventListener('click', () => {
          window._utils.copyToClipboard(data.ticketId).then(() => {
            document.getElementById('copyTicketBtn').textContent = 'Copied!';
            setTimeout(() => document.getElementById('copyTicketBtn').textContent = 'Copy Ticket ID', 1500);
          });
        });
      } else {
        const msg = (data && data.message) ? data.message : 'Failed to submit ticket.';
        window._utils.showMessage(responseMessage, 'error', '❌ ' + msg);
      }
    } catch (err) {
      console.error('Submit error', err);
      window._utils.showMessage(responseMessage, 'error', '❌ Network error. Please try again later.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      window._utils.setLoading(loading, false);
    }
  });
})();
