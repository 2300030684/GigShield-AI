const SWIGGY_CLIENT_ID  = import.meta.env.VITE_SWIGGY_CLIENT_ID;
const ZOMATO_CLIENT_ID  = import.meta.env.VITE_ZOMATO_CLIENT_ID;
const ZEPTO_CLIENT_ID   = import.meta.env.VITE_ZEPTO_CLIENT_ID;
const REDIRECT_URI      = import.meta.env.VITE_REDIRECT_URI;

// Partner OAuth configuration
export const PARTNER_CONFIG = {
  swiggy: {
    name:         "Swiggy",
    clientId:     SWIGGY_CLIENT_ID,
    authUrl:      "https://partner.swiggy.com/oauth/authorize",
    tokenUrl:     "https://partner.swiggy.com/oauth/token",
    profileUrl:   "https://partner.swiggy.com/api/v1/partner/profile",
    scope:        "partner:read earnings:read profile:read",
    color:        "#FC8019",
    bgColor:      "rgba(252,128,25,0.08)",
    borderColor:  "rgba(252,128,25,0.3)",
    glowColor:    "rgba(252,128,25,0.25)",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#FC8019"/>
      <path d="M12 4C9 4 7 6.5 7 9c0 4 5 11 5 11s5-7 5-11c0-2.5-2-5-5-5z"
            fill="white"/>
      <circle cx="12" cy="9" r="2.5" fill="#FC8019"/>
    </svg>`,
    tagline:      "For Swiggy Delivery Partners",
    workerLabel:  "Swiggy Partner Account",
  },

  zomato: {
    name:         "Zomato",
    clientId:     ZOMATO_CLIENT_ID,
    authUrl:      "https://partners.zomato.com/oauth2/authorize",
    tokenUrl:     "https://partners.zomato.com/oauth2/token",
    profileUrl:   "https://partners.zomato.com/api/partner/me",
    scope:        "partner_profile delivery_data read",
    color:        "#E23744",
    bgColor:      "rgba(226,55,68,0.08)",
    borderColor:  "rgba(226,55,68,0.3)",
    glowColor:    "rgba(226,55,68,0.25)",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#E23744"/>
      <text x="12" y="17" text-anchor="middle"
            font-family="Arial" font-weight="bold"
            font-size="14" fill="white">z</text>
    </svg>`,
    tagline:      "For Zomato Delivery Partners",
    workerLabel:  "Zomato Partner Account",
  },

  zepto: {
    name:         "Zepto",
    clientId:     ZEPTO_CLIENT_ID,
    authUrl:      "https://partner.zeptonow.com/auth/oauth/authorize",
    tokenUrl:     "https://partner.zeptonow.com/auth/oauth/token",
    profileUrl:   "https://partner.zeptonow.com/api/v1/me",
    scope:        "profile delivery earnings",
    color:        "#8B2FC9",
    bgColor:      "rgba(139,47,201,0.08)",
    borderColor:  "rgba(139,47,201,0.3)",
    glowColor:    "rgba(139,47,201,0.25)",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#8B2FC9"/>
      <path d="M8 7h8l-5 5h5l-6 5 2-5H8l4-5z" fill="white"/>
    </svg>`,
    tagline:      "For Zepto Delivery Partners",
    workerLabel:  "Zepto Partner Account",
  },
};

// Generate CSRF state token
function generateState(provider) {
  const random = Array.from(
    window.crypto.getRandomValues(new Uint8Array(16)),
    (b) => b.toString(16).padStart(2,"0")
  ).join("");
  // Encode provider in state so callback knows which partner
  return `${provider}_${random}`;
}

// Generate PKCE code verifier
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}

// Generate PKCE code challenge
async function generateCodeChallenge(verifier) {
  const data   = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}

// ── REDIRECT TO SWIGGY ──
export async function redirectToSwiggy() {
  const state        = generateState("swiggy");
  const verifier     = generateCodeVerifier();
  const challenge    = await generateCodeChallenge(verifier);
  const config       = PARTNER_CONFIG.swiggy;

  sessionStorage.setItem("oauth_state",    state);
  sessionStorage.setItem("oauth_verifier", verifier);
  sessionStorage.setItem("oauth_provider", "swiggy");

  const params = new URLSearchParams({
    response_type:         "code",
    client_id:             config.clientId || "swiggy_dev_client",
    redirect_uri:          REDIRECT_URI,
    scope:                 config.scope,
    state,
    code_challenge:        challenge,
    code_challenge_method: "S256",
  });

  window.location.href = config.authUrl + "?" + params.toString();
}

// ── REDIRECT TO ZOMATO ──
export async function redirectToZomato() {
  const state     = generateState("zomato");
  const verifier  = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const config    = PARTNER_CONFIG.zomato;

  sessionStorage.setItem("oauth_state",    state);
  sessionStorage.setItem("oauth_verifier", verifier);
  sessionStorage.setItem("oauth_provider", "zomato");

  const params = new URLSearchParams({
    response_type:         "code",
    client_id:             config.clientId || "zomato_dev_client",
    redirect_uri:          REDIRECT_URI,
    scope:                 config.scope,
    state,
    code_challenge:        challenge,
    code_challenge_method: "S256",
  });

  window.location.href = config.authUrl + "?" + params.toString();
}

// ── REDIRECT TO ZEPTO ──
export async function redirectToZepto() {
  const state     = generateState("zepto");
  const verifier  = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const config    = PARTNER_CONFIG.zepto;

  sessionStorage.setItem("oauth_state",    state);
  sessionStorage.setItem("oauth_verifier", verifier);
  sessionStorage.setItem("oauth_provider", "zepto");

  const params = new URLSearchParams({
    response_type:         "code",
    client_id:             config.clientId || "zepto_dev_client",
    redirect_uri:          REDIRECT_URI,
    scope:                 config.scope,
    state,
    code_challenge:        challenge,
    code_challenge_method: "S256",
  });

  window.location.href = config.authUrl + "?" + params.toString();
}

// ── CALLBACK HANDLER ──
export async function handleOAuthCallback() {
  const params   = new URLSearchParams(window.location.search);
  const code     = params.get("code");
  const state    = params.get("state");
  const error    = params.get("error");
  const errorDesc = params.get("error_description");

  // Handle errors returned by provider
  if (error) {
    throw new Error(
      error === "access_denied"
        ? "Login cancelled. Please try again."
        : errorDesc || `Authentication error: ${error}`
    );
  }

  if (!code)  throw new Error("No authorization code received from partner.");
  if (!state) throw new Error("Missing state parameter.");

  // Validate CSRF state
  const savedState    = sessionStorage.getItem("oauth_state");
  const savedVerifier = sessionStorage.getItem("oauth_verifier");
  const provider      = sessionStorage.getItem("oauth_provider");

  if (!savedState || state !== savedState) {
    throw new Error("Security check failed. Please try logging in again.");
  }

  // Clear session storage
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_verifier");
  sessionStorage.removeItem("oauth_provider");

  // Exchange code for user profile
  return await exchangeCodeForProfile(provider, code, savedVerifier);
}

// ── TOKEN EXCHANGE ──
async function exchangeCodeForProfile(provider, code, verifier) {
  // When real partner API credentials are approved:
  // Uncomment and use real backend exchange
  //
  // const res = await fetch(`/api/auth/${provider}/callback`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ code, verifier }),
  // });
  // if (!res.ok) throw new Error("Token exchange failed");
  // return res.json();

  // ── SIMULATION (until partner API approved) ──
  console.log(`[Trustpay] ${provider} auth code received. Exchanging...`);
  await new Promise((r) => setTimeout(r, 1200)); // simulate network
  return simulatePartnerUser(provider);
}

// ── SIMULATED USER PROFILES ──
// Replace with real partner API data once credentials approved

function simulatePartnerUser(provider) {
  const profiles = {
    swiggy: {
      id:               "SWG-HYD-20847",
      name:             "Sai Kumar Reddy",
      phone:            "+91 98765 43210",
      city:             "Hyderabad",
      zone:             "Kondapur",
      platform:         "Swiggy",
      workerID:         "SWG-HYD-20847",
      vehicleType:      "2-Wheeler",
      avgDailyEarnings: 1400,
      provider:         "swiggy",
      token:            "swg_" + Date.now(),
      activePlan:       "none",
      partnerVerified:  true,
      platformBadge: {
        color: "#FC8019",
        label: "Swiggy Partner",
      },
    },
    zomato: {
      id:               "ZMT-HYD-38291",
      name:             "Ravi Kumar",
      phone:            "+91 87654 32109",
      city:             "Hyderabad",
      zone:             "Banjara Hills",
      platform:         "Zomato",
      workerID:         "ZMT-HYD-38291",
      vehicleType:      "2-Wheeler",
      avgDailyEarnings: 1250,
      provider:         "zomato",
      token:            "zmt_" + Date.now(),
      activePlan:       "none",
      partnerVerified:  true,
      platformBadge: {
        color: "#E23744",
        label: "Zomato Partner",
      },
    },
    zepto: {
      id:               "ZPT-BLR-19283",
      name:             "Arjun Sharma",
      phone:            "+91 76543 21098",
      city:             "Bengaluru",
      zone:             "Koramangala",
      platform:         "Zepto",
      workerID:         "ZPT-BLR-19283",
      vehicleType:      "2-Wheeler",
      avgDailyEarnings: 1100,
      provider:         "zepto",
      token:            "zpt_" + Date.now(),
      activePlan:       "none",
      partnerVerified:  true,
      platformBadge: {
        color: "#8B2FC9",
        label: "Zepto Partner",
      },
    },
  };

  return profiles[provider] || profiles.swiggy;
}
