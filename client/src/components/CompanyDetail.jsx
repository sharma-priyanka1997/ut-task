import { useParams } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import {
  FaEnvelope,
  FaGlobe,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
  FaInfoCircle,
} from "react-icons/fa";

const CompanyDetail = () => {
  const { id } = useParams();
  const { selectedCompany, companies } = useCompany();

  const company =
    selectedCompany || companies.find((c) => c.id.toLowerCase() === id);

  if (!company)
    return <p className="text-center mt-5">Company not found or loading...</p>;

  return (
    <div className="bg-body-secondary">
      <div className="bg-white px-4 py-3 border-bottom mb-3">
        <nav className="d-flex align-items-center gap-2">
          <span
            className="text-primary fw-medium"
            style={{ cursor: "pointer", fontSize: "14px" }}
            onClick={() => window.history.back()}
          >
            Home
          </span>
          <span className="text-muted">›</span>
          <span className="fw-medium text-muted" style={{ fontSize: "14px" }}>
            {company.name}
          </span>
        </nav>
      </div>

      <div className="bg-white p-4 rounded-2 shadow-sm m-1 d-flex gap-4 mb-2">
        <img
          src={company.company_logo}
          alt="logo"
          className="rounded"
          style={{ width: "80px", height: "80px", objectFit: "contain" }}
        />
        <div className="flex-grow-1">
          <h3 className="fw-bold mb-1">{company.name}</h3>
          <p className="text-muted mb-2">
            <FaInfoCircle className="me-2 text-secondary" />
            {company.description}
          </p>
        </div>
        <div className="d-flex flex-column align-items-end justify-content-center">
          <p className="mb-1">
            <FaPhoneAlt className="me-2 text-secondary" />
            {company.phone_number || "-"}
          </p>
          <p>
            <FaEnvelope className="me-2 text-secondary" />
            {company.email || "-"}
          </p>
        </div>
      </div>

      <div className="row g-1">
        <div className="col-md-6">
          <div className="bg-white p-4 rounded-2 m-1 p-3 border rounded shadow-sm">
            <h5 className="fw-bold mb-3">Company Details</h5>
            <p className="mb-2">
              <FaGlobe className="me-2 text-secondary" />
              <a href={company.url} target="_blank" rel="noreferrer">
                {company.url}
              </a>
            </p>
            <p className="mb-2">
              <FaInfoCircle className="me-2 text-secondary" />
              {company.description}
            </p>
            <p className="mb-2">
              <FaEnvelope className="me-2 text-secondary" />
              {company.email || "-"}
            </p>
            {company.facebook && (
              <p className="mb-2">
                <FaFacebookF className="me-2 text-secondary" />
                <a href={company.facebook} target="_blank" rel="noreferrer">
                  {company.facebook}
                </a>
              </p>
            )}
            {company.instagram && (
              <p className="mb-2">
                <FaInstagram className="me-2 text-secondary" />
                <a href={company.instagram} target="_blank" rel="noreferrer">
                  {company.instagram}
                </a>
              </p>
            )}
            {company.twitter && (
              <p className="mb-2">
                <FaTwitter className="me-2 text-secondary" />
                <a href={company.twitter} target="_blank" rel="noreferrer">
                  {company.twitter}
                </a>
              </p>
            )}
            {company.linkedin && (
              <p className="mb-2">
                <FaLinkedinIn className="me-2 text-secondary" />
                <a href={company.linkedin} target="_blank" rel="noreferrer">
                  {company.linkedin}
                </a>
              </p>
            )}
            <p className="mb-0">
              <i className="bi bi-geo-alt me-2 text-secondary" />
              {company.address || "San Francisco, United States"}
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="bg-white p-4 rounded-2 m-1 p-3 border rounded shadow-sm">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-camera me-2" /> Screenshot of Webpage
            </h5>
            <img
              src={company.screenshot}
              alt={`${company.name} screenshot`}
              className="img-fluid rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
