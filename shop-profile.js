// Conneverse - Shop Profile Module
// Manages shop profile data in localStorage (vanilla JS equivalent of ShopContext)

const SHOP_PROFILE_KEY = 'conneverse_shop_profile';

const DEFAULT_SHOP_PROFILE = {
    shopName: 'Bay Auto Care',
    address: '847 Harrison St, San Francisco, CA 94107',
    phone: '(415) 555-0187',
    laborRate: 133,
    region: 'San Francisco Bay Area',
    zipCode: '94107'
};

const REGIONS = [
    'San Francisco Bay Area',
    'Los Angeles',
    'New York / NJ',
    'Chicago',
    'Houston',
    'Phoenix',
    'Seattle',
    'Other'
];

function getShopProfile() {
    try {
        const raw = localStorage.getItem(SHOP_PROFILE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SHOP_PROFILE, ...parsed };
    } catch (e) {
        console.error('Failed to read shop profile:', e);
        return null;
    }
}

function setShopProfile(profile) {
    try {
        const merged = { ...DEFAULT_SHOP_PROFILE, ...profile };
        localStorage.setItem(SHOP_PROFILE_KEY, JSON.stringify(merged));
        return merged;
    } catch (e) {
        console.error('Failed to save shop profile:', e);
        return null;
    }
}

function clearShopProfile() {
    localStorage.removeItem(SHOP_PROFILE_KEY);
}

function useDefaultShopProfile() {
    return setShopProfile(DEFAULT_SHOP_PROFILE);
}

function getShopProfileOrDefault() {
    return getShopProfile() || DEFAULT_SHOP_PROFILE;
}

function requireShopProfile(redirectUrl = 'login.html') {
    const profile = getShopProfile();
    if (!profile || !profile.shopName) {
        window.location.replace(redirectUrl);
        return null;
    }
    return profile;
}

if (typeof window !== 'undefined') {
    window.ShopProfile = {
        get: getShopProfile,
        getOrDefault: getShopProfileOrDefault,
        set: setShopProfile,
        clear: clearShopProfile,
        useDefaults: useDefaultShopProfile,
        require: requireShopProfile,
        DEFAULTS: DEFAULT_SHOP_PROFILE,
        REGIONS: REGIONS
    };
}
