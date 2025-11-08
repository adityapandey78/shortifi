// Indian state code to name mapping
export const INDIAN_STATES = {
  'AN': 'Andaman and Nicobar Islands',
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CH': 'Chandigarh',
  'CT': 'Chhattisgarh',
  'DD': 'Daman and Diu',
  'DL': 'Delhi',
  'DN': 'Dadra and Nagar Haveli',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HP': 'Himachal Pradesh',
  'HR': 'Haryana',
  'JH': 'Jharkhand',
  'JK': 'Jammu and Kashmir',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'LA': 'Ladakh',
  'LD': 'Lakshadweep',
  'MH': 'Maharashtra',
  'ML': 'Meghalaya',
  'MN': 'Manipur',
  'MP': 'Madhya Pradesh',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OR': 'Odisha',
  'PB': 'Punjab',
  'PY': 'Puducherry',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TG': 'Telangana',
  'TN': 'Tamil Nadu',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UT': 'Uttarakhand',
  'WB': 'West Bengal',
};

// US state codes
export const US_STATES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
};

/**
 * Get full region name from region code
 * @param {string} regionCode - Region/state code
 * @param {string} countryCode - Country code
 * @returns {string} Full region name or original code
 */
export function getRegionName(regionCode, countryCode) {
  if (!regionCode) return null;
  
  if (countryCode === 'IN') {
    return INDIAN_STATES[regionCode] || regionCode;
  }
  
  if (countryCode === 'US') {
    return US_STATES[regionCode] || regionCode;
  }
  
  // Return original code for other countries
  return regionCode;
}

/**
 * Get full country name from country code
 * @param {string} countryCode - ISO country code
 * @returns {string} Full country name
 */
export function getCountryName(countryCode) {
  const countries = {
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'BR': 'Brazil',
    'RU': 'Russia',
    'IT': 'Italy',
    'ES': 'Spain',
    'MX': 'Mexico',
    'ID': 'Indonesia',
    'NL': 'Netherlands',
    'SA': 'Saudi Arabia',
    'TR': 'Turkey',
    'CH': 'Switzerland',
    'PL': 'Poland',
    'BE': 'Belgium',
    'SE': 'Sweden',
    'NG': 'Nigeria',
    'AR': 'Argentina',
    'NO': 'Norway',
    'AT': 'Austria',
    'AE': 'United Arab Emirates',
    'IL': 'Israel',
    'IE': 'Ireland',
    'PH': 'Philippines',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'HK': 'Hong Kong',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CL': 'Chile',
    'CO': 'Colombia',
    'ZA': 'South Africa',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'EG': 'Egypt',
    'VN': 'Vietnam',
    'TH': 'Thailand',
    'NZ': 'New Zealand',
    'PT': 'Portugal',
    'GR': 'Greece',
    'CZ': 'Czech Republic',
  };
  
  return countries[countryCode] || countryCode;
}
