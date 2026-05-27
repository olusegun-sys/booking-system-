import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { showSuccess, showError } from "./toast";
import API_BASE from "./config";

function BookingsManager({
  businessId,
  bookings: initialBookings,
  onBookingsUpdate,
}) {
  const [bookings, setBookings] = useState(initialBookings || []);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDesktop, setIsDesktop] = useState(true);

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (initialBookings) {
      setBookings(initialBookings);
    }
  }, [initialBookings]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer_name?.toLowerCase().includes(term) ||
          b.booking_reference?.toLowerCase().includes(term) ||
          b.customer_email?.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const fetchBookings = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/businesses/${businessId}/bookings`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      );
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
        if (onBookingsUpdate) onBookingsUpdate();
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      showError("Failed to load bookings");
    }
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ status }),
        },
      );
      const data = await response.json();
      if (data.success) {
        showSuccess(
          `Booking ${status === "confirmed" ? "confirmed" : "cancelled"}`,
        );
        fetchBookings();
        setShowModal(false);
      } else {
        showError(data.error || "Failed to update booking");
      }
    } catch (err) {
      showError("Something went wrong");
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === "confirmed") {
      return {
        color: "#10b981",
        bg: "#d1fae5",
        text: "Confirmed",
        icon: CheckCircle,
      };
    } else if (status === "pending") {
      return { color: "#f59e0b", bg: "#fef3c7", text: "Pending", icon: Clock };
    } else if (status === "cancelled") {
      return {
        color: "#ef4444",
        bg: "#fee2e2",
        text: "Cancelled",
        icon: XCircle,
      };
    } else {
      return { color: "#64748b", bg: "#f1f5f9", text: status, icon: Clock };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return "₦" + (amount || 0).toLocaleString();
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  const containerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  };

  const refreshButtonStyle = {
    padding: "10px 20px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: isDesktop ? "repeat(5, 1fr)" : "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "32px",
  };

  const statCardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #eef2ff",
  };

  const statNumberStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  };

  const statLabelStyle = {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  };

  const filterBarStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  };

  const searchInputStyle = {
    flex: 1,
    padding: "10px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    outline: "none",
    minWidth: "200px",
  };

  const filterSelectStyle = {
    padding: "10px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    background: "white",
    cursor: "pointer",
  };

  const tableStyle = {
    background: "white",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  };

  const tableHeaderStyle = {
    display: "grid",
    gridTemplateColumns: isDesktop ? "1.5fr 1.5fr 1fr 1fr 1fr 1fr" : "1fr",
    background: "#f8fafc",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "600",
    fontSize: "13px",
    color: "#64748b",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalContentStyle = {
    background: "white",
    borderRadius: "24px",
    maxWidth: "550px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  };

  const modalHeaderStyle = {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const modalTitleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
  };

  const modalBodyStyle = {
    padding: "24px",
  };

  const detailRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  };

  const detailLabelStyle = {
    fontSize: "13px",
    fontWeight: "500",
    color: "#64748b",
  };

  const detailValueStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
  };

  if (loading && bookings.length === 0) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: "60px" } },
      React.createElement("div", { className: "loading-spinner" }),
    );
  }

  return React.createElement(
    "div",
    { style: containerStyle },
    React.createElement(
      "div",
      { style: headerStyle },
      React.createElement("h2", { style: titleStyle }, "Bookings Manager"),
      React.createElement(
        "button",
        { onClick: fetchBookings, style: refreshButtonStyle },
        React.createElement(RefreshCw, { size: 16 }),
        "Refresh",
      ),
    ),

    // Stats
    React.createElement(
      "div",
      { style: statsGridStyle },
      React.createElement(
        "div",
        { style: statCardStyle },
        React.createElement("div", { style: statNumberStyle }, stats.total),
        React.createElement("div", { style: statLabelStyle }, "Total Bookings"),
      ),
      React.createElement(
        "div",
        { style: statCardStyle },
        React.createElement(
          "div",
          { style: { ...statNumberStyle, color: "#10b981" } },
          stats.confirmed,
        ),
        React.createElement("div", { style: statLabelStyle }, "Confirmed"),
      ),
      React.createElement(
        "div",
        { style: statCardStyle },
        React.createElement(
          "div",
          { style: { ...statNumberStyle, color: "#f59e0b" } },
          stats.pending,
        ),
        React.createElement("div", { style: statLabelStyle }, "Pending"),
      ),
      React.createElement(
        "div",
        { style: statCardStyle },
        React.createElement(
          "div",
          { style: { ...statNumberStyle, color: "#ef4444" } },
          stats.cancelled,
        ),
        React.createElement("div", { style: statLabelStyle }, "Cancelled"),
      ),
      React.createElement(
        "div",
        { style: statCardStyle },
        React.createElement(
          "div",
          { style: { ...statNumberStyle, color: "#4f46e5" } },
          formatCurrency(stats.revenue),
        ),
        React.createElement("div", { style: statLabelStyle }, "Total Revenue"),
      ),
    ),

    // Filters
    React.createElement(
      "div",
      { style: filterBarStyle },
      React.createElement(
        "div",
        { style: { position: "relative", flex: 1 } },
        React.createElement(Search, {
          size: 16,
          style: {
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
          },
        }),
        React.createElement("input", {
          type: "text",
          placeholder: "Search by name, email or booking ID...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          style: { ...searchInputStyle, width: "100%", paddingLeft: "40px" },
        }),
      ),
      React.createElement(
        "select",
        {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          style: filterSelectStyle,
        },
        React.createElement("option", { value: "all" }, "All Status"),
        React.createElement("option", { value: "confirmed" }, "Confirmed"),
        React.createElement("option", { value: "pending" }, "Pending"),
        React.createElement("option", { value: "cancelled" }, "Cancelled"),
      ),
    ),

    // Bookings Table
    React.createElement(
      "div",
      { style: tableStyle },
      React.createElement(
        "div",
        { style: { overflowX: "auto" } },
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { style: tableHeaderStyle },
            React.createElement("div", null, "Booking Info"),
            React.createElement("div", null, "Customer"),
            React.createElement("div", null, "Check-in"),
            React.createElement("div", null, "Check-out"),
            React.createElement("div", null, "Amount"),
            React.createElement("div", null, "Status"),
            React.createElement("div", null, "Actions"),
          ),
          filteredBookings.map((booking) => {
            const status = getStatusBadge(booking.status);
            const StatusIcon = status.icon;
            return React.createElement(
              "div",
              {
                key: booking.id,
                style: {
                  display: "grid",
                  gridTemplateColumns: isDesktop
                    ? "1.5fr 1.5fr 1fr 1fr 1fr 1fr auto"
                    : "1fr",
                  padding: "16px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  alignItems: "center",
                  gap: "12px",
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { style: { fontWeight: "600", color: "#0f172a" } },
                  booking.booking_reference || "N/A",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    },
                  },
                  formatDate(booking.created_at),
                ),
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { style: { fontWeight: "500" } },
                  booking.customer_name,
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    },
                  },
                  booking.customer_email,
                ),
              ),
              React.createElement(
                "div",
                { style: { fontSize: "14px" } },
                formatDate(booking.check_in_date),
              ),
              React.createElement(
                "div",
                { style: { fontSize: "14px" } },
                formatDate(booking.check_out_date),
              ),
              React.createElement(
                "div",
                { style: { fontWeight: "600", color: "#4f46e5" } },
                formatCurrency(booking.total_amount),
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "span",
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: status.bg,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: status.color,
                    },
                  },
                  React.createElement(StatusIcon, { size: 12 }),
                  status.text,
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: () => viewBookingDetails(booking),
                  style: {
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px",
                    cursor: "pointer",
                  },
                },
                React.createElement(Eye, { size: 14 }),
              ),
            );
          }),
        ),
      ),
      filteredBookings.length === 0 &&
        React.createElement(
          "div",
          { style: { textAlign: "center", padding: "60px", color: "#94a3b8" } },
          "No bookings found",
        ),
    ),

    // Booking Details Modal
    showModal &&
      selectedBooking &&
      React.createElement(
        "div",
        { style: modalOverlayStyle, onClick: () => setShowModal(false) },
        React.createElement(
          "div",
          { style: modalContentStyle, onClick: (e) => e.stopPropagation() },
          React.createElement(
            "div",
            { style: modalHeaderStyle },
            React.createElement(
              "h3",
              { style: modalTitleStyle },
              "Booking Details",
            ),
            React.createElement(
              "button",
              {
                onClick: () => setShowModal(false),
                style: {
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                },
              },
              "×",
            ),
          ),
          React.createElement(
            "div",
            { style: modalBodyStyle },
            React.createElement(
              "div",
              {
                style: {
                  marginBottom: "20px",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  textAlign: "center",
                },
              },
              React.createElement(
                "div",
                { style: { fontSize: "12px", color: "#64748b" } },
                "Booking Reference",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: "18px",
                    fontWeight: "700",
                    fontFamily: "monospace",
                  },
                },
                selectedBooking.booking_reference,
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Guest Name",
              ),
              React.createElement(
                "span",
                { style: detailValueStyle },
                selectedBooking.customer_name,
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Guest Email",
              ),
              React.createElement(
                "span",
                { style: detailValueStyle },
                selectedBooking.customer_email,
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Guest Phone",
              ),
              React.createElement(
                "span",
                { style: detailValueStyle },
                selectedBooking.customer_phone || "Not provided",
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Check-in Date",
              ),
              React.createElement(
                "span",
                { style: detailValueStyle },
                formatDate(selectedBooking.check_in_date),
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Check-out Date",
              ),
              React.createElement(
                "span",
                { style: detailValueStyle },
                formatDate(selectedBooking.check_out_date),
              ),
            ),
            selectedBooking.room_name &&
              React.createElement(
                "div",
                { style: detailRowStyle },
                React.createElement(
                  "span",
                  { style: detailLabelStyle },
                  "Room/Service",
                ),
                React.createElement(
                  "span",
                  { style: detailValueStyle },
                  selectedBooking.room_name,
                ),
              ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Total Amount",
              ),
              React.createElement(
                "span",
                {
                  style: {
                    ...detailValueStyle,
                    fontSize: "18px",
                    color: "#4f46e5",
                  },
                },
                formatCurrency(selectedBooking.total_amount),
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Payment Method",
              ),
              React.createElement(
                "span",
                { style: detailValueStyle },
                selectedBooking.payment_method || "Not specified",
              ),
            ),
            React.createElement(
              "div",
              { style: detailRowStyle },
              React.createElement(
                "span",
                { style: detailLabelStyle },
                "Status",
              ),
              React.createElement(
                "span",
                {
                  style: {
                    ...detailValueStyle,
                    color: getStatusBadge(selectedBooking.status).color,
                  },
                },
                getStatusBadge(selectedBooking.status).text,
              ),
            ),
            selectedBooking.special_requests &&
              React.createElement(
                "div",
                {
                  style: {
                    ...detailRowStyle,
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "8px",
                  },
                },
                React.createElement(
                  "span",
                  { style: detailLabelStyle },
                  "Special Requests",
                ),
                React.createElement(
                  "span",
                  { style: detailValueStyle },
                  selectedBooking.special_requests,
                ),
              ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0",
                },
              },
              selectedBooking.status === "pending" &&
                React.createElement(
                  "button",
                  {
                    onClick: () =>
                      updateBookingStatus(selectedBooking.id, "confirmed"),
                    style: {
                      flex: 1,
                      padding: "12px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontWeight: "600",
                    },
                  },
                  React.createElement(CheckCircle, { size: 16 }),
                  "Confirm Booking",
                ),
              selectedBooking.status === "pending" &&
                React.createElement(
                  "button",
                  {
                    onClick: () =>
                      updateBookingStatus(selectedBooking.id, "cancelled"),
                    style: {
                      flex: 1,
                      padding: "12px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontWeight: "600",
                    },
                  },
                  React.createElement(XCircle, { size: 16 }),
                  "Cancel Booking",
                ),
              React.createElement(
                "button",
                {
                  onClick: () => setShowModal(false),
                  style: {
                    flex: 1,
                    padding: "12px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "500",
                  },
                },
                "Close",
              ),
            ),
          ),
        ),
      ),
  );
}

export default BookingsManager;
