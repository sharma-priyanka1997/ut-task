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
import { MdOutlinePlaylistAdd } from "react-icons/md";

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
      setLoading(true);
      const res = await axios.delete(`${baseUrl}delete`, {
        data: { ids: selectedIds },
      });
      fetchCompanies();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to delete records:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm">
      <div className="d-flex align-items-center mb-4">
        <div className="input-group rounded" style={{ maxWidth: "360px" }}>
          <span className="input-group-text bg-light border-end-0">
            <FaSearch size={14} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Enter domain name"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ fontSize: "14px" }}
          />
        </div>
        <button
          className="btn px-4 py-1 fw-semibold border-0 ms-3"
          style={{ backgroundColor: "#E9D7FE", color: "#6941C6" }}
          onClick={handleAddCompany}
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch & Save Details"}
        </button>
      </div>

      <div className="d-flex align-items-center mb-3">
        <span className="text-muted small me-5">
          {selectedIds.length} selected
        </span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={selectedIds.length === 0 || loading}
            onClick={handleDeleteSelected}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={downloadCSV}
          >
            <>
              <MdOutlinePlaylistAdd size={20} />
              Export as CSV
            </>
          </button>
        </div>
      </div>

      <div className="table-responsive rounded border">
        <table className="table align-middle mb-0">
          <thead className="table-light text-muted">
            <tr style={{ fontSize: "13px" }}>
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
              <th>Company</th>
              <th>Social Profiles</th>
              <th>Description</th>
              <th>Address</th>
              <th>Phone No.</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((c, i) => (
              <tr key={i}>
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
                  style={{ cursor: "pointer" }}
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
                  <span style={{ paddingLeft: "5px" }}>{c.name}</span>
                </td>
                <td>
                  <div className="d-flex gap-2 text-muted">
                    {c.social_facebook && <FaFacebookF size={14} />}
                    {c.social_twitter && <FaTwitter size={14} />}
                    {c.social_linkedin && <FaLinkedinIn size={14} />}
                  </div>
                </td>
                <td className="text-muted" style={{ maxWidth: "240px" }}>
                  {c.description?.slice(0, 80)}
                  {c.description?.length > 80 ? "..." : ""}
                </td>
                <td className="text-muted">
                  {c.address || "San Francisco, United States"}
                </td>
                <td>
                  <span className="text-primary small fw-medium">
                    {c.phone_number || "-"}
                  </span>{" "}
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
                  </span>{" "}
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
      </div>

      <div className="d-flex justify-content-between align-items-center pt-3 px-2">
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
  );
};

export default CompanyTable;
