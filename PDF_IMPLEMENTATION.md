# Transaction Receipt PDF Implementation

## Overview
This implementation allows users to navigate from the Transaction Details page to a Transaction Receipt page that fetches and displays a PDF receipt from the API.

## Installation Steps

### 1. Install Required Dependencies
Run the following command to install the necessary packages:

```bash
npm install react-native-pdf react-native-blob-util
```

### 2. iOS Setup (if applicable)
Navigate to the iOS folder and install pods:

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup
No additional setup required for Android. The packages will be linked automatically.

## Implementation Details

### Files Modified/Created:

1. **src/Screens/TransactionReceipt.tsx** - Updated to fetch and display PDF
   - Fetches PDF from: `{baseURL}/api/transactions/{transactionId}/receipt/download`
   - Displays PDF using `react-native-pdf` library
   - Shows loading indicator while fetching
   - Error handling with Toast messages

2. **src/Types/Navigation.ts** - Updated navigation types
   - Added `TransactionReceipt` to `AppStackParamList`
   - Passes `transaction` object as navigation parameter

3. **src/Navigations/RootNavigator.tsx** - Already configured
   - Screen is registered as a modal presentation
   - Header is configured with "Transaction Receipt" title

4. **src/Screens/TransactionDetailsScreen.tsx** - Navigation trigger
   - "Print PDF" button navigates to TransactionReceipt
   - Passes the transaction object as parameter

## Usage

From the Transaction Details screen, click the "Print PDF" button. This will:
1. Navigate to the Transaction Receipt screen
2. Construct the PDF URL using the transaction ID
3. Fetch and display the PDF from the endpoint
4. Allow users to view the PDF in-app

## API Endpoint

The component fetches the PDF from:
```
{baseURL}/api/transactions/{transactionId}/receipt/download
```

Where:
- `baseURL` is from `src/helpers/constants.ts`
- `transactionId` is either `transaction.EqUuid` or `transaction.id`

## Error Handling

- Shows loading indicator while fetching
- Displays error toast if PDF fails to load
- Shows "No PDF available" message if PDF URI is empty
- Console logs errors for debugging

## Features

- Full-screen PDF viewer
- Loading indicator
- Back navigation button
- Error handling
- Toast notifications
- Responsive layout

## Dependencies

- `react-native-pdf`: ^6.7.5 (to be installed)
- `react-native-blob-util`: ^0.19.11 (to be installed)

## Notes

- The PDF is cached for better performance
- SSL certificates are validated (`trustAllCerts: false`)
- Supports page navigation within the PDF
- Logs page changes and PDF loading events

