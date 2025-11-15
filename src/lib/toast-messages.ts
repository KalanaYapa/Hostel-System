/**
 * Professional Toast Messages
 * Centralized toast notification messages for consistent UX
 */

import { toast } from "@/app/components/ui/sonner";

export const toastMessages = {
  // Authentication
  auth: {
    loginSuccess: (userType: "admin" | "student", name?: string) =>
      toast.success(
        `Welcome back${name ? `, ${name}` : ""}!`,
        { description: "You have successfully signed in to your account." }
      ),
    loginError: (message?: string) =>
      toast.error(
        "Authentication Failed",
        { description: message || "Invalid credentials. Please check your login details and try again." }
      ),
    logoutSuccess: () =>
      toast.success(
        "Signed Out Successfully",
        { description: "You have been securely logged out of your account." }
      ),
    signupSuccess: () =>
      toast.success(
        "Account Created Successfully",
        { description: "Your account has been created. You can now sign in." }
      ),
    signupError: (message?: string) =>
      toast.error(
        "Registration Failed",
        { description: message || "Unable to create your account. Please try again." }
      ),
    unauthorized: () =>
      toast.error(
        "Access Denied",
        { description: "You do not have permission to access this resource." }
      ),
    sessionExpired: () =>
      toast.error(
        "Session Expired",
        { description: "Your session has expired. Please sign in again." }
      ),
    rateLimited: (timeRemaining?: string) =>
      toast.error(
        "Too Many Attempts",
        { description: timeRemaining ? `Account temporarily locked. Please try again in ${timeRemaining}.` : "Too many failed login attempts. Please try again later." }
      ),
  },

  // Student Management
  students: {
    fetchSuccess: () =>
      toast.success(
        "Students Loaded",
        { description: "Student records have been successfully retrieved." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Students",
        { description: "Unable to retrieve student records. Please refresh the page." }
      ),
    updateSuccess: (studentName?: string) =>
      toast.success(
        "Student Updated",
        { description: studentName ? `${studentName}'s information has been updated successfully.` : "Student information has been updated successfully." }
      ),
    updateError: (message?: string) =>
      toast.error(
        "Update Failed",
        { description: message || "Unable to update student information. Please try again." }
      ),
    deleteSuccess: (studentName?: string) =>
      toast.success(
        "Student Deactivated",
        { description: studentName ? `${studentName}'s account has been deactivated.` : "Student account has been deactivated successfully." }
      ),
    deleteError: () =>
      toast.error(
        "Deactivation Failed",
        { description: "Unable to deactivate the student account. Please try again." }
      ),
    roomAssignSuccess: (studentName: string, room: string) =>
      toast.success(
        "Room Assigned",
        { description: `${studentName} has been assigned to ${room}.` }
      ),
    roomAssignError: (message?: string) =>
      toast.error(
        "Room Assignment Failed",
        { description: message || "Unable to assign room. Please check availability and try again." }
      ),
  },

  // Branch Management
  branches: {
    createSuccess: (branchName: string) =>
      toast.success(
        "Branch Created",
        { description: `${branchName} has been created successfully.` }
      ),
    createError: (message?: string) =>
      toast.error(
        "Branch Creation Failed",
        { description: message || "Unable to create branch. Please try again." }
      ),
    updateSuccess: (branchName?: string) =>
      toast.success(
        "Branch Updated",
        { description: branchName ? `${branchName} has been updated successfully.` : "Branch information has been updated." }
      ),
    updateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update branch information. Please try again." }
      ),
    deleteSuccess: (branchName?: string) =>
      toast.success(
        "Branch Deleted",
        { description: branchName ? `${branchName} has been deleted successfully.` : "Branch has been deleted successfully." }
      ),
    deleteError: (message?: string) =>
      toast.error(
        "Deletion Failed",
        { description: message || "Unable to delete branch. Ensure no students are assigned." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Branches",
        { description: "Unable to retrieve branch information. Please refresh the page." }
      ),
  },

  // Room Management
  rooms: {
    createSuccess: (roomNumber: string) =>
      toast.success(
        "Room Created",
        { description: `Room ${roomNumber} has been created successfully.` }
      ),
    createError: (message?: string) =>
      toast.error(
        "Room Creation Failed",
        { description: message || "Unable to create room. Please try again." }
      ),
    updateSuccess: (roomNumber?: string) =>
      toast.success(
        "Room Updated",
        { description: roomNumber ? `Room ${roomNumber} has been updated successfully.` : "Room information has been updated." }
      ),
    updateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update room information. Please try again." }
      ),
    deleteSuccess: (roomNumber?: string) =>
      toast.success(
        "Room Deleted",
        { description: roomNumber ? `Room ${roomNumber} has been deleted successfully.` : "Room has been deleted successfully." }
      ),
    deleteError: (message?: string) =>
      toast.error(
        "Deletion Failed",
        { description: message || "Unable to delete room. Ensure no students are assigned." }
      ),
    capacityFull: (roomNumber: string) =>
      toast.warning(
        "Room at Full Capacity",
        { description: `Room ${roomNumber} has reached its maximum capacity.` }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Rooms",
        { description: "Unable to retrieve room information. Please refresh the page." }
      ),
  },

  // Maintenance Requests
  maintenance: {
    createSuccess: () =>
      toast.success(
        "Request Submitted",
        { description: "Your maintenance request has been submitted successfully." }
      ),
    createError: () =>
      toast.error(
        "Submission Failed",
        { description: "Unable to submit your maintenance request. Please try again." }
      ),
    updateSuccess: (status: string) =>
      toast.success(
        "Status Updated",
        { description: `Maintenance request has been marked as ${status}.` }
      ),
    updateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update maintenance request status. Please try again." }
      ),
    deleteSuccess: () =>
      toast.success(
        "Request Deleted",
        { description: "Maintenance request has been deleted successfully." }
      ),
    deleteError: () =>
      toast.error(
        "Deletion Failed",
        { description: "Unable to delete maintenance request. Please try again." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Requests",
        { description: "Unable to retrieve maintenance requests. Please refresh the page." }
      ),
  },

  // Food Orders
  food: {
    orderSuccess: () =>
      toast.success(
        "Order Placed Successfully",
        { description: "Your food order has been placed and is being prepared." }
      ),
    orderError: () =>
      toast.error(
        "Order Failed",
        { description: "Unable to place your food order. Please try again." }
      ),
    menuCreateSuccess: (itemName: string) =>
      toast.success(
        "Menu Item Added",
        { description: `${itemName} has been added to the menu.` }
      ),
    menuCreateError: () =>
      toast.error(
        "Failed to Add Item",
        { description: "Unable to add menu item. Please try again." }
      ),
    menuUpdateSuccess: (itemName?: string) =>
      toast.success(
        "Menu Updated",
        { description: itemName ? `${itemName} has been updated successfully.` : "Menu item has been updated." }
      ),
    menuUpdateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update menu item. Please try again." }
      ),
    menuDeleteSuccess: (itemName?: string) =>
      toast.success(
        "Item Removed",
        { description: itemName ? `${itemName} has been removed from the menu.` : "Menu item has been removed." }
      ),
    menuDeleteError: () =>
      toast.error(
        "Deletion Failed",
        { description: "Unable to remove menu item. Please try again." }
      ),
    statusUpdateSuccess: (status: string) =>
      toast.success(
        "Order Status Updated",
        { description: `Order has been marked as ${status}.` }
      ),
    statusUpdateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update order status. Please try again." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Menu",
        { description: "Unable to retrieve menu items. Please refresh the page." }
      ),
  },

  // Late Pass
  latePass: {
    createSuccess: () =>
      toast.success(
        "Late Pass Requested",
        { description: "Your late pass request has been submitted for approval." }
      ),
    createError: (message?: string) =>
      toast.error(
        "Request Failed",
        { description: message || "Unable to submit late pass request. Please try again." }
      ),
    approveSuccess: (studentName?: string) =>
      toast.success(
        "Late Pass Approved",
        { description: studentName ? `Late pass for ${studentName} has been approved.` : "Late pass request has been approved." }
      ),
    rejectSuccess: (studentName?: string) =>
      toast.success(
        "Late Pass Rejected",
        { description: studentName ? `Late pass for ${studentName} has been rejected.` : "Late pass request has been rejected." }
      ),
    updateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update late pass status. Please try again." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Requests",
        { description: "Unable to retrieve late pass requests. Please refresh the page." }
      ),
    downloadSuccess: () =>
      toast.success(
        "PDF Downloaded",
        { description: "Your late pass has been downloaded successfully." }
      ),
    downloadError: () =>
      toast.error(
        "Download Failed",
        { description: "Unable to download late pass. Please try again." }
      ),
  },

  // Attendance
  attendance: {
    markSuccess: () =>
      toast.success(
        "Attendance Recorded",
        { description: "Attendance has been marked successfully." }
      ),
    markError: () =>
      toast.error(
        "Recording Failed",
        { description: "Unable to record attendance. Please try again." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Attendance",
        { description: "Unable to retrieve attendance records. Please refresh the page." }
      ),
  },

  // Fees/Payment
  fees: {
    paymentSuccess: () =>
      toast.success(
        "Payment Successful",
        { description: "Your payment has been processed successfully." }
      ),
    paymentError: () =>
      toast.error(
        "Payment Failed",
        { description: "Unable to process your payment. Please try again." }
      ),
    updateSuccess: (studentName?: string) =>
      toast.success(
        "Fee Status Updated",
        { description: studentName ? `Fee status for ${studentName} has been updated.` : "Fee status has been updated successfully." }
      ),
    updateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update fee status. Please try again." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Fee Records",
        { description: "Unable to retrieve fee information. Please refresh the page." }
      ),
  },

  // Emergency Contacts
  emergency: {
    createSuccess: () =>
      toast.success(
        "Contact Added",
        { description: "Emergency contact has been added successfully." }
      ),
    createError: () =>
      toast.error(
        "Failed to Add Contact",
        { description: "Unable to add emergency contact. Please try again." }
      ),
    updateSuccess: () =>
      toast.success(
        "Contact Updated",
        { description: "Emergency contact information has been updated." }
      ),
    updateError: () =>
      toast.error(
        "Update Failed",
        { description: "Unable to update emergency contact. Please try again." }
      ),
    deleteSuccess: () =>
      toast.success(
        "Contact Deleted",
        { description: "Emergency contact has been removed successfully." }
      ),
    deleteError: () =>
      toast.error(
        "Deletion Failed",
        { description: "Unable to delete emergency contact. Please try again." }
      ),
    fetchError: () =>
      toast.error(
        "Failed to Load Contacts",
        { description: "Unable to retrieve emergency contacts. Please refresh the page." }
      ),
  },

  // General
  general: {
    saveSuccess: () =>
      toast.success(
        "Changes Saved",
        { description: "Your changes have been saved successfully." }
      ),
    saveError: () =>
      toast.error(
        "Save Failed",
        { description: "Unable to save your changes. Please try again." }
      ),
    deleteConfirm: (itemName?: string) =>
      toast.warning(
        "Confirm Deletion",
        { description: itemName ? `Are you sure you want to delete ${itemName}?` : "This action cannot be undone." }
      ),
    copySuccess: () =>
      toast.success(
        "Copied to Clipboard",
        { description: "The information has been copied to your clipboard." }
      ),
    validationError: (message: string) =>
      toast.error(
        "Validation Error",
        { description: message }
      ),
    networkError: () =>
      toast.error(
        "Network Error",
        { description: "Unable to connect to the server. Please check your internet connection." }
      ),
    unexpectedError: () =>
      toast.error(
        "Unexpected Error",
        { description: "An unexpected error occurred. Please try again or contact support." }
      ),
    loading: (message: string) =>
      toast.loading(message),
    dismissAll: () =>
      toast.dismiss(),
  },
};
