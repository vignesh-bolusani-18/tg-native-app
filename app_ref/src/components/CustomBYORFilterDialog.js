"use client"

import * as React from "react"
import { styled } from "@mui/material/styles"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { Stack, Grid, DialogActions, Box, Switch, Paper, Chip } from "@mui/material"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete"
import CustomButton from "./CustomButton"
import useDashboard from "../hooks/useDashboard"
import { useEffect } from "react"
import PushPinIcon from "@mui/icons-material/PushPin"
import { SUCCESS } from "../theme/custmizations/colors"
import { format, parseISO } from "date-fns"
import { uploadJsonToS3 } from "../utils/s3Utils"
import store from "../redux/store"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}))

const ColumnSection = styled(Paper)(({ theme, isDraggingOver }) => ({
  padding: theme.spacing(2),
  paddingRight: 0,
  height: 400,
  backgroundColor: "#FFFFFF",
  border: `1px solid ${isDraggingOver ? theme.palette.primary.main : "#EAECF0"}`,
  borderRadius: "8px",
  transition: "all 0.2s ease",
  overflow: "hidden",
  position: "relative",
  width: "100%",
}))

const SCROLL_SPEED = 10
const SCROLL_THRESHOLD = 50

const ListContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "100%",
  height: "100%",
  padding: "4px",
  paddingRight: "16px",
  overflowY: "scroll",
  "&::-webkit-scrollbar": {
    width: "6px",
    display: "block",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "3px",
    marginTop: "4px",
    marginBottom: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "3px",
    "&:hover": {
      background: "#555",
    },
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#888 #f1f1f1",
})

const DraggableRow = styled("div")(({ theme, isDragging, isFrozen, isSelected }) => ({
  padding: "12px 16px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  backgroundColor: isSelected ? "#E3F2FD" : "#FFFFFF",
  border: "1px solid",
  borderColor: isSelected ? theme.palette.primary.main : theme.palette.grey[200],
  borderRadius: "4px",
  color: theme.palette.text.primary,
  fontSize: "0.875rem",
  transition: "all 0.2s ease",
  cursor: "grab",
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  boxShadow: isDragging
    ? "0 8px 16px rgba(0, 0, 0, 0.1)"
    : isFrozen
      ? "inset -2px 0 0 #E0E0E0, 2px 0 4px -2px rgba(0, 0, 0, 0.1)"
      : isSelected
        ? "0 2px 4px rgba(25, 118, 210, 0.15)"
        : "0 1px 2px rgba(0, 0, 0, 0.05)",
  transform: isDragging ? "translateY(-2px)" : "none",
  "&:hover": {
    boxShadow: isSelected ? "0 4px 8px rgba(25, 118, 210, 0.2)" : "0 4px 8px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-1px)",
  },
  "& .content": {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  "& .actions": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
}))

const formatKey = (key) => {
  const dateRegex = /\d{4}-\d{2}-\d{2}/

  // Find any date pattern in the key
  const dateMatch = key.match(dateRegex)

  if (dateMatch) {
    const date = dateMatch[0]
    const formattedDate = format(parseISO(date), "MMM dd, yyyy")
    // Replace the date pattern with formatted date while keeping rest of the key
    return key
      .replace(date, formattedDate)
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
  }

  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
}

const DroppableContent = React.memo(
  ({
    provided,
    snapshot,
    columns,
    frozenColumns,
    handleFreezeColumn,
    listType,
    selectedItems,
    handleItemClick,
    handleItemMove,
  }) => {
    const containerRef = React.useRef(null)

    React.useEffect(() => {
      if (snapshot.isDraggingOver) {
        const container = containerRef.current
        if (!container) return

        const handleDragScroll = (e) => {
          const containerRect = container.getBoundingClientRect()
          const mouseY = e.clientY

          // Calculate distances from top and bottom edges
          const topDelta = mouseY - containerRect.top
          const bottomDelta = containerRect.bottom - mouseY

          // Scroll if within threshold
          if (topDelta < SCROLL_THRESHOLD) {
            // Scroll up
            container.scrollBy(0, -SCROLL_SPEED)
          } else if (bottomDelta < SCROLL_THRESHOLD) {
            // Scroll down
            container.scrollBy(0, SCROLL_SPEED)
          }
        }

        document.addEventListener("mousemove", handleDragScroll)
        return () => document.removeEventListener("mousemove", handleDragScroll)
      }
    }, [snapshot.isDraggingOver])

    return (
      <ColumnSection ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
        <ListContainer
          {...provided.droppableProps}
          ref={(el) => {
            containerRef.current = el
            provided.innerRef(el)
          }}
        >
          {columns.map((column, index) => (
            <Draggable key={column} draggableId={column} index={index}>
              {(provided, snapshot) => (
                <DraggableRow
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  isDragging={snapshot.isDragging}
                  isFrozen={frozenColumns.includes(column)}
                  isSelected={selectedItems.includes(column)}
                  onClick={(e) => handleItemClick(column, index, e)}
                >
                  <div className="content" {...provided.dragHandleProps}>
                    {listType === "selected" && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFreezeColumn(column, index)
                        }}
                        size="small"
                        disabled={!frozenColumns.includes(column) && index !== frozenColumns.length}
                        sx={{
                          visibility: index > frozenColumns.length ? "hidden" : "visible",
                        }}
                      >
                        <PushPinIcon
                          sx={{
                            fontSize: "20px",
                            color: frozenColumns.includes(column) ? SUCCESS[700] : "#66708550",
                            transform: "rotate(45deg)",
                          }}
                        />
                      </IconButton>
                    )}
                    <span>{formatKey(column)}</span>
                  </div>
                  <div className="actions">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleItemMove(column, listType)
                      }}
                      sx={{
                        color: listType === "available" ? "#4CAF50" : "#f44336",
                        "&:hover": {
                          backgroundColor: listType === "available" ? "#E8F5E8" : "#FFEBEE",
                        },
                      }}
                    >
                      {listType === "available" ? <AddIcon fontSize="small" /> : <RemoveIcon fontSize="small" />}
                    </IconButton>
                    <span className="drag-handle">⋮⋮</span>
                  </div>
                </DraggableRow>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ListContainer>
      </ColumnSection>
    )
  },
)

export default function CustomBYORFilterDialog({ open, handleClose, reportName }) {
  const {
    filterOptions,
    BYORData,
    updateBYORFilterData,
    saveBYORConfig,
    BYORConfig,
    clearBYORData,
    experimentBasePath,
  } = useDashboard()

  const { byorFilterData } = BYORData
  const [availableColumns, setAvailableColumns] = React.useState([])
  const [selectedAvailableItems, setSelectedAvailableItems] = React.useState([])
  const [selectedSelectedItems, setSelectedSelectedItems] = React.useState([])
  const [lastClickedIndex, setLastClickedIndex] = React.useState({ available: -1, selected: -1 })
  const config = BYORConfig[reportName]

  useEffect(() => {
    if (filterOptions.columns) {
      // Initialize with all columns selected by default if columnsFilter is empty
      if (!byorFilterData.columnsFilter || byorFilterData.columnsFilter.length === 0) {
        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: filterOptions.columns,
          selectAllColumns: true,
          frozenColumns: [], // Initialize frozen columns
        })
        setAvailableColumns([])
      } else {
        // Update available columns based on current selection
        const selected = byorFilterData.columnsFilter || []
        const available = filterOptions.columns.filter((col) => !selected.includes(col))
        setAvailableColumns(available)

        // Update selectAllColumns based on whether all columns are selected
        const allSelected = available.length === 0 && selected.length === filterOptions.columns.length
        if (byorFilterData.selectAllColumns !== allSelected) {
          updateBYORFilterData({
            ...byorFilterData,
            selectAllColumns: allSelected,
            frozenColumns: byorFilterData.frozenColumns || [], // Ensure frozen columns exist
          })
        }
      }
    }
  }, [filterOptions.columns, byorFilterData])

  // Clear selections when columns change
  useEffect(() => {
    setSelectedAvailableItems([])
    setSelectedSelectedItems([])
  }, [availableColumns, byorFilterData])

  const handleItemClick = (column, index, event, listType) => {
    const isAvailable = listType === "available"
    const currentSelected = isAvailable ? selectedAvailableItems : selectedSelectedItems
    const setCurrentSelected = isAvailable ? setSelectedAvailableItems : setSelectedSelectedItems
    const currentList = isAvailable ? availableColumns : byorFilterData.columnsFilter || []
    const lastIndex = isAvailable ? lastClickedIndex.available : lastClickedIndex.selected

    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd click - toggle individual item
      if (currentSelected.includes(column)) {
        setCurrentSelected(currentSelected.filter((item) => item !== column))
      } else {
        setCurrentSelected([...currentSelected, column])
      }
    } else if (event.shiftKey && lastIndex !== -1) {
      // Shift click - select range
      const start = Math.min(lastIndex, index)
      const end = Math.max(lastIndex, index)
      const rangeItems = currentList.slice(start, end + 1)

      // Combine with existing selection
      const newSelection = [...new Set([...currentSelected, ...rangeItems])]
      setCurrentSelected(newSelection)
    } else {
      // Regular click - select single item
      setCurrentSelected([column])
    }

    // Update last clicked index
    setLastClickedIndex({
      ...lastClickedIndex,
      [isAvailable ? "available" : "selected"]: index,
    })
  }

  const handleItemMove = (column, fromList) => {
    const isFromAvailable = fromList === "available"
    const itemsToMove = isFromAvailable
      ? selectedAvailableItems.length > 0 && selectedAvailableItems.includes(column)
        ? selectedAvailableItems
        : [column]
      : selectedSelectedItems.length > 0 && selectedSelectedItems.includes(column)
        ? selectedSelectedItems
        : [column]

    if (isFromAvailable) {
      // Move from available to selected (at the end)
      const newAvailable = availableColumns.filter((col) => !itemsToMove.includes(col))
      const newSelected = [...(byorFilterData.columnsFilter || []), ...itemsToMove]

      setAvailableColumns(newAvailable)
      updateBYORFilterData({
        ...byorFilterData,
        columnsFilter: newSelected,
        selectAllColumns: newAvailable.length === 0,
      })
      setSelectedAvailableItems([])
    } else {
      // Move from selected to available (at the end)
      const newSelected = (byorFilterData.columnsFilter || []).filter((col) => !itemsToMove.includes(col))
      const newAvailable = [...availableColumns, ...itemsToMove]
      const newFrozenColumns = (byorFilterData.frozenColumns || []).filter((col) => !itemsToMove.includes(col))

      setAvailableColumns(newAvailable)
      updateBYORFilterData({
        ...byorFilterData,
        columnsFilter: newSelected,
        frozenColumns: newFrozenColumns,
        selectAllColumns: false,
      })
      setSelectedSelectedItems([])
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceList = source.droppableId
    const destList = destination.droppableId

    // Get current columns
    const currentColumns = [...(byorFilterData.columnsFilter || [])]
    const currentFrozen = [...(byorFilterData.frozenColumns || [])]
    const currentAvailable = [...availableColumns]

    // Get the dragged item
    const draggedItem = sourceList === "available" ? currentAvailable[source.index] : currentColumns[source.index]

    // Check if we're dragging multiple selected items
    const isMultipleDrag =
      sourceList === "available"
        ? selectedAvailableItems.includes(draggedItem) && selectedAvailableItems.length > 1
        : selectedSelectedItems.includes(draggedItem) && selectedSelectedItems.length > 1

    if (isMultipleDrag) {
      // Handle multiple item drag
      const itemsToMove = sourceList === "available" ? selectedAvailableItems : selectedSelectedItems

      if (sourceList === "available" && destList === "selected") {
        // Moving multiple from available to selected
        const remainingAvailable = currentAvailable.filter((col) => !itemsToMove.includes(col))
        const newSelected = [...currentColumns]

        // Insert items at destination index
        newSelected.splice(destination.index, 0, ...itemsToMove)

        // Handle frozen columns for multiple items
        let newFrozenColumns = [...currentFrozen]

        // Check if items are dropped in the frozen area
        if (destination.index <= currentFrozen.length && currentFrozen.length > 0) {
          // Add all moved items to frozen columns
          newFrozenColumns = [...currentFrozen, ...itemsToMove]
        }

        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: newSelected,
          frozenColumns: newFrozenColumns,
          selectAllColumns: remainingAvailable.length === 0,
        })
        setAvailableColumns(remainingAvailable)
        setSelectedAvailableItems([])
      } else if (sourceList === "selected" && destList === "available") {
        // Moving multiple from selected to available
        const remainingSelected = currentColumns.filter((col) => !itemsToMove.includes(col))
        const newAvailable = [...currentAvailable]
        const newFrozenColumns = currentFrozen.filter((col) => !itemsToMove.includes(col))

        // Insert items at destination index
        newAvailable.splice(destination.index, 0, ...itemsToMove)

        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: remainingSelected,
          frozenColumns: newFrozenColumns,
          selectAllColumns: false,
        })
        setAvailableColumns(newAvailable)
        setSelectedSelectedItems([])
      } else if (sourceList === "selected" && destList === "selected") {
        // Reordering multiple items within selected
        const remainingColumns = currentColumns.filter((col) => !itemsToMove.includes(col))
        remainingColumns.splice(destination.index, 0, ...itemsToMove)

        // Handle frozen columns for multiple items - simplified approach
        let newFrozenColumns = [...currentFrozen]

        // Remove all moved items from frozen columns first
        newFrozenColumns = newFrozenColumns.filter((col) => !itemsToMove.includes(col))

        // If items are dropped within the frozen area, add them to frozen columns
        if (destination.index <= newFrozenColumns.length) {
          // Add all moved items to frozen columns at the destination index
          newFrozenColumns.splice(destination.index, 0, ...itemsToMove)
        }

        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: remainingColumns,
          frozenColumns: newFrozenColumns,
        })
        setSelectedSelectedItems([])
      }
    } else {
      // Handle single item drag (existing logic)
      if (sourceList === "available" && destList === "selected") {
        // Moving from available to selected
        const [removed] = currentAvailable.splice(source.index, 1)
        currentColumns.splice(destination.index, 0, removed)

        // Only pin if dropped exactly at the end of frozen columns
        if (destination.index <= currentFrozen.length && currentFrozen.length > 0) {
          currentFrozen.push(removed)
        }

        // Check if all columns are now selected
        const allSelected = currentAvailable.length === 0

        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: currentColumns,
          frozenColumns: currentFrozen,
          selectAllColumns: allSelected,
        })
        setAvailableColumns(currentAvailable)
      } else if (sourceList === "selected" && destList === "selected") {
        // Reordering within selected
        const [removed] = currentColumns.splice(source.index, 1)
        currentColumns.splice(destination.index, 0, removed)

        // Handle frozen columns reordering
        if (source.index < currentFrozen.length || destination.index < currentFrozen.length) {
          if (currentFrozen.includes(removed)) {
            // Remove from old position
            currentFrozen.splice(currentFrozen.indexOf(removed), 1)
          }

          // Add to new position if dropped in frozen area
          if (destination.index <= currentFrozen.length) {
            currentFrozen.splice(destination.index, 0, removed)
          }
        }

        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: currentColumns,
          frozenColumns: currentFrozen,
        })
      } else if (sourceList === "selected" && destList === "available") {
        // Moving from selected to available
        const [removed] = currentColumns.splice(source.index, 1)
        currentAvailable.splice(destination.index, 0, removed)

        // Remove from frozen columns if it was frozen
        const newFrozenColumns = currentFrozen.filter((col) => col !== removed)

        // Moving any column to available means selectAllColumns should be false
        updateBYORFilterData({
          ...byorFilterData,
          columnsFilter: currentColumns,
          frozenColumns: newFrozenColumns,
          selectAllColumns: false,
        })
        setAvailableColumns(currentAvailable)
      }
    }
  }

  const handleSelectAll = (event) => {
    const isSelected = event.target.checked

    if (isSelected) {
      // When selecting all, add all available columns to the existing columnsFilter
      const allColumns = [...(byorFilterData.columnsFilter || []), ...availableColumns]
      updateBYORFilterData({
        ...byorFilterData,
        selectAllColumns: true,
        columnsFilter: allColumns,
        frozenColumns: byorFilterData.frozenColumns || [], // Keep existing frozen columns
      })
      setAvailableColumns([])
    } else {
      // When deselecting, move all columns to available
      const allColumns = [...(byorFilterData.columnsFilter || [])]
      setAvailableColumns(allColumns)
      updateBYORFilterData({
        ...byorFilterData,
        selectAllColumns: false,
        columnsFilter: [],
        frozenColumns: [], // Clear frozen columns when deselecting all
      })
    }
  }

  const handleFreezeColumn = (column, index) => {
    const currentFrozen = byorFilterData.frozenColumns || []
    const isAlreadyFrozen = currentFrozen.includes(column)

    let newFrozenColumns

    if (isAlreadyFrozen) {
      newFrozenColumns = currentFrozen.slice(0, currentFrozen.indexOf(column))
    } else {
      if (index === currentFrozen.length) {
        newFrozenColumns = [...currentFrozen, column]
      } else {
        return
      }
    }

    // Update frozen columns in byorFilterData
    updateBYORFilterData({
      ...byorFilterData,
      frozenColumns: newFrozenColumns,
    })
  }

  const changables = ["Cluster", "Forecast_Granularity"]
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" }

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension]
    }
    return dimension
  }

  const handleApply = async () => {
    await saveBYORConfig(reportName, {
      ...BYORData,
      filterData: null,
      sortingData: null,
      fileName: config.fileName,
      title: config.title,
      filePath: config.filePath,
    })

    const updatedBYORConfig = store.getState().dashboard.BYORConfig
    console.log("updatedConfig " + updatedBYORConfig)

    await uploadJsonToS3(`${experimentBasePath}/custom_report/BYORDataConfig.json`, updatedBYORConfig)

    clearBYORData()
    handleClose()
  }

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6">BYOR Filters</Typography>
        <IconButton aria-label="close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          padding: "24px 32px !important",
        }}
      >
        <Stack spacing={3}>
          {/* Dimension Filters Section */}
          {Object.keys(filterOptions.dimensions || {}).length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Dimension Filters
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(filterOptions.dimensions).map(
                  (dimension) =>
                    dimension !== "all" && (
                      <Grid item md={6} xs={12} key={dimension}>
                        <CustomAutocomplete
                          label={dimension}
                          showLabel
                          isMultiSelect
                          selectedValues={byorFilterData.dimensionFilters?.[dimension] || []}
                          setSelectedValues={(newValue) => {
                            const updatedDimensionFilters = {
                              ...byorFilterData.dimensionFilters,
                              [dimension]: newValue,
                            }
                            updateBYORFilterData({
                              ...byorFilterData,
                              dimensionFilters: updatedDimensionFilters,
                            })
                          }}
                          values={filterOptions.dimensions[dimension]}
                          placeholder={`Select filters for ${dimension}...`}
                        />
                      </Grid>
                    ),
                )}
              </Grid>
            </Box>
          )}

          {/* Column Filters Section */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">Column Filters</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>Select All</Typography>
                <Switch checked={byorFilterData?.selectAllColumns || false} onChange={handleSelectAll} />
              </Stack>
            </Stack>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Columns ({availableColumns.length})
                    {selectedAvailableItems.length > 0 && (
                      <Chip
                        size="small"
                        label={`${selectedAvailableItems.length} selected`}
                        sx={{ ml: 1, fontSize: "0.75rem" }}
                      />
                    )}
                  </Typography>
                  <Droppable droppableId="available">
                    {(provided, snapshot) => (
                      <DroppableContent
                        provided={provided}
                        snapshot={snapshot}
                        columns={availableColumns}
                        frozenColumns={byorFilterData.frozenColumns || []}
                        handleFreezeColumn={handleFreezeColumn}
                        listType="available"
                        selectedItems={selectedAvailableItems}
                        handleItemClick={(column, index, e) => handleItemClick(column, index, e, "available")}
                        handleItemMove={handleItemMove}
                      />
                    )}
                  </Droppable>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Columns ({byorFilterData.columnsFilter?.length || 0})
                    {selectedSelectedItems.length > 0 && (
                      <Chip
                        size="small"
                        label={`${selectedSelectedItems.length} selected`}
                        sx={{ ml: 1, fontSize: "0.75rem" }}
                      />
                    )}
                  </Typography>
                  <Droppable droppableId="selected" direction="vertical">
                    {(provided, snapshot) => (
                      <DroppableContent
                        provided={provided}
                        snapshot={snapshot}
                        columns={byorFilterData.columnsFilter || []}
                        frozenColumns={byorFilterData.frozenColumns || []}
                        handleFreezeColumn={handleFreezeColumn}
                        listType="selected"
                        selectedItems={selectedSelectedItems}
                        handleItemClick={(column, index, e) => handleItemClick(column, index, e, "selected")}
                        handleItemMove={handleItemMove}
                      />
                    )}
                  </Droppable>
                </Box>
              </Box>
            </DragDropContext>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <CustomButton
          title="Apply Filter"
          onClick={handleApply}
          disabled={
            (!byorFilterData.columnsFilter || byorFilterData.columnsFilter?.length === 0) &&
            !byorFilterData?.selectAllColumns
          }
        />
      </DialogActions>
    </BootstrapDialog>
  )
}
