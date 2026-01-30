const dns = require("dns").promises;

async function hasValidMX(domain) {
  try {
    const records = await dns.resolveMx(domain);
    console.log("MX records:", records);
    return Array.isArray(records) && records.length > 0;
  } catch (error) {
    return false;
  }
}

function extractDomain(email) {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1].toLowerCase().trim();
}

async function validateEmailDomain(email) {
  const domain = await extractDomain(email);
  if (!domain) return false;

  return await hasValidMX(domain);
}

module.exports = { validateEmailDomain };
