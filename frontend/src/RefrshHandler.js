"use client"

import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

function RefrshHandler({ setIsAuthenticated, setUserRole }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsAuthenticated(true)
      const role = localStorage.getItem("userRole")
      setUserRole(role)
      if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup") {
        if (role === "admin") {
          navigate("/admin", { replace: false })
        } else {
          navigate("/client", { replace: false })
        }
      }
    }
  }, [location, navigate, setIsAuthenticated, setUserRole])

  return null
}

export default RefrshHandler
