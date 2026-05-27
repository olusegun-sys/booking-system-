import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Image, Upload, Loader } from "lucide-react";
import { showSuccess, showError } from "../../toast";

import API_BASE from "../../config";

function BusinessGallery({ businessId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
    if (businessId) {
      fetchGallery();
    }
  }, [businessId]);

  const fetchGallery = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/businesses/${businessId}/gallery`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.images || []);
      }
    } catch (err) {
      console.error("Fetch gallery error:", err);
    }
    setLoading(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${API_BASE}/api/businesses/${businessId}/gallery`,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        },
      );
      const data = await response.json();
      if (data.success) {
        showSuccess("Image uploaded successfully");
        fetchGallery();
      } else {
        showError(data.error || "Failed to upload image");
      }
    } catch (err) {
      showError("Something went wrong");
    }
    setUploading(false);
  };

  const deleteImage = async (imageId) => {
    if (!confirm("Delete this image?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/businesses/${businessId}/gallery/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        },
      );
      const data = await response.json();
      if (data.success) {
        showSuccess("Image deleted");
        fetchGallery();
      } else {
        showError(data.error || "Failed to delete image");
      }
    } catch (err) {
      showError("Something went wrong");
    }
  };

  const setAsCover = async (imageId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/businesses/${businessId}/gallery/${imageId}/cover`,
        {
          method: "PUT",
          headers: { Authorization: "Bearer " + token },
        },
      );
      const data = await response.json();
      if (data.success) {
        showSuccess("Cover image updated");
        fetchGallery();
      } else {
        showError(data.error || "Failed to update cover");
      }
    } catch (err) {
      showError("Something went wrong");
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: "40px" } },
      React.createElement(Loader, { size: 24, className: "spinner" }),
    );
  }

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const uploadAreaStyle = {
    border: "2px dashed #e2e8f0",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#fafbff",
  };

  const imagesGridStyle = {
    display: "grid",
    gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
    gap: "16px",
  };

  const imageCardStyle = {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#f1f5f9",
    aspectRatio: "1",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const overlayStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  };

  const coverBadgeStyle = {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "#4f46e5",
    color: "white",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "600",
  };

  return React.createElement(
    "div",
    { style: containerStyle },
    React.createElement(
      "label",
      { style: uploadAreaStyle, onDragOver: (e) => e.preventDefault() },
      React.createElement("input", {
        type: "file",
        accept: "image/*",
        onChange: handleFileUpload,
        disabled: uploading,
        style: { display: "none" },
      }),
      uploading
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(Loader, {
              size: 32,
              className: "spinner",
              style: { margin: "0 auto" },
            }),
            React.createElement(
              "p",
              { style: { marginTop: "12px", color: "#64748b" } },
              "Uploading...",
            ),
          )
        : React.createElement(
            React.Fragment,
            null,
            React.createElement(Upload, {
              size: 32,
              color: "#94a3b8",
              style: { margin: "0 auto" },
            }),
            React.createElement(
              "p",
              {
                style: {
                  marginTop: "12px",
                  fontWeight: "500",
                  color: "#475569",
                },
              },
              "Click or drag to upload",
            ),
            React.createElement(
              "p",
              {
                style: { fontSize: "12px", color: "#94a3b8", marginTop: "4px" },
              },
              "JPG, PNG, GIF up to 5MB",
            ),
          ),
    ),

    images.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: "40px", color: "#94a3b8" } },
          React.createElement(Image, { size: 48, style: { margin: "0 auto" } }),
          React.createElement(
            "p",
            { style: { marginTop: "12px" } },
            "No images yet",
          ),
          React.createElement(
            "p",
            { style: { fontSize: "12px" } },
            "Upload your first image above",
          ),
        )
      : React.createElement(
          "div",
          { style: imagesGridStyle },
          images.map((image) =>
            React.createElement(
              "div",
              { key: image.id, style: imageCardStyle },
              image.is_cover &&
                React.createElement("div", { style: coverBadgeStyle }, "Cover"),
              React.createElement("img", {
                src: image.image_url,
                alt: "Gallery",
                style: imageStyle,
              }),
              React.createElement(
                "div",
                { style: overlayStyle },
                !image.is_cover &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => setAsCover(image.id),
                      style: {
                        background: "#4f46e5",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px",
                        cursor: "pointer",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "500",
                      },
                    },
                    "Set as Cover",
                  ),
                React.createElement(
                  "button",
                  {
                    onClick: () => deleteImage(image.id),
                    style: {
                      background: "#ef4444",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "500",
                    },
                  },
                  React.createElement(Trash2, { size: 14 }),
                ),
              ),
            ),
          ),
        ),
  );
}

export default BusinessGallery;
