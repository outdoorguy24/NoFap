// DOM elements
const currentStreakEl = document.getElementById('current-streak');
const calendarEl = document.getElementById('calendar');

// Data structure
let userData = {
    currentStreak: 0,
    bestStreak: 0,
    successDays: [],
    missedDays: [],
    lastUpdated: null
};

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('nofapData');
    if (savedData) {
        userData = JSON.parse(savedData);
        
        // Convert date strings back to Date objects
        userData.successDays = userData.successDays.map(dateStr => new Date(dateStr));
        
        // Initialize missedDays array if it doesn't exist
        if (!userData.missedDays) {
            userData.missedDays = [];
        } else {
            userData.missedDays = userData.missedDays.map(dateStr => new Date(dateStr));
        }
        
        if (userData.lastUpdated) {
            userData.lastUpdated = new Date(userData.lastUpdated);
        }
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('nofapData', JSON.stringify(userData));
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
    return formatDate(date1) === formatDate(date2);
}

// Check if a date is in the successDays array
function isSuccessDay(date) {
    return userData.successDays.some(successDate => isSameDay(successDate, date));
}

// Check if a date is in the missedDays array
function isMissedDay(date) {
    return userData.missedDays.some(missedDate => isSameDay(missedDate, date));
}

// Show modal with message
function showModal(message) {
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const modalMessage = document.createElement('p');
    modalMessage.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.textContent = 'I Understand';
    
    // Assemble modal
    modalContent.appendChild(modalMessage);
    modalContent.appendChild(closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Add close functionality
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    // Also close when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    // Prevent scrolling while modal is open
    document.body.style.overflow = 'hidden';
    
    // Reset overflow when modal closes
    closeButton.addEventListener('click', () => {
        document.body.style.overflow = '';
    });
}

// Update the UI
function updateUI() {
    // Update streak counter
    currentStreakEl.textContent = userData.currentStreak;
    
    // Generate calendar for the current month
    generateCalendar();
}

// Generate the calendar for current month
function generateCalendar() {
    calendarEl.innerHTML = '';
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Add month header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    monthHeader.textContent = monthNames[currentMonth];
    calendarEl.appendChild(monthHeader);
    
    // Get total days in the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Add days of the month sequentially
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Don't allow selecting future dates
        if (date <= today) {
            dayEl.classList.add('selectable');
            
            // Add click event to toggle day status
            dayEl.addEventListener('click', () => {
                toggleDayStatus(date);
            });
            
            // Mark success days
            if (isSuccessDay(date)) {
                dayEl.classList.add('success');
            }
            // Mark missed days
            else if (isMissedDay(date)) {
                dayEl.classList.add('missed');
            }
        }
        
        // Mark today
        if (day === today.getDate() && currentMonth === today.getMonth()) {
            dayEl.classList.add('today');
        }
        
        calendarEl.appendChild(dayEl);
    }
}

// Toggle day status (success, missed, or neither)
function toggleDayStatus(date) {
    // Create a new date with time set to midnight to avoid time comparison issues
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Check current status
    const isSuccess = isSuccessDay(targetDate);
    const isMissed = isMissedDay(targetDate);
    
    // Remove from both arrays first
    const successIndex = userData.successDays.findIndex(d => isSameDay(d, targetDate));
    if (successIndex !== -1) {
        userData.successDays.splice(successIndex, 1);
    }
    
    const missedIndex = userData.missedDays.findIndex(d => isSameDay(d, targetDate));
    if (missedIndex !== -1) {
        userData.missedDays.splice(missedIndex, 1);
    }
    
    // Toggle status
    if (!isSuccess && !isMissed) {
        // If neither, mark as success
        userData.successDays.push(targetDate);
    } else if (isSuccess) {
        // If was success, mark as missed
        userData.missedDays.push(targetDate);
        showModal("You're a pussy, now stop touching yourself");
    }
    // If was missed, now it's neither (already removed above)
    
    // Update last updated timestamp
    userData.lastUpdated = new Date();
    
    // Recalculate streak
    calculateStreak();
    
    // Save and update UI
    saveData();
    updateUI();
}

// Calculate streak
function calculateStreak() {
    if (userData.successDays.length === 0) {
        userData.currentStreak = 0;
        return;
    }
    
    // Sort dates in ascending order
    userData.successDays.sort((a, b) => a - b);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if yesterday is in the success days
    const hasYesterday = isSuccessDay(yesterday);
    
    // If today is already marked or we have yesterday marked
    if (isSuccessDay(today) || hasYesterday) {
        // Count consecutive days
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            if (isSuccessDay(currentDate)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        userData.currentStreak = streak;
        
        // Update best streak if needed
        if (userData.currentStreak > userData.bestStreak) {
            userData.bestStreak = userData.currentStreak;
        }
    } else {
        // Streak is broken
        userData.currentStreak = 0;
    }
}

// Check for day change
function checkDayChange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (userData.lastUpdated) {
        const lastDate = new Date(userData.lastUpdated);
        lastDate.setHours(0, 0, 0, 0);
        
        if (!isSameDay(today, lastDate)) {
            // Day has changed, recalculate streak
            calculateStreak();
            saveData();
        }
    } else {
        userData.lastUpdated = today;
        saveData();
    }
}

// Initialize
loadData();
checkDayChange();
calculateStreak();
updateUI();

// Check for day change when the page gains focus
window.addEventListener('focus', checkDayChange); 