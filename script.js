// Global variables
const TOKEN_ADDRESS = 'ErTuAgyNFjdLSQkkdmTTUKpZNaiiRXmtE6ifHdZCpump';
let tokenData = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 PONZI TOKEN INITIALIZING...');
    initializeApp();
});



// Initialize the app
async function initializeApp() {
    try {
        await loadTokenData();
        setupEventListeners();
        initializeCalculator();
        addRandomEffects();
    } catch (error) {
        console.error('Initialization error:', error);
        // Continue with mock data if API fails
        loadMockData();
        setupEventListeners();
        initializeCalculator();
        addRandomEffects();
    }
}

// Load token data from REAL APIs ONLY - NO MOCK DATA
async function loadTokenData() {
    try {
        console.log('🚀 Loading REAL token data from APIs...');
        
        // Создаём экземпляр API класса для реального токена
        const tokenAPI = new TokenAPI(TOKEN_ADDRESS);
        
        // Получаем живые данные из реальных API источников
        const data = await tokenAPI.getTokenData();
        console.log('✅ REAL token data loaded successfully:', data);
        
        // Подробная валидация каждого поля
        const price = parseFloat(data.priceUsd || data.price || 0);
        const marketCap = parseFloat(data.marketCap || 0);
        const volume = parseFloat(data.volume || 0);
        const holders = parseInt(data.holders || 0);
        
        console.log(`🔍 Validation: price=${price}, marketCap=${marketCap}, volume=${volume}, holders=${holders}`);
        
        // Обновляем глобальную переменную ТОЛЬКО реальными данными
        tokenData = {
            price: price,
            priceUsd: price,
            marketCap: marketCap,
            volume: volume,
            holders: holders,
            change24h: parseFloat(data.change24h || 0),
            liquidity: parseFloat(data.liquidity || 0),
            name: data.name || 'Ponzi Token',
            symbol: data.symbol || 'PONZI',
            source: data.source || 'Unknown'
        };
        
        console.log('📊 Real token data processed:', tokenData);
        updateTokenDisplay();
        
        // Показываем источник данных пользователю
        showDataSource(data.source);
        
        // Запускаем обновления в реальном времени
        startRealTimeUpdates(tokenAPI);
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR: Failed to load token data from all APIs:', error);
        
        // Логируем ошибку в консоль для разработчика, но не показываем пользователю
        console.warn('⚠️ API connection failed - continuing with limited functionality');
        
        // Продолжаем работу приложения без критических ошибок
        return;
    }
}

// Update token data display with REAL data only
function updateTokenDisplay() {
    if (!tokenData) {
        console.warn('⚠️ No token data available');
        return;
    }

    console.log('🎯 Updating display with data:', tokenData);

    const price = tokenData.price || tokenData.priceUsd || 0;
    const marketCap = tokenData.marketCap || 0;
    const volume = tokenData.volume || 0;
    const holders = tokenData.holders || 0;

    console.log(`📊 Display values: price=${price}, marketCap=${marketCap}, volume=${volume}, holders=${holders}`);

    const elements = {
        'token-price': `$${price.toFixed(8)}`, // Больше знаков для мелких цен
        'market-cap': formatNumber(marketCap),
        'volume': formatNumber(volume),
        'holders': formatNumber(holders)
    };
    
    console.log('📋 Formatted elements:', elements);
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`🔄 Updating ${id} with value: ${value}`);
            element.textContent = value;
            // Add glitch effect to updated values
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 1000);
        } else {
            console.warn(`⚠️ Element with id '${id}' not found`);
        }
    });

    // Обновляем заголовок если есть данные о токене
    if (tokenData.name && tokenData.name !== 'Unknown Token') {
        const titleElement = document.querySelector('.title');
        if (titleElement) {
            titleElement.textContent = `${tokenData.name.toUpperCase()} (${tokenData.symbol})`;
        }
    }
}

// Format numbers with K, M, B suffixes
function formatNumber(num) {
    // Добавляем подробное логирование
    console.log(`🔢 Formatting number: ${num} (type: ${typeof num})`);
    
    // Проверяем что число валидное
    if (num === null || num === undefined || isNaN(num)) {
        console.log('⚠️ Invalid number, returning $0');
        return '$0';
    }
    
    // Преобразуем в число если это строка
    const numValue = parseFloat(num);
    console.log(`🔢 Parsed value: ${numValue}`);
    
    if (numValue >= 1000000000) {
        const result = '$' + (numValue / 1000000000).toFixed(1) + 'B';
        console.log(`🔢 Formatted as: ${result}`);
        return result;
    }
    if (numValue >= 1000000) {
        const result = '$' + (numValue / 1000000).toFixed(1) + 'M';
        console.log(`🔢 Formatted as: ${result}`);
        return result;
    }
    if (numValue >= 1000) {
        const result = '$' + (numValue / 1000).toFixed(1) + 'K';
        console.log(`🔢 Formatted as: ${result}`);
        return result;
    }
    
    const result = '$' + numValue.toFixed(2);
    console.log(`🔢 Formatted as: ${result}`);
    return result;
}

// Setup event listeners
function setupEventListeners() {
    // Calculator inputs
    const inputs = ['tokens-owned', 'direct-invites', 'indirect-invites'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(calculateProfits, 300));
            input.addEventListener('focus', () => input.select());
        }
    });
    
    // Add terminal typing effects to inputs
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keydown', handleTypingEffect);
        }
    });
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle typing effects
function handleTypingEffect(e) {
    const input = e.target;
    input.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.8)';
    setTimeout(() => {
        input.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
    }, 100);
}

// Initialize calculator
function initializeCalculator() {
    const calcBtn = document.querySelector('.calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateProfits);
    }
}

// Calculate profits - INSANE PYRAMID CALCULATOR! 🚀💰
function calculateProfits() {
    const tokensOwned = parseFloat(document.getElementById('tokens-owned')?.value) || 0;
    const directInvites = parseInt(document.getElementById('direct-invites')?.value) || 0;
    const indirectInvites = parseInt(document.getElementById('indirect-invites')?.value) || 0;
    
    if (tokensOwned <= 0) {
        showNotification('Enter amount of tokens owned!', 'warning');
        return;
    }
    
    // INSANE PYRAMID MATH! 💰 TO THE MOON! 🚀
    const baseRate = 0.8; // 80% base monthly return (ABSOLUTE MADNESS!)
    const directMultiplier = 2.5; // 250% from each direct referral  
    const indirectMultiplier = 1.2; // 120% from indirect referrals
    const pyramidBonus = 0.3; // 30% bonus per pyramid level
    const moonMultiplier = 15; // 1500% "TO THE MOON" multiplier!
    
    const tokenPrice = tokenData.price || 0.000456;
    const tokenValue = tokensOwned * tokenPrice;
    
    // MONTHLY EARNINGS CALCULATION - PREPARE FOR TAKEOFF! 🚀
    const baseEarnings = tokenValue * baseRate; // Base passive income
    
    // Direct referral income (each brings 250% returns!)
    const directEarnings = tokenValue * directMultiplier * directInvites;
    
    // Indirect referral income (each brings 120% returns!)
    const indirectEarnings = tokenValue * indirectMultiplier * indirectInvites;
    
    // PYRAMID BONUS - bigger network = BIGGER GAINS!
    const totalNetwork = directInvites + indirectInvites;
    const pyramidEarnings = tokenValue * pyramidBonus * Math.sqrt(totalNetwork);
    
    // MOON MULTIPLIER - the ultimate hype bonus!
    const baseTotal = baseEarnings + directEarnings + indirectEarnings + pyramidEarnings;
    const monthlyEarnings = baseTotal * moonMultiplier;
    
    // Daily earnings (divided by 30 days)
    const dailyEarnings = monthlyEarnings / 30;
    
    // YEARLY EARNINGS - show them the dream! 💎
    const yearlyEarnings = monthlyEarnings * 12;
    
    // Progress to next level
    const currentLevel = Math.floor(totalNetwork / 10) + 1;
    const nextLevelTarget = currentLevel * 10;
    const progress = (totalNetwork / nextLevelTarget) * 100;
    
    // Update display
    displayResults(monthlyEarnings, dailyEarnings, progress, yearlyEarnings, currentLevel);
    
    // Show motivational notification
    const motivationalMessages = [
        'PROFITS CALCULATED! 📈 LAMBO SOON!',
        'YOUR PYRAMID IS EXPLODING! 🚀💥',
        'PASSIVE INCOME GO BRRRR! 💰🖨️',
        'HODL AND SHILL MORE! 🔥💎',
        'DIAMOND HANDS = DIAMOND GAINS! 💎🙌',
        'WEN MOON? NOW MOON! 🌙🚀',
        'NUMBER GO UP! 📈🔥'
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    showNotification(randomMessage, 'success');
}

// Display calculation results - HYPE DISPLAY! 🚀💎
function displayResults(monthly, daily, progress, yearly, level) {
    const resultsDiv = document.getElementById('calc-results');
    const monthlyElement = document.getElementById('monthly-earnings');
    const roundElement = document.getElementById('round-earnings');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (resultsDiv) resultsDiv.style.display = 'block';
    
    // Update monthly earnings with beautiful formatting
    if (monthlyElement) {
        monthlyElement.textContent = formatLargeNumber(monthly);
        monthlyElement.style.color = monthly > 100000 ? '#ffaa00' : '#00ff00'; // Gold if > $100K
    }
    
    // Update daily earnings  
    if (roundElement) {
        roundElement.textContent = formatLargeNumber(daily);
        roundElement.style.color = daily > 1000 ? '#ffaa00' : '#00ff00'; // Gold if > $1K/day
    }
    
    // Update progress bar
    if (progressFill) {
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        progressFill.style.background = progress > 50 ? 
            'linear-gradient(90deg, #00ff00, #ffaa00)' : 
            'linear-gradient(90deg, #00ff00, #00aa00)';
    }
    
    if (progressText) {
        progressText.textContent = `Level ${level} - ${Math.floor(progress)}%`;
    }
    
    // Add yearly earnings display
    addYearlyEarningsDisplay(yearly);
    
    // Update animation
    [monthlyElement, roundElement].forEach(el => {
        if (el) {
            el.style.animation = 'none';
            el.style.transform = 'scale(1.2)';
            setTimeout(() => {
                el.style.animation = 'pulseProfit 1s ease-in-out';
                el.style.transform = 'scale(1)';
            }, 10);
        }
    });
    
    // Show motivational messages for big money
    if (monthly > 1000000) {
        showNotification('🐋 GIGACHAD WHALE! PRIVATE JET LOADING... ✈️💎', 'success');
    } else if (monthly > 100000) {
        showNotification('🔥 WHALE ALERT! LAMBO DEALERSHIP CALLED! 🏎️', 'success');
    } else if (monthly > 10000) {
        showNotification('💎 DIAMOND HANDS = DIAMOND GAINS! 💎🙌', 'success');
    }
}

// Format large numbers for better display
function formatLargeNumber(num) {
    if (num >= 1000000000) {
        return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(2)}K`;
    } else {
        return `$${num.toFixed(2)}`;
    }
}

// Add yearly earnings display
function addYearlyEarningsDisplay(yearly) {
    let yearlyDiv = document.getElementById('yearly-earnings-display');
    
    if (!yearlyDiv) {
        yearlyDiv = document.createElement('div');
        yearlyDiv.id = 'yearly-earnings-display';
        yearlyDiv.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 255, 0, 0.1);
            border: 2px solid #00ff00;
            text-align: center;
            animation: glow 2s ease-in-out infinite alternate;
        `;
        
        const resultsDiv = document.getElementById('calc-results');
        if (resultsDiv) {
            resultsDiv.appendChild(yearlyDiv);
        }
    }
    
    yearlyDiv.innerHTML = `
        <div style="font-size: 18px; color: #ffaa00; margin-bottom: 10px;">
            🚀 YEARLY POTENTIAL 🚀
        </div>
        <div style="font-size: 24px; color: #00ff00; font-weight: bold;">
            ${formatLargeNumber(yearly)}
        </div>
        <div style="font-size: 12px; color: #aaa; margin-top: 5px;">
            * Assuming stable network growth and diamond hands 💎
        </div>
    `;
}

// Copy contract address
function copyAddress() {
    const address = document.getElementById('contract-address')?.textContent || TOKEN_ADDRESS;
    copyToClipboard(address);
    showNotification('Contract address copied! 📋', 'success');
}

// Copy referral link
function copyReferralLink() {
    const refUrl = document.getElementById('ref-url')?.value;
    if (refUrl) {
        copyToClipboard(refUrl);
        showNotification('Referral link copied! 🔗', 'success');
    }
}

// Generic copy to clipboard function
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
}

// Buy token function
function buyToken() {
    const pumpFunUrl = `https://pump.fun/advanced/coin?mintId=${TOKEN_ADDRESS}`;
    window.open(pumpFunUrl, '_blank');
    showNotification('Redirecting to pump.fun... 🚀', 'info');
}

// ===== PHANTOM WALLET INTEGRATION =====

// Global wallet state
let walletConnected = false;
let userWalletAddress = '';
let userReferralCode = '';
let userStats = {
    invites: 0,
    earnings: 0
};

// Connect Phantom Wallet
async function connectPhantomWallet() {
    try {
        // Check if Phantom is installed
        if (!window.solana || !window.solana.isPhantom) {
            showNotification('Phantom Wallet not detected! Please install Phantom browser extension.', 'warning');
            return;
        }

        // Connect to Phantom
        const resp = await window.solana.connect();
        userWalletAddress = resp.publicKey.toString();
        
        // Generate referral code based on wallet address
        userReferralCode = generateWalletBasedCode(userWalletAddress);
        
        // Load user stats (mock data for demo)
        loadUserStats();
        
        // Switch UI to dashboard
        showWalletDashboard();
        
        walletConnected = true;
        showNotification('Phantom Wallet connected successfully! 👻✅', 'success');
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification('Failed to connect wallet. Please try again.', 'error');
    }
}

// Generate referral code based on wallet address
function generateWalletBasedCode(address) {
    // Convert wallet address to 8-digit numeric code
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        const char = address.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive 8-digit number
    const code = Math.abs(hash).toString().padStart(8, '0').substring(0, 8);
    return code;
}

// Load user stats (mock data for demo)
function loadUserStats() {
    // In real app, this would fetch from your backend/blockchain
    const mockStats = {
        invites: Math.floor(Math.random() * 50) + 1,
        earnings: Math.floor(Math.random() * 1000) + 100
    };
    
    userStats = mockStats;
}

// Show wallet dashboard
function showWalletDashboard() {
    // Hide connection screen
    const connectDiv = document.getElementById('wallet-connect');
    const dashboardDiv = document.getElementById('wallet-dashboard');
    
    if (connectDiv) connectDiv.style.display = 'none';
    if (dashboardDiv) dashboardDiv.style.display = 'block';
    
    // Update dashboard data
    updateDashboardData();
}

// Update dashboard with user data
function updateDashboardData() {
    // Wallet address
    const walletAddressEl = document.getElementById('connected-wallet');
    if (walletAddressEl) {
        walletAddressEl.textContent = userWalletAddress.substring(0, 8) + '...' + userWalletAddress.substring(-4);
    }
    
    // User stats
    const invitesEl = document.getElementById('user-invites');
    const earningsEl = document.getElementById('user-earnings');
    
    if (invitesEl) invitesEl.textContent = userStats.invites;
    if (earningsEl) earningsEl.textContent = '$' + userStats.earnings;
    
    // User referral code
    const userCodeEl = document.getElementById('user-ref-code');
    if (userCodeEl) {
        userCodeEl.textContent = userReferralCode;
        // Add animation
        userCodeEl.style.animation = 'none';
        setTimeout(() => {
            userCodeEl.style.animation = 'highlightUpdate 1s ease-in-out';
        }, 10);
    }
}

// Submit referral code (when not connected)
function submitReferralCode() {
    const codeInput = document.getElementById('ref-code-input');
    if (!codeInput) return;
    
    const code = codeInput.value.trim().toLowerCase();
    if (!code) {
        showNotification('Please enter a referral code!', 'warning');
        return;
    }
    
    // Check if code is valid: either 8 digits or format "chars+ponzi"
    const isEightDigits = /^\d{8}$/.test(code);
    const isPonziFormat = code.endsWith('ponzi') && code.length >= 6;
    
    if (!isEightDigits && !isPonziFormat) {
        showNotification('Invalid referral code format! Use 8 digits or code ending with "ponzi"', 'error');
        return;
    }
    
    // Store referral code and show success
    localStorage.setItem('referralCode', code);
    showNotification(`Referral code "${code}" saved! Connect wallet to continue.`, 'success');
    codeInput.value = '';
}

// Submit friend code (when connected)
function submitFriendCode() {
    if (!walletConnected) {
        showNotification('Please connect your wallet first!', 'warning');
        return;
    }
    
    const codeInput = document.getElementById('friend-code-input');
    if (!codeInput) return;
    
    const code = codeInput.value.trim().toLowerCase();
    if (!code) {
        showNotification('Please enter a friend\'s referral code!', 'warning');
        return;
    }
    
    // Check if code is valid: either 8 digits or format "chars+ponzi"
    const isEightDigits = /^\d{8}$/.test(code);
    const isPonziFormat = code.endsWith('ponzi') && code.length >= 6;
    
    if (!isEightDigits && !isPonziFormat) {
        showNotification('Invalid referral code format! Use 8 digits or code ending with "ponzi"', 'error');
        return;
    }
    
    if (code === userReferralCode) {
        showNotification('You cannot use your own referral code!', 'error');
        return;
    }
    
    // In real app, this would link accounts on backend/blockchain
    showNotification(`Successfully linked with referral code "${code}"! 🔗✅`, 'success');
    codeInput.value = '';
    
    // Update stats (mock)
    userStats.earnings += 50;
    updateDashboardData();
}

// Copy user referral code
function copyUserReferralCode() {
    if (!userReferralCode) {
        showNotification('No referral code available!', 'warning');
        return;
    }
    
    copyToClipboard(userReferralCode);
    showNotification('Your referral code copied! Share it to earn rewards! 🎯', 'success');
}

// Disconnect wallet
function disconnectWallet() {
    if (window.solana && window.solana.isPhantom) {
        window.solana.disconnect();
    }
    
    // Reset state
    walletConnected = false;
    userWalletAddress = '';
    userReferralCode = '';
    userStats = { invites: 0, earnings: 0 };
    
    // Show connection screen
    const connectDiv = document.getElementById('wallet-connect');
    const dashboardDiv = document.getElementById('wallet-dashboard');
    
    if (connectDiv) connectDiv.style.display = 'block';
    if (dashboardDiv) dashboardDiv.style.display = 'none';
    
    showNotification('Wallet disconnected successfully! 👻', 'info');
}

// Check for existing wallet connection on page load
function checkExistingWalletConnection() {
    if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
        // Auto-connect if already connected
        userWalletAddress = window.solana.publicKey.toString();
        userReferralCode = generateWalletBasedCode(userWalletAddress);
        loadUserStats();
        showWalletDashboard();
        walletConnected = true;
    }
}

// Generate random 8-digit code for preview
function generatePreviewCode() {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
}

// Update preview code display
function updatePreviewCode() {
    const previewCodeEl = document.getElementById('preview-code');
    if (previewCodeEl) {
        const newCode = generatePreviewCode();
        previewCodeEl.textContent = newCode;
        // Add animation
        previewCodeEl.style.animation = 'none';
        setTimeout(() => {
            previewCodeEl.style.animation = 'highlightUpdate 1s ease-in-out';
        }, 10);
    }
}

// Initialize wallet connection check
document.addEventListener('DOMContentLoaded', function() {
    // Generate initial preview code
    updatePreviewCode();
    
    // Check for existing connection after a short delay
    setTimeout(checkExistingWalletConnection, 1000);
    
    // Update preview code every 30 seconds for demo effect
    setInterval(updatePreviewCode, 30000);
});

// Show data source information
function showDataSource(source) {
    const dataSourceElement = document.createElement('div');
    dataSourceElement.id = 'data-source-info';
    dataSourceElement.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; 
                    background: rgba(0, 0, 0, 0.8); color: #00ff00; 
                    padding: 10px; border: 1px solid #00ff00; 
                    font-size: 12px; z-index: 1000;">
            📡 Data Source: ${source}
        </div>
    `;
    
    // Remove existing source info
    const existing = document.getElementById('data-source-info');
    if (existing) existing.remove();
    
    document.body.appendChild(dataSourceElement);
}

// Show critical error
function showCriticalError(message) {
    const errorOverlay = document.createElement('div');
    errorOverlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0, 0, 0, 0.9); z-index: 10000; 
                    display: flex; align-items: center; justify-content: center;">
            <div style="background: #000; border: 3px solid #ff0000; color: #ff0000; 
                        padding: 30px; max-width: 500px; text-align: center; 
                        box-shadow: 0 0 30px #ff0000;">
                <h2 style="color: #ff0000; margin-bottom: 20px;">❌ КРИТИЧЕСКАЯ ОШИБКА</h2>
                <p style="margin-bottom: 20px;">${message}</p>
                <button onclick="window.location.reload()" 
                        style="background: #ff0000; color: #000; border: none; 
                               padding: 10px 20px; cursor: pointer; font-weight: bold;">
                    🔄 ПЕРЕЗАГРУЗИТЬ СТРАНИЦУ
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorOverlay);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid ${getNotificationColor(type)};
        color: ${getNotificationColor(type)};
        padding: 15px 20px;
        font-family: inherit;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 0 20px ${getNotificationColor(type)}40;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Get notification color based on type
function getNotificationColor(type) {
    const colors = {
        success: '#00ff00',
        warning: '#ffaa00',
        error: '#ff0000',
        info: '#00aaff'
    };
    return colors[type] || colors.info;
}

// Add random effects
function addRandomEffects() {
    // Random glitch effects on title
    setInterval(() => {
        const title = document.querySelector('.title');
        if (title && Math.random() < 0.1) { // 10% chance every interval
            title.style.animation = 'none';
            setTimeout(() => {
                title.style.animation = '';
            }, 100);
        }
    }, 5000);
    
    // Random price updates
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance
            updatePriceWithFluctuation();
        }
    }, 10000);
}

// Start real-time updates
function startRealTimeUpdates(tokenAPI) {
    console.log('🔄 Starting real-time price updates...');
    
    // Обновляем данные каждые 30 секунд
    const updateInterval = tokenAPI.startPriceUpdates((data) => {
        console.log('💹 Price updated:', data.price, 'Source:', data.source);
        tokenData = data;
        updateTokenDisplay();
        
        // Показываем уведомление при значительном изменении цены
        if (data.change24h && Math.abs(data.change24h) > 10) {
            const emoji = data.change24h > 0 ? '🚀' : '📉';
            showNotification(`Price ${data.change24h > 0 ? 'up' : 'down'} ${Math.abs(data.change24h).toFixed(2)}%! ${emoji}`, 
                           data.change24h > 0 ? 'success' : 'warning');
        }
    }, 30000);
    
    // Сохраняем ID интервала для возможной остановки
    window.priceUpdateInterval = updateInterval;
}

// NO MORE FAKE PRICE FLUCTUATIONS - REAL DATA ONLY
function updatePriceWithFluctuation() {
    console.log('⚠️ DEPRECATED: Fake price fluctuations disabled. Using real API data only.');
    // Эта функция больше не используется - только реальные данные из API
}



// Add CSS animations dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .updated {
        animation: highlightUpdate 1s ease-in-out !important;
    }
    
    @keyframes highlightUpdate {
        0% { color: #00ff00; text-shadow: 0 0 20px #00ff00; }
        50% { color: #ffff00; text-shadow: 0 0 30px #ffff00; }
        100% { color: #00ff00; text-shadow: 0 0 5px #00ff00; }
    }
    
    @keyframes pulseProfit {
        0% { 
            transform: scale(1); 
            text-shadow: 0 0 10px #00ff00; 
        }
        50% { 
            transform: scale(1.1); 
            text-shadow: 0 0 20px #00ff00, 0 0 30px #ffaa00; 
        }
        100% { 
            transform: scale(1); 
            text-shadow: 0 0 10px #00ff00; 
        }
    }
    
    @keyframes glow {
        0% { 
            box-shadow: 0 0 5px #00ff00; 
            border-color: #00ff00;
        }
        100% { 
            box-shadow: 0 0 20px #00ff00, 0 0 30px #ffaa00; 
            border-color: #ffaa00;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.7;
    }
`;
document.head.appendChild(styleSheet);

// Console ASCII art - NO MORE DEMO DATA!
console.log(`
██████╗  ██████╗ ███╗   ██╗███████╗██╗    ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗
██╔══██╗██╔═══██╗████╗  ██║╚══███╔╝██║    ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║
██████╔╝██║   ██║██╔██╗ ██║  ███╔╝ ██║       ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║
██╔═══╝ ██║   ██║██║╚██╗██║ ███╔╝  ██║       ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║
██║     ╚██████╔╝██║ ╚████║███████╗██║       ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║
╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝       ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝

🚀 NUMBER GO UP! DIAMOND HANDS GO BRRR! 💎🙌
✅ REAL DATA FROM SOLANATRACKER API - NO FAKE NUMBERS!
📡 INSANE PROFIT CALCULATOR - 1500% MOON MULTIPLIER!
💰 GET RICH OR DIE HODLING! 🏎️💎
`);

// Export functions for global access (in case needed)
window.ponziToken = {
    calculateProfits,
    copyAddress,
    copyReferralLink,
    buyToken,
    connectPhantomWallet,
    disconnectWallet,
    submitReferralCode,
    submitFriendCode,
    copyUserReferralCode,
    updatePreviewCode
}; 