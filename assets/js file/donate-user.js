document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(`${tabId}-section`).classList.add('active');
        });
    });
    
    // Download button functionality
    const downloadButtons = document.querySelectorAll('.download-btn:not([disabled])');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileName = this.closest('.file-card').querySelector('h3').textContent;
            alert(`Downloading ${fileName}...`);
            // In a real application, this would trigger an actual file download
        });
    });
    
    // Request button functionality
    const requestBtn = document.querySelector('.request-btn');
    
    if (requestBtn) {
        requestBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Donation buttons functionality
    const donateButtons = document.querySelectorAll('.donate-btn');
    const paymentModal = document.getElementById('payment-modal');
    const cancelPayment = document.getElementById('cancel-payment');
    const confirmPayment = document.getElementById('confirm-payment');
    const modalAmount = document.getElementById('modal-amount');
    const modalPurpose = document.getElementById('modal-purpose');
    
    donateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const purpose = this.closest('.donation-card').querySelector('h3').textContent;
            modalAmount.textContent = 'PHP 500';
            modalPurpose.textContent = purpose;
            paymentModal.style.display = 'flex';
        });
    });
    
    // Custom donation form submission
    const donationForm = document.getElementById('custom-donation-form');
    
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('donation-amount').value;
            const purpose = document.getElementById('donation-purpose');
            const purposeText = purpose.options[purpose.selectedIndex].text;
            
            modalAmount.textContent = `PHP ${amount}`;
            modalPurpose.textContent = purposeText;
            paymentModal.style.display = 'flex';
        });
    }
    
    // Cancel payment
    if (cancelPayment) {
        cancelPayment.addEventListener('click', function() {
            paymentModal.style.display = 'none';
        });
    }
    
    // Confirm payment
    if (confirmPayment) {
        confirmPayment.addEventListener('click', function() {
            const receipt = document.getElementById('payment-receipt');
            
            if (receipt.files.length === 0) {
                alert('Please upload your payment receipt');
                return;
            }
            
            alert('Thank you for your donation! Your contribution has been received.');
            paymentModal.style.display = 'none';
        });
    }
    
    // Close modal if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
});
