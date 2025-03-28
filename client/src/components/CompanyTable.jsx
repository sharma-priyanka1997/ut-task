import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useCompany } from '../context/CompanyContext';
import { FaCopy, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

const CompanyTable = () => {
  const [companies, setCompanies] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { setSelectedCompany } = useCompany();

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/metadata-list');
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
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
    setErrorMessage('');
    if (!urlInput.trim() || !isValidUrl(urlInput.trim())) {
      setErrorMessage('Please enter a valid domain URL.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    try {
      setLoading(true);
      setSuccessMessage('');
      const payload = { url: urlInput.trim() };
      await axios.post('http://localhost:5000/fetch-metadata', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setUrlInput('');
      setSuccessMessage('Company metadata successfully added.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCompanies();
    } catch (error) {
      console.error('Error adding company:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const header = Object.keys(data[0]);
    const csvRows = [header.join(',')];
    data.forEach((row) => {
      const values = header.map((field) => {
        let val = row[field] ?? '';
        if (typeof val === 'string') {
          val = val.replace(/"/g, '""');
          if (/[",\n]/.test(val)) val = `"${val}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(companies);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'companies.csv');
    link.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group w-50">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter domain name"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button className="btn btn-light btn-sm" style={{ marginLeft: "10px" }} onClick={handleAddCompany} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch & Save Details'}
          </button>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={downloadCSV}>
          Export as CSV
        </button>
      </div>

      {errorMessage && <div className="alert alert-danger py-1">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success py-1">{successMessage}</div>}

      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th></th>
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
            <tr
              key={i}
              onClick={() => {
                setSelectedCompany(c);
                navigate(`/company/${c.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ width: '36px' }}>
                {c.company_logo && (
                  <img
                    src={c.company_logo}
                    alt="logo"
                    className="rounded"
                    style={{ width: '30px', height: '30px' }}
                  />
                )}
              </td>
              <td>{c.name}</td>
              <td>
                <div className="d-flex gap-2">
                  {c.social_facebook && <FaFacebookF size={14} />}
                  {c.social_twitter && <FaTwitter size={14} />}
                  {c.social_linkedin && <FaLinkedinIn size={14} />}
                </div>
              </td>
              <td style={{ maxWidth: '250px' }}>{c.description}</td>
              <td>{c.address || 'San Francisco, United States'}</td>
              <td>
                {c.phone_number || '-'}
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
                {c.email || '-'}
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

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          Showing {itemOffset + 1}-{Math.min(itemOffset + ITEMS_PER_PAGE, companies.length)} of {companies.length}
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
          activeClassName="active"
        />
      </div>
    </div>
  );
};

export default CompanyTable;