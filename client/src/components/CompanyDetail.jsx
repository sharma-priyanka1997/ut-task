import { useParams } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';

const CompanyDetail = () => {
  const { id } = useParams();
  const { selectedCompany, companies } = useCompany();

  const company =
    selectedCompany ||
    companies.find((c) => c.id.toLowerCase() === (id));

  if (!company) return <p className="text-center mt-5">Company not found or loading...</p>;

  return (
    <div className="row mt-4">
      <div className="col-md-6">
        <h3>{company.name}</h3>
        <p><strong>Phone:</strong> {company.phone_number || '-'}</p>
        <p><strong>Email:</strong> {company.email || '-'}</p>
        <p><strong>Description:</strong> {company.description}</p>
        <p><strong>Website:</strong> <a href={company.url} target="_blank" rel="noreferrer">{company.url}</a></p>
        <div className="mt-3">
          {company.facebook && <p><strong>Facebook:</strong> <a href={company.facebook}>{company.facebook}</a></p>}
          {company.instagram && <p><strong>Instagram:</strong> <a href={company.instagram}>{company.instagram}</a></p>}
          {company.twitter && <p><strong>Twitter:</strong> <a href={company.twitter}>{company.twitter}</a></p>}
          {company.linkedin && <p><strong>LinkedIn:</strong> <a href={company.linkedin}>{company.linkedin}</a></p>}
        </div>
      </div>
      <div className="col-md-6">
        <img
          src={company.screenshot}
          alt={`${company.name} screenshot`}
          className="img-fluid rounded shadow"
        />
      </div>
    </div>
  );
};

export default CompanyDetail;