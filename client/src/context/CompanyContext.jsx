import { createContext, useState, useContext, useEffect } from "react";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    return storedCompany ? JSON.parse(storedCompany) : null;
  });

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));
    }
  }, [selectedCompany]);

  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);