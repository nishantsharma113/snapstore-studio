# KLANet Timesheet Module: Logic & Business Rules Documentation

This document compiles and details all the logical flows, conditions, validation rules, state management, and user interface behaviors embedded in the Timesheet module of the KLANet-Dev Flutter application.

---

## 1. Access Control & Permissions (`PermissionProvider`)

The module uses the `PermissionProvider` to check authorization before allowing users to read, create, or modify timesheets.

- **API Check**: Hits the permission endpoint (`ApiConstants.screenPermission`) passing `doctype: 'Timesheets'`.
- **Read Permission Check**:
  - If `permissions.canRead` is `false`, the screen blocks access, displays an **Access Denied** message, and provides a **Retry** button.
- **Write/Create Permission Check**:
  - The Floating Action Button (FAB) (which scrolls to the Quick-Create form) is visible only if the user has write or create permissions (`permissions.canWrite || permissions.canCreate`) and the keyboard is not open.

---

## 2. Calendar View Logic (`TimesheetCalendarScreen`)

The calendar acts as the dashboard for timesheet records, showing daily status indicators.

### 2.1 Date Boundaries & Navigation

- **Future Dates Restriction**: Users cannot view or navigate to dates in the future. Tapping any cell where `date.isAfter(DateTime.now())` blocks navigation and displays a SnackBar: _"You cannot navigate to a future date."_
- **Month Navigation**: Users can browse months using previous/next arrow icons or by opening a Month-Year Picker. The forward arrow is hidden if the selected month is the current month (preventing navigation to future months).

### 2.2 Calendar Cell Rendering & Status Legend

- **Data Fetching**: When loading a month, `fetchCalendarData` is invoked for the range `firstDayOfMonth` to `lastDayOfMonth`.
- **Dynamic Colors**: Cell colors are fetched from the database via `StatusColorProvider` based on status color mapping entries.
- **Legends**: Lists all statuses returned by the calendar API, showing a colored dot with a badge count indicating the number of days having that status (e.g., "Charged", "Completed"). The "Current Date" legend does not show a count badge.
- **No-Time Border**: If a day has no status or is marked "No Time", it is rendered with a grey border (`Colors.grey.shade300`) and a white background.

---

## 3. Timesheet Screen Layout & Day Strip (`TimesheetScreen`)

The detailed view shows a daily list of entries, summary calculations, and the Quick-Create form.

### 3.1 30-Day Strip Window

- **Visibility**: The day strip is only visible when:
  1. No metadata filter is active (i.e. Client, Matter, or Status filters are empty).
  2. The current range is a single day (i.e., `startDate` is the same as `endDate`).
- **Strip Content**: Renders a sliding list of 30 days ending at the selected date.
- **Selection Highlighting**: Selecting a day puts a black border around the cell. Colors are determined by matching the date against `provider.dateStatusMap`.
- **Calendar Icon Picker**: Allows users to select any past date, which shifts the 30-day window anchor.

### 3.2 Time Summary Bar

- Computes and displays sum totals for the active list:
  $$\text{Total Time} = \sum (\text{item.totalTime})$$
  $$\text{Billable Time} = \sum (\text{item.billableTime})$$
  $$\text{Non-Billable Time} = \text{Total Time} - \text{Billable Time}$$
- Times are parsed from `"HH:mm"` string formats, summed in minutes, and formatted back to `"HH:mm"`.

---

## 4. Filtering Logic (`TimesheetFilterScreen`)

The filtering engine lets users filter timesheets by clients, matters, statuses, or date periods.

### 4.1 Filter Tabs

- **Client Name**: Shows client list.
- **Matter Code**: Displays matters. Selecting one or more client names in the "Client Name" tab automatically filters the matters shown under "Matter Code" to only those belonging to the selected clients.
- **Status**: Static options: `To be Charged`, `Charged`, `Partially Completed`, and `Completed`.

### 4.2 Dynamic Search & Pagination

- Searches are debounced by **500ms** to prevent redundant API queries.
- Matters are paginated in chunks of 20 (`_limit = 20`). Scrolling near the bottom triggers subsequent page loads (`_fetchMatters`).

### 4.3 Default Selection Behavior

- If the user selects client, matter, or status filters, but leaves the date period empty or set to 'Select Period', the screen automatically forces the date range filter to **Today** upon applying.

### 4.4 Date Period Calculations (`TimesheetService`)

The period dropdown translates labels into specific dates:

- **Today / Yesterday**: Calculates relative to current day.
- **This Week**: Calculates Monday to Today.
- **This Month**: Start of the current month to Today.
- **This Month And Last Month**: Start of the previous month to Today.
- **This Calendar Year**: January 1 to December 31.
- **This Financial Year**: April 1 (current or previous year depending on current month) to March 31 of the next year.
- **Quarters (Q1-Q4)**: Maps standard financial quarters starting from April.
- **Last Week**: Monday of previous week to Sunday of previous week.
- **Last Month**: Day 1 of previous month to the last day of previous month.
- **Last To Last Month**: Entire month of (current - 2).
- **Last Three/Six/Twelve Months**: Dynamic ranges going backwards from today.
- **Last Financial Year**: April 1 of previous FY to March 31 of current FY.

---

## 5. CRUD and Validation Logic (`TimesheetProvider` & `TimesheetService`)

### 5.1 Validation Rules (Enforced on Create, Edit, & Quick-Create)

1. **Billable vs. Total Time**:
   - _Rule_: Billable time cannot exceed total time.
   - _Trigger_: Handled in service validations (`billableDec > totalDec`) throwing an exception, and in the UI validation which shows a SnackBar warning.
2. **24-Hour Limits**:
   - _Single Entry Rule_: An individual entry cannot exceed 24 hours.
   - _Daily Cumulative Rule_: The sum of all timesheets for a given day (including the active entry's new value) cannot exceed 24 hours.
   - _Check_:
     $$\sum_{i \neq \text{current}} \text{totalTime}_i + \text{newTotalTime} \le 24.0 \text{ hours}$$
3. **Description Requirement**:
   - _Rule_: Description is mandatory. Saving or updating an entry with an empty or whitespace-only description is blocked, reverting the text field to its original state and prompting a SnackBar notification.
4. **Matter Billability Constraints**:
   - _Rule_: Billable time is tied directly to the matter's category.
   - _Logic_:
     - If the selected Matter has `timeEntryType != 'Billable'`, the billable time is forced to `"00:00"` and cannot be adjusted (input is disabled).
     - If the matter is billable, changing the total time automatically sets the billable time to match the total time.

### 5.2 CRUD Actions and State Mutations

- **Pagination (Timesheet List)**:
  - Renders pagination selectors (20, 50, 100). Sets state, clears offset, and loads fresh pages.
  - Uses a "Load More" mechanism that appends records sequentially.
- **Optimistic Deletion**:
  - When a user confirms deletion, the item is immediately removed from the local state list.
  - If the API delete request (`deleteTimesheetItem`) fails, the provider inserts the deleted item back into its original index in the list and triggers a rebuild.
- **Optimistic Update**:
  - Updates the item locally and fires notification listeners.
  - Compares changes between `updated` and `original`. The service computes the diff and sends only the modified fields in the payload, except for display time fields which are always calculated and sent.
  - Reverts the list item back to `original` if the network update fails.
- **Editability Restriction**:
  - _Rule_: An entry can only be updated or deleted if its status is **"To Be Charged"**. All form inputs and swipe-to-delete behaviors are locked for other statuses.

---

## 6. Auto-Save & Navigation Blocks (`TimesheetScreen`)

To prevent users from losing work when using the inline Quick-Create form, the application implements auto-save and navigation safeguards.

### 6.1 Auto-Save Trigger

- **Condition**: If all three crucial values are configured (**Date**, **Matter**, and **Total Time**) and a non-empty **Description** is typed, typing triggers a debounced **2-second auto-save timer**.
- **Action**: Once the timer completes, it calls `_checkAndCreate()` to save the timesheet to the server without requiring a manual click of a save button.

### 6.2 Navigation Interception (`_handleOptionTap`)

When tapping filter buttons, date selectors, or navigating away:

- **Scenario A (Missing Description)**: If a matter and total time are selected, but the description is empty:
  - Shows a dialog: _"Please enter description in timesheet or clear your timesheet."_
  - Option _Clear Timesheet_: Resets the Quick-Create state, unfocuses keyboards, and lets the user proceed.
  - Option _Continue_: Retains inputs, closes dialog, and blocks the navigation action (user remains on the current view).
- **Scenario B (Completed Draft)**: If a matter, total time, and description are all filled in but not yet saved:
  - Triggers an immediate explicit save.
  - If the save succeeds, it clears the draft and allows the navigation to proceed. If it fails, the navigation is blocked.

---

## 7. AI-Powered Suggestions Logic

For description entry fields in both cards and the Quick-Create tile:

- **Trigger Condition**: When the user enters text in the description field, it calculates the word count. If the word count is **$\ge$ 5 words**, it displays an AI suggestion icon button.
- **Debounced Fetch**: Typing triggers a **1-second debounce** timer. Once typing pauses for 1 second, it fetches suggestions via `getAISuggestions`.
- **Word Count Restriction**: If the description text drops below 5 words, the suggestions array is cleared, and the icon is hidden.
- **Suggestions Dialog**: Clicking the AI suggestion icon opens a dialog showing the suggestions. Tapping a suggestion inserts it as the description and submits the update. It also provides a **Refresh** button inside the dialog to re-query the suggestions endpoint.
