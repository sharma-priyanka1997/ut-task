import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { useCompany } from "../context/CompanyContext";
import {
  FaCopy,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaSearch,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 10;
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const CompanyTable = () => {
  const [companies, setCompanies] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const navigate = useNavigate();
  const { setSelectedCompany } = useCompany();

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${baseUrl}metadata-list`);
      setCompanies(res.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const endOffset = itemOffset + ITEMS_PER_PAGE;
    setCurrentItems(companies.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(companies.length / ITEMS_PER_PAGE));
  }, [itemOffset, companies]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * ITEMS_PER_PAGE) % companies.length;
    setItemOffset(newOffset);
  };

  const isValidUrl = (url) => {
    const domainRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
    return domainRegex.test(url);
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!urlInput.trim() || !isValidUrl(urlInput.trim())) {
      setErrorMessage("Please enter a valid domain URL.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    try {
      setLoading(true);
      setSuccessMessage("");
      const payload = { url: urlInput.trim() };
      await axios.post(`${baseUrl}fetch-metadata`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setUrlInput("");
      setSuccessMessage("Company metadata successfully added.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCompanies();
    } catch (error) {
      console.error("Error adding company:", error);
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";
    const header = Object.keys(data[0]);
    const csvRows = [header.join(",")];
    data.forEach((row) => {
      const values = header.map((field) => {
        let val = row[field] ?? "";
        if (typeof val === "string") {
          val = val.replace(/"/g, '""');
          if (/[",\n]/.test(val)) val = `"${val}"`;
        }
        return val;
      });
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(companies);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "companies.csv");
    link.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await axios.delete(`${baseUrl}delete`, {
        data: { ids: selectedIds },
      });
      console.log(res.data.message);
      // Refresh the list after deletion
      fetchCompanies();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to delete records:", error);
    }
  };

  return (
    <div className="container py-4">
      <div
        className="bg-white rounded shadow-sm p-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="align-items-center mb-3">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="input-group" style={{ width: "30%" }}>
              <span className="input-group-text bg-white border-end-0">
                <FaSearch size={14} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Enter domain name"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{ borderRadius: "0 6px 6px 0", fontSize: "14px" }}
              />
            </div>
            <button
              className="btn btn-sm fw-semibold text-white px-3"
              style={{ backgroundColor: "#E9D7FE" }}
              onClick={handleAddCompany}
              disabled={loading}
            >
              <span style={{ color: "#6941C6" }}>
                {loading ? "Fetching..." : "Fetch & Save Details"}
              </span>
            </button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">
              {selectedIds.length} selected
            </span>
            <button
              className="btn btn-sm btn-light border"
              onClick={handleDeleteSelected}
            >
              Delete
            </button>
            <button className="btn btn-sm btn-light border">
              Export as CSV
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-1 mb-2">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="alert alert-success py-1 mb-2">{successMessage}</div>
        )}

        <table className="table align-middle">
          <thead
            className="table-light text-muted border-top border-bottom"
            style={{ fontSize: "13px" }}
          >
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={
                    currentItems.length > 0 &&
                    currentItems.every((item) => selectedIds.includes(item.id))
                  }
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const ids = currentItems.map((item) => item.id);
                    setSelectedIds(
                      checked
                        ? [...new Set([...selectedIds, ...ids])]
                        : selectedIds.filter((id) => !ids.includes(id))
                    );
                  }}
                />
              </th>
              <th className="fw-semibold">Company</th>
              <th className="fw-semibold">Social Profiles</th>
              <th className="fw-semibold">Description</th>
              <th className="fw-semibold">Address</th>
              <th className="fw-semibold">Phone No.</th>
              <th className="fw-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((c, i) => (
              <tr
                key={i}
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  verticalAlign: "middle",
                }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => {
                      setSelectedIds((prev) =>
                        prev.includes(c.id)
                          ? prev.filter((id) => id !== c.id)
                          : [...prev, c.id]
                      );
                    }}
                  />
                </td>
                <td
                  className="fw-semibold text-dark d-flex align-items-center gap-2"
                  style={{ height: "60px" }}
                  onClick={() => {
                    setSelectedCompany(c);
                    navigate(`/company/${c.id}`);
                  }}
                >
                  {c.company_logo && (
                    <img
                      src={c.company_logo}
                      alt="logo"
                      className="rounded"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <span
                    className="text-primary fw-medium"
                    style={{ fontSize: "14px" }}
                  >
                    {c.name}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2 text-muted">
                    {c.social_facebook && <FaFacebookF size={14} />}
                    {c.social_twitter && <FaTwitter size={14} />}
                    {c.social_linkedin && <FaLinkedinIn size={14} />}
                  </div>
                </td>
                <td className="text-muted fw-normal">{c.description}</td>
                <td className="text-muted small">
                  {c.address || "San Francisco, United States"}
                </td>
                <td>
                  <span className="text-primary small fw-medium">
                    {c.phone_number || "-"}
                  </span>
                  {c.phone_number && (
                    <FaCopy
                      size={12}
                      className="ms-2 text-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.phone_number);
                      }}
                    />
                  )}
                </td>
                <td>
                  <span className="text-primary small fw-medium">
                    {c.email || "-"}
                  </span>
                  {c.email && (
                    <FaCopy
                      size={12}
                      className="ms-2 text-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.email);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center px-2">
          <small className="text-muted">
            Showing {itemOffset + 1}-
            {Math.min(itemOffset + ITEMS_PER_PAGE, companies.length)} of{" "}
            {companies.length}
          </small>
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={pageCount}
            previousLabel="<"
            containerClassName="pagination pagination-sm mb-0"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            nextClassName="page-item"
            previousLinkClassName="page-link"
            nextLinkClassName="page-link"
            activeClassName="active bg-primary border-primary text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyTable;
