// DOM elements
const currentStreakEl = document.getElementById('current-streak');
const bestStreakEl = document.getElementById('best-streak');
const calendarEl = document.getElementById('calendar');
const markSuccessBtn = document.getElementById('mark-success');
const resetBtn = document.getElementById('reset');

// Data structure
let userData = {
    currentStreak: 0,
    bestStreak: 0,
    successDays: [],
    lastUpdated: null
};

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('nofapData');
    if (savedData) {
        userData = JSON.parse(savedData);
        
        // Convert date strings back to Date objects
        userData.successDays = userData.successDays.map(dateStr => new Date(dateStr));
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

// Update the UI
function updateUI() {
    // Update streak counters
    currentStreakEl.textContent = userData.currentStreak;
    bestStreakEl.textContent = userData.bestStreak;
    
    // Generate calendar for the current month
    generateCalendar();
}

// Generate the calendar for current month
function generateCalendar() {
    calendarEl.innerHTML = '';
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day day-header';
        dayHeader.textContent = day.charAt(0);
        
        // Add hidden full day name for accessibility
        const fullDaySpan = document.createElement('span');
        fullDaySpan.className = 'sr-only';
        fullDaySpan.textContent = day;
        dayHeader.appendChild(fullDaySpan);
        
        calendarEl.appendChild(dayHeader);
    });
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarEl.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Don't allow selecting future dates
        if (date <= today) {
            dayEl.classList.add('selectable');
            
            // Add click event to toggle success status
            dayEl.addEventListener('click', () => {
                toggleDaySuccess(date);
            });
        }
        
        // Mark today
        if (day === today.getDate()) {
            dayEl.classList.add('today');
        }
        
        // Mark success days
        if (isSuccessDay(date)) {
            dayEl.classList.add('success');
        }
        
        calendarEl.appendChild(dayEl);
    }
}

// Toggle success status for a specific day
function toggleDaySuccess(date) {
    // Create a new date with time set to midnight to avoid time comparison issues
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Check if the date is already marked as successful
    const existingIndex = userData.successDays.findIndex(d => isSameDay(d, targetDate));
    
    if (existingIndex !== -1) {
        // If already marked, remove it
        userData.successDays.splice(existingIndex, 1);
    } else {
        // If not marked, add it
        userData.successDays.push(targetDate);
    }
    
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

// Mark today as successful
function markToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if today is already marked
    if (isSuccessDay(today)) {
        alert('Today is already marked as successful!');
        return;
    }
    
    // Add today to successful days
    userData.successDays.push(today);
    userData.lastUpdated = new Date();
    
    // Calculate streak
    calculateStreak();
    
    // Save and update UI
    saveData();
    updateUI();
}

// Reset the current streak
function resetStreak() {
    if (confirm('Are you sure you want to reset your current streak?')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Remove all dates from current streak
        let currentDate = new Date(today);
        while (true) {
            const index = userData.successDays.findIndex(date => isSameDay(date, currentDate));
            if (index !== -1) {
                userData.successDays.splice(index, 1);
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        userData.currentStreak = 0;
        userData.lastUpdated = new Date();
        
        // Save and update UI
        saveData();
        updateUI();
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

// Event listeners
markSuccessBtn.addEventListener('click', markToday);
resetBtn.addEventListener('click', resetStreak);

// Initialize
loadData();
checkDayChange();
calculateStreak();
updateUI();

// Check for day change when the page gains focus
window.addEventListener('focus', checkDayChange); 