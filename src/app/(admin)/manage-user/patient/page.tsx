import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PatientTable from "@/components/tables/PatientTable";

export default function PatientPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage User / Patient" />
      <div className="space-y-6">
        <ComponentCard title="Patient List">
          <PatientTable />
        </ComponentCard>
      </div>
    </div>
  );
}
