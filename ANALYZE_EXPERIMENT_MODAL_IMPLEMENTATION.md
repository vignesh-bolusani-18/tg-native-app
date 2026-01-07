# Analyze Experiment Modal Implementation

## Changes Overview

Converted the "Analyze experiment" from an **inline dropdown** to a **modal popup** (matching the @ button behavior) per Figma design 3968:1305-1307.

## What Changed

### Before (Inline Dropdown)
- Used `ExperimentDropdown` component that expanded inline
- Experiments list shown directly below the button in the same container
- @ and pin icons hidden when dropdown expanded
- Always visible regardless of selection state

### After (Modal Popup)
- Uses `ExperimentSelector` modal (same as @ button)
- Experiments open in a full-screen modal overlay
- @ and pin icons always visible
- Button **disappears** when experiment is selected
- Selected experiment shown in blue card with tags (matching Figma 3968:1360)

## Implementation Details

### 1. ChatPage.js Changes

#### Removed
- `ExperimentDropdown` component import
- `experimentDropdownExpanded` state
- Inline dropdown rendering

#### Added
- `ExperimentSelector` modal import
- `showExperimentModal` state for controlling modal visibility
- Conditional rendering:
  - **Button** (when no experiment selected): Blue #008AE5 button with lightbulb icon, "Analyze experiment" text, expand-more chevron
  - **Selected Card** (when experiment selected): Blue card showing experiment name, module tag (#F0F9FF bg), region tag (#FFF5DB bg), edit/close buttons

### 2. InputSection.js Changes

#### Removed
- `hideExperimentDatasetIcons` prop (no longer needed)

### 3. LandingInputSection.js Changes

#### Removed
- `hideExperimentDatasetIcons` parameter
- Conditional wrapping around @ and pin buttons
- Icons are now **always visible**

## Design Specifications (Figma 3968:1305-1360)

### Analyze Experiment Button (Default State)
- **Background**: #008AE5
- **Border Radius**: 12px
- **Padding**: 16px horizontal, 8px vertical
- **Icon**: lightbulb (14px, white)
- **Text**: "Analyze experiment" (Inter Display, 15px Medium, white)
- **Chevron**: expand-more (14px, white)
- **Shadow**: 0px 8px 20px rgba(51,51,51,0.15)

### Selected Experiment Card
- **Background**: #008AE5
- **Padding**: 16px horizontal, 12px vertical
- **Header**:
  - Lightbulb icon (14px, white)
  - Experiment name (Inter Display, 13px SemiBold, white)
  - Edit icon (14px, white)
  - Close icon (16px, white)
- **Tags**:
  - Module tag: #F0F9FF background, #006BB2 text (Geist Mono, 11px Medium)
  - Region tag: #FFF5DB background, #8F6900 text (Geist Mono, 11px Medium)

## User Flow

1. User clicks "Analyze experiment" button
2. Modal opens with experiment list (same as @ button modal)
3. User searches and selects an experiment
4. Modal closes
5. Button **disappears**, replaced by selected experiment card
6. User can click **edit** to reopen modal and change selection
7. User can click **close** to clear selection and show button again

## Benefits

✅ Consistent with @ button (experiment) and pin button (dataset) UX
✅ More space for experiment list in modal view
✅ Cleaner interface - button disappears when not needed
✅ Matches Figma design states exactly
✅ Better mobile experience with full-screen modal
✅ @ and pin icons always accessible
