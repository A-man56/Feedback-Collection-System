const isDevelopment = process.env.NODE_ENV === "development"

const config = {
  API_URL: isDevelopment
    ? "http://localhost:8080"
    : process.env.REACT_APP_API_URL || "https://feedback-collection-system-alpha.vercel.app/",
}

console.log("Environment:", process.env.NODE_ENV)
console.log("API URL:", config.API_URL)
console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL)

export default config
