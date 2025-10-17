import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DoctorTable from "@/components/tables/DoctorTable";

export default function DoctorPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage User / Doctor" />
      <div className="space-y-6">
        <ComponentCard title="Doctor List">
          <DoctorTable />
        </ComponentCard>
      </div>
    </div>
  );
}
