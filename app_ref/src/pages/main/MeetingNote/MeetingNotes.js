"use client"

import { useState } from "react"
import ReportsList from "../../../components/ReportsList"
import useAuth from "../../../hooks/useAuth"
import { Box } from "@mui/material"

export default function MeetingNotes() {
  const { currentCompany, userInfo } = useAuth()
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false)

  const handleReportSelected = (report) => {
    console.log("Selected report:", report)
    // Handle report selection - you can add more logic here
  }

  return (
    <Box style={{ minHeight: "100vh" }}>
      <ReportsList
        userInfo={userInfo}
        currentCompany={currentCompany}
        onReportSelected={handleReportSelected}
        setIsNotesSidebarOpen={setIsNotesSidebarOpen}
      />
    </Box>
  )
}
